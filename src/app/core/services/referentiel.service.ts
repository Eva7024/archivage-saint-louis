// src/app/core/services/referentiel.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Referentiel } from '../models/models';

/** Listes de référence : services communaux et catégories de classement. */
@Injectable({ providedIn: 'root' })
export class ReferentielService {
  private readonly http = inject(HttpClient);
  readonly services = signal<Referentiel[]>([]);
  readonly categories = signal<Referentiel[]>([]);

  charger(): void {
    this.http.get<Referentiel[]>(`${environment.apiUrl}/services`).subscribe(l => this.services.set(l));
    this.http.get<Referentiel[]>(`${environment.apiUrl}/categories`).subscribe(l => this.categories.set(l));
  }

  ajouter(type: 'services' | 'categories', nom: string) {
    return this.http.post<void>(`${environment.apiUrl}/${type}`, { nom });
  }
}
