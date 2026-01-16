/**
 * Enum représentant les rôles des utilisateurs
 * dans le système
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  INTERN = 'INTERN',
}

/**
 * Vérifie si une valeur est un UserRole valide
 */
export function isValidUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}