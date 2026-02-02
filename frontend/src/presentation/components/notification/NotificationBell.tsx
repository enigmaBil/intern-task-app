'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '@/presentation/hooks';
import { Notification } from '@/core/domain/entities';
import { NotificationList } from './NotificationList';
import { NotificationModal } from './NotificationModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/utils';

/**
 * Composant cloche de notifications avec dropdown et badge
 */
export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    allUnreadNotifications,
    isLoading,
    isLoadingUnread,
    markAsRead,
    markAllAsRead,
    fetchAllUnread,
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Naviguer vers la ressource
    if (notification.redirectUrl) {
      setIsOpen(false);
      router.push(notification.redirectUrl);
    }
  };

  const handleViewAll = async () => {
    setIsOpen(false);
    await fetchAllUnread();
    setIsModalOpen(true);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center',
                'min-w-[18px] h-[18px] px-1 rounded-full',
                'bg-red-500 text-white text-xs font-medium',
                'animate-in zoom-in-50 duration-200'
              )}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] p-0 mx-4 sm:mx-0"
          sideOffset={8}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {/* Liste des notifications (10 dernières) */}
          <div className="max-h-[400px] overflow-y-auto">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onNotificationClick={handleNotificationClick}
              emptyMessage="Aucune notification"
            />
          </div>

          {/* Footer avec bouton "Voir tout" */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-2">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm text-gray-600 dark:text-gray-400"
                onClick={handleViewAll}
              >
                Voir toutes les notifications non lues
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modale pour voir toutes les notifications non lues */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={allUnreadNotifications}
        isLoading={isLoadingUnread}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={(notification) => {
          handleNotificationClick(notification);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
