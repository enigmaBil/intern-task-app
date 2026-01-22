'use client';

import { User } from '@/core/domain/entities';
import { UserRoleLabels } from '@/core/domain/enums';
import { getInitials } from '@/shared/utils';

interface UserListProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-gray-500">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                {UserRoleLabels[user.role]}
              </span>
            </div>
          </div>
          
          {(onEdit || onDelete) && (
            <div className="mt-4 flex gap-2 border-t pt-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(user)}
                  className="flex-1 rounded bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100"
                >
                  Éditer
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(user.id)}
                  className="flex-1 rounded bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                >
                  Supprimer
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
