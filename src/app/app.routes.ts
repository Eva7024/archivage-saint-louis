// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, adminGuard, chefGuard, gestionGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then(m => m.LoginComponent),
    title: 'Connexion — Archives Commune de Saint-Louis'
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tableau de bord'
      },
      {
        // /documents, /documents?statut=SOUMIS (workflow), /documents?historique=1 (archives historiques)
        path: 'documents',
        loadComponent: () =>
          import('./documents/documents-list.component').then(m => m.DocumentsListComponent),
        title: 'Documents'
      },
      {
        path: 'documents/upload',
        loadComponent: () =>
          import('./documents/document-upload.component').then(m => m.DocumentUploadComponent),
        title: 'Déposer un document'
      },
      {
        path: 'documents/:id',
        loadComponent: () =>
          import('./documents/document-detail.component').then(m => m.DocumentDetailComponent),
        title: 'Détail document'
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./search/search.component').then(m => m.SearchComponent),
        title: 'Recherche'
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Notifications'
      },
      {
        path: 'reports',
        canActivate: [chefGuard],
        loadComponent: () =>
          import('./reports/reports.component').then(m => m.ReportsComponent),
        title: 'Rapports'
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then(m => m.ProfileComponent),
        title: 'Mon profil'
      },
      {
        path: 'referentiels',
        canActivate: [gestionGuard],
        loadComponent: () =>
          import('./admin/referentiels.component').then(m => m.ReferentielsComponent),
        title: 'Services et catégories'
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./admin/users.component').then(m => m.UsersComponent),
        title: 'Utilisateurs'
      },
      {
        path: 'users/:id',
        canActivate: [chefGuard],
        loadComponent: () =>
          import('./profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profil agent'
      },
      {
        path: 'audit-logs',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./audit-log/audit-log.component').then(m => m.AuditLogComponent),
        title: "Journal d'activité"
      }
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];
