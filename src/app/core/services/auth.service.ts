// src/app/core/services/auth.service.ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleUtilisateur, Utilisateur } from '../models/models';

const CLE_TOKEN = 'ged_token';

/** Gère la session : jeton JWT, utilisateur connecté et son rôle. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(CLE_TOKEN));
  readonly utilisateur = signal<Utilisateur | null>(null);
  readonly connecte = computed(() => !!this.token());
  readonly role = computed<RoleUtilisateur | null>(() => this.utilisateur()?.role ?? null);

  /** Vérifie l'identifiant, mémorise le jeton puis charge le profil. */
  async connecter(email: string, password: string): Promise<void> {
    const r = await firstValueFrom(this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password }));
    localStorage.setItem(CLE_TOKEN, r.token);
    this.token.set(r.token);
    await this.chargerProfil();
  }

  async chargerProfil(): Promise<void> {
    this.utilisateur.set(await firstValueFrom(this.http.get<Utilisateur>(`${environment.apiUrl}/me`)));
  }

  deconnecter(): void {
    localStorage.removeItem(CLE_TOKEN);
    this.token.set(null);
    this.utilisateur.set(null);
    this.router.navigate(['/login']);
  }

  /** Vrai si l'utilisateur a l'un des rôles indiqués. */
  aRole(...roles: RoleUtilisateur[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }
}
