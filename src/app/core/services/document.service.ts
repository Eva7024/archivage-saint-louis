// src/app/core/services/document.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DocumentArchive, VersionDocument } from '../models/models';

/** Tous les appels liés aux documents : recherche, dépôt, workflow, versions, fichiers. */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/documents`;

  /** Liste / recherche multicritère (les filtres vides sont ignorés). */
  lister(filtres: Record<string, string | undefined> = {}) {
    let params = new HttpParams();
    for (const [cle, valeur] of Object.entries(filtres)) if (valeur) params = params.set(cle, valeur);
    return this.http.get<DocumentArchive[]>(this.base, { params });
  }

  detail(id: number | string) { return this.http.get<DocumentArchive>(`${this.base}/${id}`); }
  deposer(donnees: FormData) { return this.http.post<{ id: number }>(this.base, donnees); }

  /** action : submit | validate | reject | archive | historique */
  workflow(id: number, action: string) { return this.http.post<void>(`${this.base}/${id}/workflow/${action}`, null); }

  versions(id: number | string) { return this.http.get<VersionDocument[]>(`${this.base}/${id}/versions`); }
  ajouterVersion(id: number, fichier: File) {
    const donnees = new FormData();
    donnees.append('file', fichier);
    return this.http.post<void>(`${this.base}/${id}/versions`, donnees);
  }

  /** Télécharge le fichier avec le jeton, puis l'affiche ou l'enregistre. */
  ouvrir(id: number, mode: 'view' | 'download'): void {
    this.http.get(`${this.base}/${id}/file`, { params: { mode }, responseType: 'blob' }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      if (mode === 'view') { window.open(url); return; }
      const lien = document.createElement('a');
      lien.href = url; lien.download = `document-${id}`; lien.click();
    });
  }
}
