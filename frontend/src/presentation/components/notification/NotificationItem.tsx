'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle2, 
  ClipboardList, 
  FileText, 
  ArrowRight 
} from 'lucide-react';
import { Notification, NotificationType } from '@/core/domain/entities';
import { cn } from '@/shared/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

/**
 * Composant pour afficher une notification individuelle
 */
export function NotificationItem({ 
  notification, 
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.TASK_ASSIGNED:
        return <ClipboardList className="h-5 w-5 text-blue-500" />;
      case NotificationType.TASK_STATUS_UPDATED:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case NotificationType.SCRUM_NOTE_CREATED:
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-3 cursor-pointer transition-colors rounded-lg',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20'
      )}
    >
      {/* Icône */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            'text-sm font-medium text-gray-900 dark:text-gray-100 truncate',
            !notification.isRead && 'font-semibold'
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {timeAgo}
        </p>
      </div>

      {/* Flèche pour naviguer */}
      {notification.redirectUrl && (
        <div className="flex-shrink-0">
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}
