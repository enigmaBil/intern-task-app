import { User } from "@/core/domain/entities/user.entity";
import { UserRole, isValidUserRole } from "@/core/domain/enums/user-role.enum";
import { InvalidInputException } from "@/core/domain/exceptions/invalid-input.exception";
import { IUserInteractor } from "@/core/interactors";

/**
 * Input pour synchroniser un utilisateur depuis Keycloak
 */
export interface SyncUserFromAuthInput {
  /**
   * ID unique de l'utilisateur dans Keycloak (sub du JWT)
   */
  keycloakId: string;

  /**
   * Email de l'utilisateur
   */
  email: string;

  /**
   * Prénom de l'utilisateur
   */
  firstName: string;

  /**
   * Nom de famille de l'utilisateur
   */
  lastName: string;

  /**
   * Rôles de l'utilisateur dans Keycloak
   */
  roles: string[];
}

/**
 * Use Case : Synchroniser un utilisateur depuis Keycloak vers la base de données
 * 
 * Règles métier :
 * - L'utilisateur est identifié par son keycloakId (sub)
 * - Si l'utilisateur n'existe pas, il est créé
 * - Si l'utilisateur existe, ses informations sont mises à jour
 * - Le rôle est déterminé à partir des rôles Keycloak
 * - Les champs email, firstName, lastName sont obligatoires
 */
export class SyncUserFromAuthUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(input: SyncUserFromAuthInput): Promise<User> {
    // Validation de l'input
    this.validateInput(input);

    // Déterminer le rôle à partir des rôles Keycloak
    const role = this.extractUserRole(input.roles);

    // Normaliser les données
    const normalizedData = {
      id: input.keycloakId,
      email: input.email.toLowerCase().trim(),
      firstName: this.capitalizeFirstLetter(input.firstName.trim()),
      lastName: input.lastName.toUpperCase().trim(),
      role,
    };

    // Utiliser upsertFromAuth qui gère correctement les cas de création/mise à jour par email
    return await this.userInteractor.upsertFromAuth({
      keycloakId: normalizedData.id,
      email: normalizedData.email,
      firstName: normalizedData.firstName,
      lastName: normalizedData.lastName,
      role: normalizedData.role,
    });
  }

  /**
   * Valide l'input
   */
  private validateInput(input: SyncUserFromAuthInput): void {
    if (!input.keycloakId || input.keycloakId.trim() === '') {
      throw new InvalidInputException('keycloakId', 'Le keycloakId est obligatoire');
    }

    if (!input.email || input.email.trim() === '') {
      throw new InvalidInputException('email', 'L\'email est obligatoire');
    }

    // Validation basique du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new InvalidInputException('email', 'Le format de l\'email est invalide');
    }

    if (!input.firstName || input.firstName.trim() === '') {
      throw new InvalidInputException('firstName', 'Le prénom est obligatoire');
    }

    if (!input.lastName || input.lastName.trim() === '') {
      throw new InvalidInputException('lastName', 'Le nom est obligatoire');
    }

    if (!input.roles || !Array.isArray(input.roles)) {
      throw new InvalidInputException('roles', 'Les rôles doivent être fournis');
    }
  }

  /**
   * Extrait le rôle utilisateur à partir des rôles Keycloak
   * 
   * Logique :
   * - Si l'utilisateur a le rôle "ADMIN" ou "admin" dans Keycloak -> ADMIN
   * - Sinon -> INTERN (par défaut)
   */
  private extractUserRole(keycloakRoles: string[]): UserRole {
    // Normaliser les rôles (uppercase pour comparaison car Keycloak envoie généralement en majuscules)
    const normalizedRoles = keycloakRoles.map(role => role.toUpperCase());

    // Vérifier si l'utilisateur est admin
    if (normalizedRoles.includes('ADMIN') || normalizedRoles.includes('ADMINISTRATOR')) {
      return UserRole.ADMIN;
    }

    // Par défaut, tous les autres sont des stagiaires
    return UserRole.INTERN;
  }

  /**
   * Met en majuscule la première lettre d'une chaîne
   */
  private capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
