// src/app/documents/document-detail.component.ts
import { Component, effect, inject, input, signal, untracked, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../core/services/document.service';
import { AuthService } from '../core/services/auth.service';
import { DocumentArchive, LIBELLE_STATUT, VersionDocument } from '../core/models/models';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  styles: [`
    .infos { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.9rem 1.5rem; }
    .infos dt { font-size: 0.72rem; color: #888; } .infos dd { margin: 0.15rem 0 0; font-size: 0.9rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .version { padding: 0.5rem 0; border-bottom: 0.5px solid rgba(0,0,0,0.06); font-size: 0.85rem; }
  `],
  template: `
    <div class="page">
      <a routerLink="/documents" style="color:var(--bleu); font-size:0.85rem">← Retour aux documents</a>

      @if (doc(); as d) {
        <div class="page-header">
          <h2>{{ d.titre }}</h2>
          <span class="badge st-{{ d.statut }}">{{ libelle[d.statut] }}</span>
        </div>

        @if (message()) { <div class="alert ok">{{ message() }}</div> }
        @if (erreur()) { <div class="alert error">{{ erreur() }}</div> }

        <div class="card">
          <dl class="infos">
            <div><dt>Référence</dt><dd>{{ d.reference || '—' }}</dd></div>
            <div><dt>Type</dt><dd>{{ d.typeDocument || '—' }}</dd></div>
            <div><dt>Service</dt><dd>{{ d.service || '—' }}</dd></div>
            <div><dt>Catégorie</dt><dd>{{ d.categorie || '—' }}</dd></div>
            <div><dt>Confidentialité</dt><dd>{{ d.niveau }}</dd></div>
            <div><dt>Auteur</dt><dd>{{ d.auteur || '—' }}</dd></div>
            <div><dt>Date du document</dt><dd>{{ d.dateDocument | date:'dd/MM/yyyy' }}</dd></div>
            <div><dt>Date d'archivage</dt><dd>{{ d.dateArchivage ? (d.dateArchivage | date:'dd/MM/yyyy') : '—' }}</dd></div>
            <div><dt>Conservation</dt><dd>{{ d.dureeConservation }} ans</dd></div>
            <div><dt>Mots-clés</dt><dd>{{ d.motsCles || '—' }}</dd></div>
          </dl>
          @if (d.description) { <p style="margin:1rem 0 0; font-size:0.88rem">{{ d.description }}</p> }
        </div>

        <div class="card">
          <h3>Actions</h3>
          <div class="actions">
            <button class="btn-secondary" (click)="documents.ouvrir(d.id, 'view')">👁 Voir</button>
            <button class="btn-secondary" (click)="documents.ouvrir(d.id, 'download')">⬇ Télécharger</button>

            @if (!auth.aRole('CONSULTATION') && (d.statut === 'BROUILLON' || d.statut === 'REJETE')) {
              <button class="btn-primary" (click)="lancer('submit')">Soumettre pour validation</button>
            }
            @if (auth.aRole('ADMIN', 'ADMIN_COMMUNAL', 'RESPONSABLE') && d.statut === 'SOUMIS') {
              <button class="btn-primary" (click)="lancer('validate')">✔ Valider</button>
              <button class="btn-secondary" (click)="lancer('reject')">✖ Rejeter</button>
            }
            @if (auth.aRole('ADMIN', 'ADMIN_COMMUNAL', 'ARCHIVISTE') && d.statut === 'VALIDE') {
              <button class="btn-primary" (click)="lancer('archive')">Archiver</button>
            }
            @if (auth.aRole('ADMIN', 'ADMIN_COMMUNAL', 'ARCHIVISTE') && d.statut === 'ARCHIVE' && !d.historique) {
              <button class="btn-secondary" (click)="lancer('historique')">Classer en archive historique</button>
            }
          </div>
        </div>

        <div class="card">
          <h3>Versions du document</h3>
          @for (v of versions(); track v.id) {
            <div class="version">Version {{ v.version }} · {{ v.auteur }} · {{ v.dateCreation | date:'dd/MM/yyyy HH:mm' }}</div>
          }
          @if (!auth.aRole('CONSULTATION')) {
            <p><button class="btn-secondary" (click)="fichier.click()">+ Ajouter une nouvelle version</button>
               <input #fichier type="file" hidden (change)="nouvelleVersion($event, d.id)"></p>
          }
        </div>
      } @else {
        <div class="card vide">Chargement…</div>
      }
    </div>
  `
})
export class DocumentDetailComponent {
  protected readonly auth = inject(AuthService);
  protected readonly documents = inject(DocumentService);

  readonly id = input.required<string>();   // paramètre :id de l'adresse
  protected readonly doc = signal<DocumentArchive | null>(null);
  protected readonly versions = signal<VersionDocument[]>([]);
  protected readonly message = signal('');
  protected readonly erreur = signal('');
  protected readonly libelle = LIBELLE_STATUT;

  constructor() {
    effect(() => { const id = this.id(); untracked(() => this.charger(id)); });
  }

  private charger(id: string): void {
    this.documents.detail(id).subscribe({
      next: d => this.doc.set(d),
      error: err => this.erreur.set(err.error?.message ?? 'Document introuvable')
    });
    this.documents.versions(id).subscribe(v => this.versions.set(v));
  }

  protected lancer(action: string): void {
    const d = this.doc(); if (!d) return;
    this.erreur.set('');
    this.documents.workflow(d.id, action).subscribe({
      next: () => { this.message.set('Action effectuée'); this.charger(String(d.id)); },
      error: err => this.erreur.set(err.error?.message ?? 'Action impossible')
    });
  }

  protected nouvelleVersion(e: Event, id: number): void {
    const fichier = (e.target as HTMLInputElement).files?.[0]; if (!fichier) return;
    this.documents.ajouterVersion(id, fichier).subscribe({
      next: () => { this.message.set('Nouvelle version enregistrée'); this.charger(String(id)); },
      error: err => this.erreur.set(err.error?.message ?? 'Échec')
    });
  }
}
