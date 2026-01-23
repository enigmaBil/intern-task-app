import { IUserInteractor } from "@/core/interactors";

/**
 * Use Case : Synchroniser les utilisateurs avec Keycloak
 * 
 * Désactive les utilisateurs qui n'existent plus dans Keycloak
 * en passant isActive à false au lieu de les supprimer
 */
export class SyncUsersWithKeycloakUseCase {
  constructor(private readonly userInteractor: IUserInteractor) {}

  async execute(): Promise<{ 
    total: number; 
    active: number; 
    deactivated: number; 
  }> {
    // Pour l'instant, on retourne juste les stats
    // La vraie synchronisation se fait via l'API Keycloak
    const allUsers = await this.userInteractor.findAll();
    const activeUsers = allUsers.filter(u => u['isActive'] !== false);
    
    return {
      total: allUsers.length,
      active: activeUsers.length,
      deactivated: allUsers.length - activeUsers.length,
    };
  }
}
