'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationRepository } from '@/infrastructure/repositories';
import { Notification, NotificationListResponse } from '@/core/domain/entities';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

/**
 * Hook pour gérer les notifications
 * 
 * Fonctionnalités:
 * - Récupération des notifications
 * - Connexion SSE pour temps réel
 * - Marquer comme lu
 * - Affichage des toasts
 */
export function useNotifications() {
  const { accessToken, isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<(() => void) | null>(null);
  const [isSSEConnected, setIsSSEConnected] = useState(false);

  // Query pour récupérer les notifications (10 dernières)
  const {
    data: notificationData,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationListResponse>({
    queryKey: ['notifications'],
    queryFn: () => notificationRepository.getNotifications(10, false),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Refetch toutes les minutes en backup
  });

  // Query pour récupérer toutes les notifications non lues (pour la modale)
  const {
    data: allUnreadNotifications,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useQuery<Notification[]>({
    queryKey: ['notifications', 'unread', 'all'],
    queryFn: () => notificationRepository.getAllUnread(),
    enabled: false, // Désactivé par défaut, déclenché manuellement
  });

  // Mutation pour marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationRepository.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation pour marquer tout comme lu
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationRepository.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Gestion des nouvelles notifications reçues via SSE
  const handleNewNotification = useCallback((notification: Notification) => {
    // Ajouter à la liste locale
    queryClient.setQueryData<NotificationListResponse>(
      ['notifications'],
      (old) => {
        if (!old) {
          return {
            notifications: [notification],
            unreadCount: 1,
          };
        }
        return {
          notifications: [notification, ...old.notifications].slice(0, 10),
          unreadCount: old.unreadCount + 1,
        };
      }
    );

    // Afficher un toast
    toast.info(notification.title, {
      description: notification.message,
      action: notification.redirectUrl
        ? {
            label: 'Voir',
            onClick: () => {
              window.location.href = notification.redirectUrl!;
            },
          }
        : undefined,
      duration: 5000,
    });
  }, [queryClient]);

  // Connexion SSE
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    // Fermer la connexion précédente si elle existe
    if (eventSourceRef.current) {
      eventSourceRef.current();
    }

    // Créer une nouvelle connexion SSE
    const closeConnection = notificationRepository.createSSEConnection(
      accessToken,
      handleNewNotification,
      (error) => {
        console.error('[useNotifications] SSE error:', error);
        setIsSSEConnected(false);
      }
    );

    eventSourceRef.current = closeConnection;
    setIsSSEConnected(true);

    // Cleanup à la déconnexion
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current();
        eventSourceRef.current = null;
      }
      setIsSSEConnected(false);
    };
  }, [isAuthenticated, accessToken, handleNewNotification]);

  // Fonctions exposées
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      console.error('[useNotifications] Failed to mark as read:', error);
    }
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      console.error('[useNotifications] Failed to mark all as read:', error);
    }
  }, [markAllAsReadMutation]);

  const fetchAllUnread = useCallback(async () => {
    await refetchUnread();
  }, [refetchUnread]);

  return {
    // Données
    notifications: notificationData?.notifications ?? [],
    unreadCount: notificationData?.unreadCount ?? 0,
    allUnreadNotifications: allUnreadNotifications ?? [],
    
    // États
    isLoading,
    isLoadingUnread,
    error,
    isSSEConnected,
    
    // Actions
    markAsRead,
    markAllAsRead,
    fetchAllUnread,
    refetch,
  };
}
