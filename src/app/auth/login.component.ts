// src/app/auth/login.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  styles: [`
    .fond { min-height: 100vh; display: grid; place-items: center; background: var(--bleu-clair); }
    .carte { background: #fff; border-radius: 14px; padding: 2rem; width: 380px; max-width: 92vw;
             display: grid; gap: 0.9rem; text-align: center; box-shadow: 0 12px 40px rgba(24,95,165,0.15); }
    .logo { height: 96px; width: auto; margin: 0 auto; }
    h1 { font-size: 1.1rem; font-weight: 500; color: var(--bleu); margin: 0; }
    p.sous-titre { margin: 0; color: #888; font-size: 0.82rem; }
  `],
  template: `
    <div class="fond">
      <form class="carte" (ngSubmit)="connecter()">
        <img src="logo-commune.png" alt="Logo de la Commune de Saint-Louis" class="logo"
             (error)="$any($event.target).style.display = 'none'">
        <h1>Commune de Saint-Louis</h1>
        <p class="sous-titre">Plateforme d'archivage électronique</p>

        <input type="email" name="email" [(ngModel)]="email" placeholder="Adresse e-mail" autocomplete="username">
        <input type="password" name="password" [(ngModel)]="password" placeholder="Mot de passe" autocomplete="current-password">

        @if (erreur()) { <div class="alert error">{{ erreur() }}</div> }

        <button class="btn-primary" type="submit" [disabled]="chargement()">
          {{ chargement() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  `
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly erreur = signal('');
  readonly chargement = signal(false);

  async connecter(): Promise<void> {
    this.erreur.set('');
    this.chargement.set(true);
    try {
      await this.auth.connecter(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.erreur.set(err?.status === 0
        ? 'Serveur injoignable : vérifiez que le backend est démarré (port 8080).'
        : err?.error?.message ?? 'Connexion impossible');
    } finally {
      this.chargement.set(false);
    }
  }
}
