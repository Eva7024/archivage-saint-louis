// src/app/profile/profile.component.ts
import {
  Component,
  effect,
  inject,
  input,
  signal,
  computed,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/services/auth.service';
import { Utilisateur } from '../core/models/models';

/** Affiche « Mon profil » (/profile) ou le profil d'un agent (/users/:id). */
@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  styles: [
    `
      .entete {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #b5d4f4;
        color: #0c447c;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.1rem;
      }
      .infos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.9rem 1.5rem;
        margin-top: 1.25rem;
      }
      .infos dt {
        font-size: 0.72rem;
        color: #888;
      }
      .infos dd {
        margin: 0.15rem 0 0;
      }
    `,
  ],
  template: `
    <div class="page">
      <h2>{{ estMonProfil() ? 'Mon profil' : 'Profil agent' }}</h2>

      @if (utilisateur(); as u) {
        <div class="card">
          <div class="entete">
            <div class="avatar">{{ u.prenom[0] }}{{ u.nom[0] }}</div>
            <div>
              <b>{{ u.prenom }} {{ u.nom }}</b
              ><br /><span class="badge st-SOUMIS">{{ u.role }}</span>
            </div>
          </div>
          <dl class="infos">
            <div>
              <dt>E-mail</dt>
              <dd>{{ u.email }}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{{ u.service || '—' }}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>{{ u.estActif ? 'Actif' : 'Inactif' }}</dd>
            </div>
            <div>
              <dt>Compte créé le</dt>
              <dd>{{ u.dateCreation | date: 'dd/MM/yyyy' }}</dd>
            </div>
          </dl>
        </div>

        @if (estMonProfil()) {
          <div class="card">
            <h3>Changer mon mot de passe</h3>
            <div class="form-grid">
              <div class="form-field">
                <label>Mot de passe actuel</label><input type="password" [(ngModel)]="ancien" />
              </div>
              <div class="form-field">
                <label>Nouveau mot de passe (8 caractères min.)</label
                ><input type="password" [(ngModel)]="nouveau" />
              </div>
            </div>
            @if (message()) {
              <div class="alert ok" style="margin-top:0.85rem">{{ message() }}</div>
            }
            @if (erreur()) {
              <div class="alert error" style="margin-top:0.85rem">{{ erreur() }}</div>
            }
            <button class="btn-primary" style="margin-top:1rem" (click)="changerMotDePasse()">
              Enregistrer
            </button>
          </div>
        }
      } @else {
        <div class="card vide">Chargement…</div>
      }
    </div>
  `,
})
export class ProfileComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  readonly id = input<string>(); // présent seulement pour /users/:id
  protected readonly utilisateur = signal<Utilisateur | null>(null);
  protected readonly estMonProfil = computed(
    () => !this.id() || Number(this.id()) === this.auth.utilisateur()?.id,
  );
  protected readonly message = signal('');
  protected readonly erreur = signal('');
  protected ancien = '';
  protected nouveau = '';

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.charger(id));
    });
  }

  private charger(id?: string): void {
    const url = id ? `${environment.apiUrl}/users/${id}` : `${environment.apiUrl}/me`;
    this.http.get<Utilisateur>(url).subscribe((u) => this.utilisateur.set(u));
  }

  protected changerMotDePasse(): void {
    this.message.set('');
    this.erreur.set('');
    this.http
      .post<void>(`${environment.apiUrl}/me/password`, {
        ancien: this.ancien,
        nouveau: this.nouveau,
      })
      .subscribe({
        next: () => {
          this.message.set('Mot de passe modifié');
          this.ancien = this.nouveau = '';
        },
        error: (err) => this.erreur.set(err.error?.message ?? 'Échec'),
      });
  }
}
