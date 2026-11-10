// src/app/documents/documents-list.component.ts
import { Component, effect, inject, input, signal, computed, untracked, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../core/services/document.service';
import { AuthService } from '../core/services/auth.service';
import { DocumentArchive, LIBELLE_STATUT, STATUTS } from '../core/models/models';

/**
 * Liste des documents. Les paramètres d'adresse (query params) permettent de réutiliser
 * ce composant :  /documents?statut=SOUMIS (à valider)  et  /documents?historique=1 (archives historiques)
 */
@Component({
  selector: 'app-documents-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>{{ titre() }}</h2>
        @if (!auth.aRole('CONSULTATION')) { <a class="btn-primary" routerLink="/documents/upload">➕ Déposer un document</a> }
      </div>

      <div class="card filtres">
        <input [(ngModel)]="q" (keyup.enter)="charger()" placeholder="Titre, référence ou mot-clé">
        <select [(ngModel)]="statutChoisi" (ngModelChange)="charger()">
          <option value="">Tous les statuts</option>
          @for (s of statuts; track s) { <option [value]="s">{{ libelle[s] }}</option> }
        </select>
        <button class="btn-primary" (click)="charger()">Rechercher</button>
      </div>

      <div class="card sans-marge">
        <table>
          <thead><tr><th>Référence</th><th>Titre</th><th>Service</th><th>Confidentialité</th><th>Statut</th><th>Date</th></tr></thead>
          <tbody>
            @for (d of liste(); track d.id) {
              <tr>
                <td>{{ d.reference || '—' }}</td>
                <td><a [routerLink]="['/documents', d.id]">{{ d.titre }}</a></td>
                <td>{{ d.service || '—' }}</td>
                <td>{{ d.niveau }}</td>
                <td><span class="badge st-{{ d.statut }}">{{ libelle[d.statut] }}</span></td>
                <td>{{ d.dateDocument | date:'dd/MM/yyyy' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="vide">Aucun document ne correspond à ces critères.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DocumentsListComponent {
  protected readonly auth = inject(AuthService);
  private readonly documents = inject(DocumentService);

  readonly statut = input<string>();       // ?statut=...
  readonly historique = input<string>();   // ?historique=1

  protected readonly liste = signal<DocumentArchive[]>([]);
  protected readonly statuts = STATUTS;
  protected readonly libelle = LIBELLE_STATUT;
  protected q = '';
  protected statutChoisi = '';

  protected readonly titre = computed(() =>
    this.historique() ? 'Archives historiques' : this.statut() === 'SOUMIS' ? 'Documents à valider' : 'Documents');

  constructor() {
    // Recharge la liste quand l'adresse change (ex. clic sur « À valider » dans le menu)
    effect(() => {
      this.statutChoisi = this.statut() ?? '';
      this.historique();
      untracked(() => this.charger());
    });
  }

  protected charger(): void {
    this.documents.lister({ q: this.q, statut: this.statutChoisi, historique: this.historique() })
      .subscribe(l => this.liste.set(l));
  }
}
