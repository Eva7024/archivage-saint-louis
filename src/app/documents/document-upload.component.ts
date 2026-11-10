// src/app/documents/document-upload.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentService } from '../core/services/document.service';
import { ReferentielService } from '../core/services/referentiel.service';
import { CONFIDENTIALITES } from '../core/models/models';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h2>Déposer un document</h2>

      <div class="card">
        <div class="form-grid">
          <div class="form-field full"><label>Titre *</label><input [(ngModel)]="form.titre" placeholder="Titre du document"></div>
          <div class="form-field"><label>Référence</label><input [(ngModel)]="form.reference" placeholder="N° d'enregistrement"></div>
          <div class="form-field">
            <label>Type de document</label>
            <select [(ngModel)]="form.typeDocument">
              @for (t of types; track t) { <option>{{ t }}</option> }
            </select>
          </div>
          <div class="form-field">
            <label>Service</label>
            <select [(ngModel)]="form.serviceId">
              <option value="">— Choisir —</option>
              @for (s of referentiels.services(); track s.id) { <option [value]="s.id">{{ s.nom }}</option> }
            </select>
          </div>
          <div class="form-field">
            <label>Catégorie</label>
            <select [(ngModel)]="form.categorieId">
              <option value="">— Choisir —</option>
              @for (c of referentiels.categories(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
            </select>
          </div>
          <div class="form-field">
            <label>Confidentialité</label>
            <select [(ngModel)]="form.niveau">
              @for (n of niveaux; track n) { <option>{{ n }}</option> }
            </select>
          </div>
          <div class="form-field"><label>Durée de conservation (ans)</label><input type="number" [(ngModel)]="form.duree"></div>
          <div class="form-field"><label>Date du document</label><input type="date" [(ngModel)]="form.date"></div>
          <div class="form-field"><label>Mots-clés</label><input [(ngModel)]="form.motsCles" placeholder="budget, 2026, mairie"></div>
          <div class="form-field full"><label>Description</label><textarea rows="3" [(ngModel)]="form.description"></textarea></div>
          <div class="form-field full">
            <label>Fichier * (PDF, Word, Excel, image)</label>
            <input type="file" (change)="choisir($event)">
          </div>
        </div>

        @if (erreur()) { <div class="alert error" style="margin-top:1rem">{{ erreur() }}</div> }

        <div style="display:flex; gap:0.75rem; margin-top:1.25rem">
          <button class="btn-primary" (click)="deposer()" [disabled]="!fichier() || !form.titre.trim() || envoi()">
            {{ envoi() ? 'Envoi…' : 'Enregistrer le document' }}
          </button>
          <button class="btn-secondary" (click)="router.navigate(['/documents'])">Annuler</button>
        </div>
      </div>
    </div>
  `
})
export class DocumentUploadComponent {
  protected readonly router = inject(Router);
  private readonly documents = inject(DocumentService);
  protected readonly referentiels = inject(ReferentielService);

  protected readonly types = ['Courrier arrivé', 'Courrier départ', 'Arrêté', 'Délibération', 'Document financier', 'Dossier agent', 'Plan / étude'];
  protected readonly niveaux = CONFIDENTIALITES;

  protected form = { titre: '', reference: '', typeDocument: 'Courrier arrivé', serviceId: '', categorieId: '',
                     niveau: 'INTERNE', duree: 10, date: '', motsCles: '', description: '' };
  protected readonly fichier = signal<File | null>(null);
  protected readonly erreur = signal('');
  protected readonly envoi = signal(false);

  protected choisir(e: Event): void {
    this.fichier.set((e.target as HTMLInputElement).files?.[0] ?? null);
  }

  protected deposer(): void {
    const fichier = this.fichier();
    if (!fichier) return;

    // Noms des champs attendus par le backend
    const champs: Record<string, string | number> = {
      titre: this.form.titre, reference: this.form.reference, type_document: this.form.typeDocument,
      service_id: this.form.serviceId, category_id: this.form.categorieId,
      niveau_confidentialite: this.form.niveau, duree_conservation_ans: this.form.duree,
      date_document: this.form.date, mots_cles: this.form.motsCles, description: this.form.description
    };
    const donnees = new FormData();
    donnees.append('file', fichier);
    for (const [cle, valeur] of Object.entries(champs)) if (valeur !== '') donnees.append(cle, String(valeur));

    this.envoi.set(true);
    this.erreur.set('');
    this.documents.deposer(donnees).subscribe({
      next: r => this.router.navigate(['/documents', r.id]),
      error: err => { this.erreur.set(err.error?.message ?? 'Échec du dépôt'); this.envoi.set(false); }
    });
  }
}
