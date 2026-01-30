'use client';

import { Notification } from '@/core/domain/entities';
import { NotificationItem } from './NotificationItem';
import { Bell, Loader2 } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  emptyMessage?: string;
}

/**
 * Composant pour afficher une liste de notifications
 */
export function NotificationList({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onNotificationClick,
  emptyMessage = 'Aucune notification',
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Bell className="h-10 w-10 mb-3 text-gray-300" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
