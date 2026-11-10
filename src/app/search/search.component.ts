// src/app/search/search.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../core/services/document.service';
import { ReferentielService } from '../core/services/referentiel.service';
import { CONFIDENTIALITES, DocumentArchive, LIBELLE_STATUT, STATUTS } from '../core/models/models';

/** Critères de recherche (noms attendus par le backend). */
type Filtres = { q: string; service_id: string; category_id: string; statut: string; niveau_confidentialite: string; annee: string };

@Component({
  selector: 'app-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <h2>Recherche avancée</h2>

      <div class="card">
        <div class="form-grid">
          <div class="form-field full"><label>Mot-clé (titre, référence, description)</label><input [(ngModel)]="f.q" (keyup.enter)="chercher()"></div>
          <div class="form-field">
            <label>Service</label>
            <select [(ngModel)]="f.service_id"><option value="">Tous</option>
              @for (s of referentiels.services(); track s.id) { <option [value]="s.id">{{ s.nom }}</option> }</select>
          </div>
          <div class="form-field">
            <label>Catégorie</label>
            <select [(ngModel)]="f.category_id"><option value="">Toutes</option>
              @for (c of referentiels.categories(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select>
          </div>
          <div class="form-field">
            <label>Statut</label>
            <select [(ngModel)]="f.statut"><option value="">Tous</option>
              @for (s of statuts; track s) { <option [value]="s">{{ libelle[s] }}</option> }</select>
          </div>
          <div class="form-field">
            <label>Confidentialité</label>
            <select [(ngModel)]="f.niveau_confidentialite"><option value="">Toutes</option>
              @for (n of niveaux; track n) { <option>{{ n }}</option> }</select>
          </div>
          <div class="form-field"><label>Année du document</label><input [(ngModel)]="f.annee" placeholder="2026"></div>
        </div>
        <div style="display:flex; gap:0.75rem; margin-top:1rem">
          <button class="btn-primary" (click)="chercher()">Rechercher</button>
          <button class="btn-secondary" (click)="reinitialiser()">Réinitialiser</button>
        </div>
      </div>

      @if (resultats(); as r) {
        <div class="card sans-marge">
          <table>
            <thead><tr><th>Référence</th><th>Titre</th><th>Service</th><th>Catégorie</th><th>Statut</th></tr></thead>
            <tbody>
              @for (d of r; track d.id) {
                <tr><td>{{ d.reference || '—' }}</td><td><a [routerLink]="['/documents', d.id]">{{ d.titre }}</a></td>
                    <td>{{ d.service || '—' }}</td><td>{{ d.categorie || '—' }}</td>
                    <td><span class="badge st-{{ d.statut }}">{{ libelle[d.statut] }}</span></td></tr>
              } @empty { <tr><td colspan="5" class="vide">Aucun résultat.</td></tr> }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class SearchComponent {
  private readonly documents = inject(DocumentService);
  protected readonly referentiels = inject(ReferentielService);
  protected readonly statuts = STATUTS;
  protected readonly niveaux = CONFIDENTIALITES;
  protected readonly libelle = LIBELLE_STATUT;

  protected f: Filtres = this.vide();
  protected readonly resultats = signal<DocumentArchive[] | null>(null);

  private vide(): Filtres {
    return { q: '', service_id: '', category_id: '', statut: '', niveau_confidentialite: '', annee: '' };
  }
  protected chercher(): void { this.documents.lister(this.f).subscribe(r => this.resultats.set(r)); }
  protected reinitialiser(): void { this.f = this.vide(); this.resultats.set(null); }
}
