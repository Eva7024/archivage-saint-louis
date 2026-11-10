// src/app/core/services/notification.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationGed } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/notifications`;

  /** Nombre de notifications non lues (affiché dans l'en-tête). */
  readonly nonLues = signal(0);

  lister() { return this.http.get<NotificationGed[]>(this.url); }
  rafraichir(): void { this.lister().subscribe(l => this.nonLues.set(l.filter(n => !n.lu).length)); }
  toutLire() { return this.http.post<void>(`${this.url}/read`, null); }
}
