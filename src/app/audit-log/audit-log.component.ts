// src/app/audit-log/audit-log.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EntreeJournal } from '../core/models/models';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <div class="page">
      <h2>Journal d'activité</h2>
      <div class="card sans-marge">
        <table>
          <thead><tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Détail</th></tr></thead>
          <tbody>
            @for (e of entrees(); track e.id) {
              <tr><td>{{ e.dateAction | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ e.utilisateur || '—' }}</td>
                  <td><span class="badge st-SOUMIS">{{ e.action }}</span></td><td>{{ e.description }}</td></tr>
            } @empty { <tr><td colspan="4" class="vide">Aucune activité enregistrée.</td></tr> }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AuditLogComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly entrees = signal<EntreeJournal[]>([]);

  ngOnInit(): void {
    this.http.get<EntreeJournal[]>(`${environment.apiUrl}/audit`).subscribe(l => this.entrees.set(l));
  }
}
