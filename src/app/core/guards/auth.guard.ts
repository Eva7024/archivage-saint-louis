// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleUtilisateur } from '../models/models';

/** Exige d'être connecté (recharge le profil après un rafraîchissement de la page). */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.connecte()) return router.createUrlTree(['/login']);
  if (!auth.utilisateur()) {
    try { await auth.chargerProfil(); } catch { auth.deconnecter(); return false; }
  }
  return true;
};

/** Fabrique un garde qui exige l'un des rôles indiqués. */
const exigerRoles = (...roles: RoleUtilisateur[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.aRole(...roles) || inject(Router).createUrlTree(['/dashboard']);
};

export const adminGuard = exigerRoles('ADMIN');
export const chefGuard = exigerRoles('ADMIN', 'ADMIN_COMMUNAL', 'RESPONSABLE', 'ARCHIVISTE');
export const gestionGuard = exigerRoles('ADMIN', 'ADMIN_COMMUNAL');
