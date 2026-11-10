// src/app/core/models/models.ts
// Types partagés par toute l'application (correspondent aux réponses du backend).

export type RoleUtilisateur = 'ADMIN' | 'ADMIN_COMMUNAL' | 'ARCHIVISTE' | 'RESPONSABLE' | 'AGENT' | 'CONSULTATION';
export type StatutDocument = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'ARCHIVE' | 'REJETE';
export type Confidentialite = 'PUBLIC' | 'INTERNE' | 'CONFIDENTIEL' | 'TRES_CONFIDENTIEL';

export const STATUTS: StatutDocument[] = ['BROUILLON', 'SOUMIS', 'VALIDE', 'ARCHIVE', 'REJETE'];
export const CONFIDENTIALITES: Confidentialite[] = ['PUBLIC', 'INTERNE', 'CONFIDENTIEL', 'TRES_CONFIDENTIEL'];

export const LIBELLE_STATUT: Record<StatutDocument, string> = {
  BROUILLON: 'Brouillon', SOUMIS: 'Soumis', VALIDE: 'Validé', ARCHIVE: 'Archivé', REJETE: 'Rejeté'
};

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: RoleUtilisateur;
  service?: string | null;
  estActif: boolean;
  dateCreation: string;
}

export interface DocumentArchive {
  id: number;
  titre: string;
  reference?: string;
  description?: string;
  typeDocument?: string;
  dateDocument?: string;
  dateArchivage?: string;
  niveau: Confidentialite;
  statut: StatutDocument;
  motsCles?: string;
  dureeConservation: number;
  historique: boolean;
  service?: string;
  categorie?: string;
  auteur?: string;
}

export interface VersionDocument { id: number; version: number; dateCreation: string; auteur?: string; }
export interface NotificationGed { id: number; titre: string; message: string; lu: boolean; dateCreation: string; }
export interface EntreeJournal { id?: number; action: string; description?: string; dateAction: string; utilisateur?: string; }
export interface Referentiel { id: number; nom: string; description?: string; }

export interface Statistiques {
  total: number;
  consultations: number;
  qualite: number;
  parStatut: { label: string; n: number }[];
  parService: { label: string; n: number }[];
  parMois: { label: string; n: number }[];
  echeances: { id: number; titre: string; reference?: string; echeance: string }[];
  activite: EntreeJournal[];
}
