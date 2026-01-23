'use client';

import { useUsers } from '@/presentation/hooks';
import { UserList } from '@/presentation/components/user/UserList';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { userInteractor } from '@/core/interactors/user.interactor';
import { toast } from 'sonner';

export default function UsersPage() {
  const { users, isLoading, error, refetch } = useUsers();

  const handleDeactivate = async (userId: string) => {
    try {
      await userInteractor.deactivateUser.execute(userId);
      toast.success('Utilisateur désactivé avec succès');
      refetch();
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Erreur lors de la désactivation de l\'utilisateur');
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await userInteractor.activateUser.execute(userId);
      toast.success('Utilisateur activé avec succès');
      refetch();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Erreur lors de l\'activation de l\'utilisateur');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
      </div>
      <p className="mt-4 text-gray-600">
        Gestion des membres de l'équipe
      </p>

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && (
          <UserList 
            users={users} 
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
        )}
      </div>
    </div>
  );
}

