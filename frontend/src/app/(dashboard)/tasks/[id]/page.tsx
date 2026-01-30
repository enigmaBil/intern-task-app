'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTask } from '@/presentation/hooks';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { TaskDetailsModal } from '@/presentation/components/modals';

interface TaskPageProps {
  params: { id: string };
}

export default function TaskPage({ params }: TaskPageProps) {
  const { id } = React.use(params);
  const { task, isLoading, error, refetch } = useTask(id);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !task && !error) {
      // Si la tâche n'existe pas, retourner à la liste
      router.replace('/tasks');
    }
  }, [isLoading, task, error, router]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!task) return null;

  return <TaskDetailsModal task={task} open={true} onOpenChange={() => router.replace('/tasks')} />;
}
