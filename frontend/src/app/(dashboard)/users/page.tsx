'use client';

import { useUsers } from '@/presentation/hooks';
import { UserList } from '@/presentation/components/user/UserList';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';

export default function UsersPage() {
  const { users, isLoading, error, refetch } = useUsers();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nouvel utilisateur
        </button>
      </div>
      <p className="mt-4 text-gray-600">
        Gestion des membres de l'équipe
      </p>

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && <UserList users={users} />}
      </div>
    </div>
  );
}

