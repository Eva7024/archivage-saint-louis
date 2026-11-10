// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LIBELLE_STATUT, STATUTS, Statistiques } from '../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.85rem; }
    .kpi { background: #fff; border: 0.5px solid rgba(0,0,0,0.1); border-top: 4px solid var(--bleu); border-radius: 12px; padding: 0.9rem 1rem; }
    .kpi span { font-size: 0.78rem; color: #888; } .kpi b { display: block; font-size: 1.9rem; font-weight: 500; color: var(--bleu); }
    .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }

    /* Parcours des documents */
    .entonnoir { display: flex; gap: 4px; }
    .etape { padding: 0.9rem 0.5rem; border-radius: 8px; text-align: center; min-width: 70px; }
    .etape b { display: block; font-size: 1.4rem; font-weight: 500; } .etape span { font-size: 0.75rem; }

    .jauge { width: 100%; max-width: 240px; display: block; margin: 0 auto; }
    .courbe { width: 100%; }
    .barre { display: grid; grid-template-columns: 140px 1fr 30px; gap: 0.5rem; align-items: center; margin: 0.4rem 0; font-size: 0.82rem; }
    .barre i { height: 12px; background: var(--bleu); border-radius: 6px; display: block; }
    .alerte { padding: 0.45rem 0.7rem; margin: 0.35rem 0; background: #F7F8FA; border-left: 4px solid var(--bleu); border-radius: 4px; font-size: 0.82rem; }
    .flux { padding: 0.4rem 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); font-size: 0.84rem; }
    .doux { color: #888; font-size: 0.8rem; }
  `],
  template: `
    <div class="page">
      <h2>Cockpit des archives</h2>

      @if (stats(); as s) {
        <div class="kpis">
          <div class="kpi"><span>Documents</span><b>{{ s.total }}</b></div>
          <div class="kpi"><span>À valider</span><b>{{ compte('SOUMIS') }}</b></div>
          <div class="kpi"><span>Consultations (30 jours)</span><b>{{ s.consultations }}</b></div>
          <div class="kpi"><span>Échéances sous 12 mois</span><b>{{ s.echeances.length }}</b></div>
        </div>

        <div class="card">
          <h3>Parcours des documents</h3>
          <div class="entonnoir">
            @for (e of entonnoir(); track e.statut) {
              <div class="etape badge st-{{ e.statut }}" [style.flex]="e.n || 0.45">
                <b>{{ e.n }}</b><span>{{ e.libelle }}</span>
              </div>
            }
          </div>
        </div>

        <div class="grille">
          <div class="card">
            <h3>Qualité des métadonnées</h3>
            <svg viewBox="0 0 140 80" class="jauge" role="img" [attr.aria-label]="'Indice de qualité ' + s.qualite + ' %'">
              <path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke="#D3D1C7" stroke-width="12" stroke-linecap="round"/>
              <path d="M10 70 A60 60 0 0 1 130 70" fill="none" stroke="#185FA5" stroke-width="12" stroke-linecap="round"
                    [attr.stroke-dasharray]="(s.qualite * 1.885) + ' 189'"/>
              <text x="70" y="68" text-anchor="middle" font-size="22" fill="#2c2c2a">{{ s.qualite }} %</text>
            </svg>
            <p class="doux">Part des documents dont la référence, les mots-clés, le service et la catégorie sont renseignés.</p>
          </div>

          <div class="card">
            <h3>Dépôts des 6 derniers mois</h3>
            <svg viewBox="0 0 300 90" class="courbe">
              <polyline [attr.points]="points()" fill="none" stroke="#185FA5" stroke-width="3"/>
              @for (p of serie(); track p.label) {
                <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" fill="#0C447C"/>
                <text [attr.x]="p.x" y="88" text-anchor="middle" font-size="9" fill="#888">{{ p.label.slice(5) }}</text>
              }
            </svg>
          </div>
        </div>

        <div class="grille">
          <div class="card">
            <h3>Documents par service</h3>
            @for (b of s.parService; track b.label) {
              <div class="barre"><span>{{ b.label }}</span><i [style.width.%]="100 * b.n / maxService()"></i><b>{{ b.n }}</b></div>
            }
          </div>
          <div class="card">
            <h3>Échéances de conservation</h3>
            @for (e of s.echeances; track e.id) { <div class="alerte"><b>{{ e.echeance }}</b> · {{ e.reference }} {{ e.titre }}</div> }
            @empty { <p class="doux">Aucune échéance dans les 12 prochains mois.</p> }
          </div>
        </div>

        <div class="card">
          <h3>Activité en direct</h3>
          @for (a of s.activite; track $index) {
            <div class="flux"><b>{{ a.utilisateur }}</b> {{ a.action }} <span class="doux">{{ a.description }}</span></div>
          }
        </div>
      } @else {
        <div class="card vide">Chargement…</div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly stats = signal<Statistiques | null>(null);

  ngOnInit(): void {
    this.http.get<Statistiques>(`${environment.apiUrl}/stats`).subscribe(s => this.stats.set(s));
  }

  protected compte(statut: string): number {
    return this.stats()?.parStatut.find(x => x.label === statut)?.n ?? 0;
  }

  protected readonly entonnoir = computed(() =>
    STATUTS.map(s => ({ statut: s, libelle: LIBELLE_STATUT[s], n: this.compte(s) })));

  protected readonly maxService = computed(() => Math.max(1, ...(this.stats()?.parService.map(x => x.n) ?? [1])));

  /** Points de la courbe des dépôts mensuels. */
  protected readonly serie = computed(() => {
    const mois = this.stats()?.parMois ?? [];
    const max = Math.max(1, ...mois.map(m => m.n));
    return mois.map((m, i) => ({ ...m, x: mois.length > 1 ? 15 + i * (270 / (mois.length - 1)) : 150, y: 70 - 55 * m.n / max }));
  });
  protected readonly points = computed(() => this.serie().map(p => `${p.x},${p.y}`).join(' '));
}
