import { User } from "../domain/entities/user.entity";
import { UserRole } from "../domain/enums/user-role.enum";

/**
 * Interface de l'interactor User
 * 
 * PORT pour l'accès aux utilisateurs.
 * Ne doit pas dépendre de frameworks externes.
 */
export interface IUserInteractor {
  /**
   * Récupère un utilisateur par son ID
   * 
   * @param id - ID de l'utilisateur
   * @returns L'utilisateur si trouvé, null sinon
   */
  findById(id: string): Promise<User | null>;

  /**
   * Récupère un utilisateur par son email
   * 
   * @param email - Email de l'utilisateur
   * @returns L'utilisateur si trouvé, null sinon
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Récupère tous les utilisateurs
   * 
   * @returns Liste de tous les utilisateurs
   */
  findAll(): Promise<User[]>;

  /**
   * Récupère les utilisateurs par rôle
   * 
   * @param role - Rôle des utilisateurs à récupérer
   * @returns Liste des utilisateurs avec ce rôle
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Vérifie si un utilisateur existe
   * 
   * @param id - ID de l'utilisateur
   * @returns true si l'utilisateur existe, false sinon
   */
  exists(id: string): Promise<boolean>;

  /**
   * Vérifie si un email est déjà utilisé
   * 
   * @param email - Email à vérifier
   * @returns true si l'email existe déjà, false sinon
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Sauvegarde un utilisateur (création ou mise à jour)
   * 
   * @param user - Entité utilisateur à sauvegarder
   * @returns L'utilisateur sauvegardé
   */
  save(user: User): Promise<User>;
}