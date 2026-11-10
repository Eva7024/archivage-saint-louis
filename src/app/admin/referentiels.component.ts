// src/app/admin/referentiels.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReferentielService } from '../core/services/referentiel.service';

/** Gestion des services communaux et des catégories de classement. */
@Component({
  selector: 'app-referentiels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styles: [`
    .grille { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; }
    .ajout { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; } .ajout input { flex: 1; }
    .element { padding: 0.5rem 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); font-size: 0.88rem; }
  `],
  template: `
    <div class="page">
      <h2>Services et catégories</h2>
      @if (erreur()) { <div class="alert error">{{ erreur() }}</div> }

      <div class="grille">
        <div class="card">
          <h3>Services communaux</h3>
          <div class="ajout">
            <input [(ngModel)]="nouveauService" placeholder="Nouveau service" (keyup.enter)="ajouter('services')">
            <button class="btn-primary" (click)="ajouter('services')">Ajouter</button>
          </div>
          @for (s of referentiels.services(); track s.id) { <div class="element">{{ s.nom }}</div> }
        </div>

        <div class="card">
          <h3>Catégories de classement</h3>
          <div class="ajout">
            <input [(ngModel)]="nouvelleCategorie" placeholder="Nouvelle catégorie" (keyup.enter)="ajouter('categories')">
            <button class="btn-primary" (click)="ajouter('categories')">Ajouter</button>
          </div>
          @for (c of referentiels.categories(); track c.id) { <div class="element">{{ c.nom }}</div> }
        </div>
      </div>
    </div>
  `
})
export class ReferentielsComponent {
  protected readonly referentiels = inject(ReferentielService);
  protected nouveauService = '';
  protected nouvelleCategorie = '';
  protected readonly erreur = signal('');

  protected ajouter(type: 'services' | 'categories'): void {
    const nom = (type === 'services' ? this.nouveauService : this.nouvelleCategorie).trim();
    if (!nom) return;
    this.referentiels.ajouter(type, nom).subscribe({
      next: () => { this.referentiels.charger(); this.nouveauService = this.nouvelleCategorie = ''; this.erreur.set(''); },
      error: err => this.erreur.set(err.error?.message ?? 'Ajout impossible')
    });
  }
}
