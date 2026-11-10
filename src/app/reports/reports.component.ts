// src/app/reports/reports.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h2>Rapports</h2>
      <div class="card">
        <h3>Liste complète des documents</h3>
        <p style="font-size:0.88rem">Export au format CSV, ouvrable directement dans Excel.</p>
        @if (erreur()) { <div class="alert error" style="margin-bottom:0.75rem">{{ erreur() }}</div> }
        <button class="btn-primary" (click)="exporter()">⬇ Télécharger le rapport (CSV)</button>
      </div>
    </div>
  `
})
export class ReportsComponent {
  private readonly http = inject(HttpClient);
  protected readonly erreur = signal('');

  protected exporter(): void {
    this.http.get(`${environment.apiUrl}/reports/documents.csv`, { responseType: 'blob' }).subscribe({
      next: blob => {
        const lien = document.createElement('a');
        lien.href = URL.createObjectURL(blob);
        lien.download = 'rapport-documents.csv';
        lien.click();
      },
      error: () => this.erreur.set("Impossible de générer le rapport")
    });
  }
}
