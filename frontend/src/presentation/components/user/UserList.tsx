'use client';

import { User } from '@/core/domain/entities';
import { UserRoleLabels } from '@/core/domain/enums';
import { getInitials } from '@/shared/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDeactivate?: (userId: string) => void;
  onActivate?: (userId: string) => void;
}

export function UserList({ users, onEdit, onDeactivate, onActivate }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-gray-500">
        Aucun utilisateur actif trouvé
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const isActive = user['isActive'] !== false;
        
        return (
          <div
            key={user.id}
            className={`rounded-lg border bg-white p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md ${
              !isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold relative text-sm sm:text-base">
                {getInitials(user.firstName, user.lastName)}
                {!isActive && (
                  <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                    <XCircle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="inline-block rounded bg-gray-100 px-2 py-0.5 sm:py-1 text-xs">
                    {UserRoleLabels[user.role]}
                  </span>
                  {!isActive && (
                    <span className="inline-block rounded bg-red-100 px-2 py-0.5 sm:py-1 text-xs text-red-700">
                      Désactivé
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(onEdit || onDeactivate || onActivate) && (
              <div className="mt-3 sm:mt-4 flex gap-2 border-t pt-2 sm:pt-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(user)}
                    className="flex-1 rounded bg-blue-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:bg-blue-100"
                  >
                    Éditer
                  </button>
                )}
                {isActive && onDeactivate && (
                  <button
                    onClick={() => onDeactivate(user.id)}
                    className="flex-1 rounded bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-100"
                  >
                    Désactiver
                  </button>
                )}
                {!isActive && onActivate && (
                  <button
                    onClick={() => onActivate(user.id)}
                    className="flex-1 rounded bg-green-50 px-3 py-2 text-sm text-green-600 hover:bg-green-100"
                  >
                    Activer
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
