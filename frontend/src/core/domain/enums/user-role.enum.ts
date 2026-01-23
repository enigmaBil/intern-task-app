export enum UserRole {
  ADMIN = 'ADMIN',
  INTERN = 'INTERN',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.INTERN]: 'Stagiaire',
};
