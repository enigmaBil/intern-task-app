export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.DEVELOPER]: 'Développeur',
};
