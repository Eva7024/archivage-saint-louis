// src/app/admin/users.component.ts
import {
  Component, inject, signal, ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Utilisateur, RoleUtilisateur } from '../core/models/models';
import { environment } from '../../environments/environment';
import { ReferentielService } from '../core/services/referentiel.service';

type UserForm = Omit<Utilisateur, 'id' | 'dateCreation'> & { password: string };

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, RouterLink],
  styles: [`
    .page { padding: 1.5rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.25rem;
    }
    h2 { font-size: 1.2rem; font-weight: 500; margin: 0; }

    .card { background: #fff; border-radius: 12px; border: 0.5px solid rgba(0,0,0,0.1); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th {
      padding: 0.65rem 0.85rem; text-align: left;
      font-size: 0.72rem; font-weight: 500; color: #888;
      background: #F1EFE8; border-bottom: 1px solid rgba(0,0,0,0.08);
    }
    td { padding: 0.7rem 0.85rem; border-bottom: 0.5px solid rgba(0,0,0,0.06); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: #EEF5FD; }

    .user-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 500; }
    .user-link { text-decoration: none; color: inherit; }
    .user-link:hover { color: #185FA5; }
    .user-link:hover .avatar { background: #185FA5; color: #fff; }
    .avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: #B5D4F4; color: #0C447C;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 600; flex-shrink: 0;
    }

    .role-badge {
      font-size: 0.7rem; font-weight: 500;
      padding: 0.2rem 0.6rem; border-radius: 10px;
    }
    .r-admin  { background: #E6F1FB; color: #0C447C; }
    .r-chef   { background: #E1F5EE; color: #085041; }
    .r-agent  { background: #F1EFE8; color: #5F5E5A; }
    .r-audit  { background: #FAEEDA; color: #633806; }

    .badge {
      font-size: 0.7rem; font-weight: 500;
      padding: 0.2rem 0.55rem; border-radius: 10px;
    }
    .b-actif   { background: #E1F5EE; color: #085041; }
    .b-inactif { background: #F1EFE8; color: #888; }

    .actions { display: flex; gap: 0.25rem; }
    .icon-btn {
      width: 28px; height: 28px; border-radius: 6px;
      border: 0.5px solid rgba(0,0,0,0.1); background: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 0.85rem;
    }
    .icon-btn:hover        { background: #E6F1FB; }
    .icon-btn.danger:hover { background: #FCEBEB; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal {
      background: #fff; border-radius: 14px; padding: 1.5rem;
      width: 480px; max-width: 95vw;
      box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    }
    .modal h3 { font-size: 1rem; font-weight: 500; margin-bottom: 1.25rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
    .full { grid-column: 1 / -1; }
    .form-field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.78rem; font-weight: 500; color: #555; }
    input, select {
      padding: 0.55rem 0.7rem; border: 1px solid #D3D1C7;
      border-radius: 8px; font-size: 0.875rem; font-family: inherit;
    }
    input:focus, select:focus {
      outline: none; border-color: #185FA5;
      box-shadow: 0 0 0 3px rgba(24,95,165,0.1);
    }
    .alert { padding: 0.6rem; border-radius: 8px; font-size: 0.82rem; margin-top: 0.85rem; }
    .alert.error { background: #FCEBEB; color: #791F1F; }
    .modal-actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
    .btn-primary {
      background: #185FA5; color: #fff; border: none;
      border-radius: 8px; padding: 0.55rem 1rem; font-size: 0.875rem;
      font-weight: 500; cursor: pointer;
    }
    .btn-secondary {
      padding: 0.55rem 1rem; border: 1px solid #ddd;
      border-radius: 8px; font-size: 0.875rem; cursor: pointer;
      background: none; color: #555;
    }
  `],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Utilisateurs</h2>
        <button class="btn-primary" (click)="openModal()">➕ Ajouter un agent</button>
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Agent</th><th>Email</th><th>Service</th>
              <th>Rôle</th><th>Statut</th><th>Créé le</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td>
                  <a [routerLink]="['/users', u.id]" class="user-cell user-link">
                    <div class="avatar">{{ initiales(u) }}</div>
                    {{ u.prenom }} {{ u.nom }}
                  </a>
                </td>
                <td>{{ u.email }}</td>
                <td>{{ u.service || '—' }}</td>
                <td><span class="role-badge" [class]="roleClass(u.role)">{{ u.role }}</span></td>
                <td>
                  <span class="badge" [class]="u.estActif ? 'b-actif' : 'b-inactif'">
                    {{ u.estActif ? '✔ Actif' : '⏸ Inactif' }}
                  </span>
                </td>
                <td>{{ u.dateCreation | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="actions">
                    <button class="icon-btn" (click)="editUser(u)"      title="Modifier">✏️</button>
                    <button class="icon-btn" (click)="toggleActif(u)"   title="Activer/Désactiver">⏸</button>
                    <button class="icon-btn danger" (click)="deleteUser(u)" title="Supprimer">🗑</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" style="text-align:center;padding:2rem;color:#999">Aucun utilisateur</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>{{ editingUser() ? 'Modifier l\'agent' : 'Nouvel agent' }}</h3>

            <div class="form-grid">
              <div class="form-field">
                <label>Prénom *</label>
                <input [(ngModel)]="form.prenom" placeholder="Prénom">
              </div>
              <div class="form-field">
                <label>Nom *</label>
                <input [(ngModel)]="form.nom" placeholder="Nom">
              </div>
              <div class="form-field full">
                <label>Email *</label>
                <input type="email" [(ngModel)]="form.email" placeholder="email@mairie-sl.sn">
              </div>
              @if (!editingUser()) {
                <div class="form-field full">
                  <label>Mot de passe *</label>
                  <input type="password" [(ngModel)]="form.password" placeholder="Minimum 8 caractères">
                </div>
              }
              <div class="form-field">
                <label>Rôle</label>
                <select [(ngModel)]="form.role">
                  <option value="AGENT">AGENT</option>
                  <option value="RESPONSABLE">RESPONSABLE</option>
                  <option value="ARCHIVISTE">ARCHIVISTE</option>
                  <option value="ADMIN_COMMUNAL">ADMIN_COMMUNAL</option>
                  <option value="CONSULTATION">CONSULTATION</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div class="form-field">
                <label>Service</label>
                <select [(ngModel)]="form.service">
                  <option value="">— Choisir —</option>
                  @for (s of referentiels.services(); track s.id) {
                    <option>{{ s.nom }}</option>
                  }
                </select>
              </div>
            </div>

            @if (erreur()) {
              <div class="alert error">{{ erreur() }}</div>
            }

            <div class="modal-actions">
              <button class="btn-primary" (click)="save()">
                {{ editingUser() ? 'Enregistrer' : 'Créer l\'agent' }}
              </button>
              <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly referentiels = inject(ReferentielService);

  readonly users      = signal<Utilisateur[]>([]);
  readonly modalOpen  = signal(false);
  readonly editingUser = signal<Utilisateur | null>(null);
  readonly erreur     = signal('');

  form: UserForm = this.emptyForm();

  ngOnInit(): void { this.load(); this.referentiels.charger(); }

  private load(): void {
    this.http.get<Utilisateur[]>(`${environment.apiUrl}/users`)
      .subscribe(users => this.users.set(users));
  }

  private emptyForm(): UserForm {
    return { nom: '', prenom: '', email: '', password: '',
             role: 'AGENT', service: '', estActif: true };
  }

  openModal(): void {
    this.form = this.emptyForm();
    this.editingUser.set(null);
    this.erreur.set('');
    this.modalOpen.set(true);
  }

  editUser(u: Utilisateur): void {
    this.form = { ...u, password: '' };
    this.editingUser.set(u);
    this.erreur.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void { this.modalOpen.set(false); }

  save(): void {
    const id = this.editingUser()?.id;
    const url = id ? `${environment.apiUrl}/users/${id}` : `${environment.apiUrl}/users`;
    const req = id
      ? this.http.put<Utilisateur>(url, this.form)
      : this.http.post<Utilisateur>(url, this.form);

    req.subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: err => this.erreur.set(err.error?.message ?? 'Erreur')
    });
  }

  toggleActif(u: Utilisateur): void {
    this.http.put<Utilisateur>(`${environment.apiUrl}/users/${u.id}/activer`, null)
      .subscribe(() => this.load());
  }

  deleteUser(u: Utilisateur): void {
    if (confirm(`Désactiver ${u.prenom} ${u.nom} ?`)) {
      this.http.delete(`${environment.apiUrl}/users/${u.id}`)
        .subscribe(() => this.load());
    }
  }

  initiales(u: Utilisateur): string {
    return (u.prenom[0] + u.nom[0]).toUpperCase();
  }

  roleClass(role: RoleUtilisateur): string {
    const map: Record<RoleUtilisateur, string> = {
      ADMIN: 'role-badge r-admin', ADMIN_COMMUNAL: 'role-badge r-admin',
      RESPONSABLE: 'role-badge r-chef', ARCHIVISTE: 'role-badge r-chef',
      AGENT: 'role-badge r-agent', CONSULTATION: 'role-badge r-audit'
    };
    return map[role] ?? 'role-badge';
  }
}
