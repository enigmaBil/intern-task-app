'use client';

import { X, CheckCheck, Bell } from 'lucide-react';
import { Notification } from '@/core/domain/entities';
import { NotificationList } from './NotificationList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * Modale pour afficher toutes les notifications non lues
 * 
 * Les notifications lues disparaissent de cette vue
 */
export function NotificationModal({
  isOpen,
  onClose,
  notifications,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationModalProps) {
  const handleMarkAsRead = (id: string) => {
    onMarkAsRead?.(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifications
              {notifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                  {notifications.length}
                </span>
              )}
            </DialogTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Tout marquer comme lu</span>
                <span className="sm:hidden">Tout lu</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-2">
          <div className="py-2">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={onNotificationClick}
              emptyMessage="Toutes les notifications ont été lues !"
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
