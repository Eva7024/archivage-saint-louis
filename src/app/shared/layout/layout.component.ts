// src/app/shared/layout/layout.component.ts
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ReferentielService } from '../../core/services/referentiel.service';

interface LienMenu { libelle: string; chemin: string; params?: Record<string, string>; visible: boolean; }

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .entete { display: flex; align-items: center; gap: 0.9rem; padding: 0.6rem 1.5rem; background: #fff; border-bottom: 4px solid var(--bleu); }
    .logo { height: 48px; width: auto; }
    .titre strong { display: block; color: var(--bleu); }
    .titre span { font-size: 0.8rem; color: #888; }
    .espace { flex: 1; }
    .cloche { position: relative; padding: 0.4rem 0.7rem; border: 1px solid var(--gris-bord); border-radius: 8px; color: inherit; text-decoration: none; font-size: 0.85rem; }
    .cloche b { background: var(--bleu); color: #fff; border-radius: 10px; padding: 0 6px; margin-left: 4px; font-size: 0.72rem; }
    .qui { font-size: 0.82rem; color: #666; }
    .corps { display: flex; min-height: calc(100vh - 66px); }
    nav { width: 220px; background: #fff; border-right: 1px solid var(--gris-bord); padding: 0.75rem; display: grid; align-content: start; gap: 2px; }
    nav a { padding: 0.6rem 0.75rem; border-radius: 8px; color: #333; text-decoration: none; font-size: 0.88rem; }
    nav a:hover { background: var(--gris); }
    nav a.actif { background: var(--bleu-clair); color: var(--bleu); font-weight: 600; }
    main { flex: 1; min-width: 0; }
    @media (max-width: 760px) { .corps { flex-direction: column; } nav { width: auto; display: flex; overflow-x: auto; } }
  `],
  template: `
    <header class="entete">
      <img src="logo-commune.png" alt="Logo de la Commune de Saint-Louis" class="logo"
           (error)="$any($event.target).style.display = 'none'">
      <div class="titre"><strong>Commune de Saint-Louis</strong><span>Archivage électronique</span></div>
      <div class="espace"></div>
      <a class="cloche" routerLink="/notifications">
        Notifications @if (notifications.nonLues()) { <b>{{ notifications.nonLues() }}</b> }
      </a>
      <span class="qui">{{ auth.utilisateur()?.prenom }} {{ auth.utilisateur()?.nom }} · {{ auth.role() }}</span>
      <button class="btn-secondary" (click)="auth.deconnecter()">Quitter</button>
    </header>

    <div class="corps">
      <nav>
        @for (l of liens(); track l.libelle) {
          <a [routerLink]="l.chemin" [queryParams]="l.params" routerLinkActive="actif"
             [routerLinkActiveOptions]="{ exact: true }">{{ l.libelle }}</a>
        }
      </nav>
      <main><router-outlet /></main>
    </div>
  `
})
export class LayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly notifications = inject(NotificationService);

  constructor() {
    inject(ReferentielService).charger();
    // Met à jour le compteur de notifications à chaque changement de page
    inject(Router).events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(e => { if (!e.urlAfterRedirects.startsWith('/notifications')) this.notifications.rafraichir(); });
  }

  /** Menu affiché selon le rôle de l'utilisateur. */
  protected readonly liens = computed<LienMenu[]>(() => {
    const a = this.auth;
    const peutEcrire = !a.aRole('CONSULTATION');
    const valideur = a.aRole('ADMIN', 'ADMIN_COMMUNAL', 'RESPONSABLE');
    return ([
      { libelle: 'Tableau de bord',     chemin: '/dashboard',    visible: true },
      { libelle: 'Documents',           chemin: '/documents',    visible: true },
      { libelle: 'Déposer un document', chemin: '/documents/upload', visible: peutEcrire },
      { libelle: 'À valider',           chemin: '/documents',    params: { statut: 'SOUMIS' }, visible: valideur },
      { libelle: 'Archives historiques', chemin: '/documents',   params: { historique: '1' }, visible: true },
      { libelle: 'Recherche avancée',   chemin: '/search',       visible: true },
      { libelle: 'Notifications',       chemin: '/notifications', visible: true },
      { libelle: 'Rapports',            chemin: '/reports',      visible: a.aRole('ADMIN', 'ADMIN_COMMUNAL', 'RESPONSABLE', 'ARCHIVISTE') },
      { libelle: 'Services et catégories', chemin: '/referentiels', visible: a.aRole('ADMIN', 'ADMIN_COMMUNAL') },
      { libelle: 'Utilisateurs',        chemin: '/users',        visible: a.aRole('ADMIN') },
      { libelle: "Journal d'activité",  chemin: '/audit-logs',   visible: a.aRole('ADMIN') },
      { libelle: 'Mon profil',          chemin: '/profile',      visible: true }
    ] as LienMenu[]).filter(l => l.visible);
  });
}
