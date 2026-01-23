'use client';

import { useTasks, useUsers, useScrumNotes, useAuth } from '@/presentation/hooks';
import { TaskStatus } from '@/core/domain/enums';
import { CheckCircle2, Circle, Clock, Users, FileText, ListTodo, TrendingUp } from 'lucide-react';
import { RecentTasksTable, RecentScrumNotesTable, RecentUsersTable } from '@/presentation/components/dashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { users, isLoading: usersLoading } = useUsers();
  const { scrumNotes, isLoading: notesLoading } = useScrumNotes();
  
  const isAdmin = user?.role === 'ADMIN';
  
  // Calculer les statistiques des tâches
  const todoTasks = tasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const myTasks = tasks.filter(t => t.assigneeId === user?.id).length;
  
  // Calculer le pourcentage de complétion
  const completionRate = tasks.length > 0 
    ? Math.round((doneTasks / tasks.length) * 100) 
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Bienvenue {user?.firstName} - Vue d'ensemble de vos projets
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Tâches"
          value={tasksLoading ? '...' : tasks.length.toString()}
          icon={<ListTodo className="h-5 w-5" />}
          color="blue"
          trend={`${completionRate}% complétées`}
        />
        
        <StatCard
          title={isAdmin ? "Utilisateurs" : "Mes Tâches"}
          value={isAdmin 
            ? (usersLoading ? '...' : users.length.toString())
            : (tasksLoading ? '...' : myTasks.toString())
          }
          icon={isAdmin ? <Users className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
        
        <StatCard
          title="Notes Scrum"
          value={notesLoading ? '...' : scrumNotes.length.toString()}
          icon={<FileText className="h-5 w-5" />}
          color="purple"
        />
        
        <StatCard
          title="Taux de complétion"
          value={tasksLoading ? '...' : `${completionRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Détails des tâches par statut */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <TaskStatusCard
          title="À faire"
          count={tasksLoading ? '...' : todoTasks.toString()}
          icon={<Circle className="h-5 w-5" />}
          color="gray"
        />
        
        <TaskStatusCard
          title="En cours"
          count={tasksLoading ? '...' : inProgressTasks.toString()}
          icon={<Clock className="h-5 w-5" />}
          color="blue"
        />
        
        <TaskStatusCard
          title="Terminées"
          count={tasksLoading ? '...' : doneTasks.toString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Tables avec données réelles */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Table des tâches récentes */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tâches récentes</h2>
          {tasksLoading ? (
            <p className="text-gray-500 text-center py-8">Chargement...</p>
          ) : (
            <RecentTasksTable tasks={tasks.slice(0, 10)} />
          )}
        </div>

        {/* Table des notes Scrum récentes */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Notes Scrum récentes</h2>
          {notesLoading ? (
            <p className="text-gray-500 text-center py-8">Chargement...</p>
          ) : (
            <RecentScrumNotesTable scrumNotes={scrumNotes.slice(0, 10)} />
          )}
        </div>
      </div>

      {/* Table des utilisateurs (uniquement pour ADMIN) */}
      {isAdmin && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Utilisateurs récents</h2>
          {usersLoading ? (
            <p className="text-gray-500 text-center py-8">Chargement...</p>
          ) : (
            <RecentUsersTable users={users.slice(0, 10)} />
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-gray-500">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface TaskStatusCardProps {
  title: string;
  count: string;
  icon: React.ReactNode;
  color: 'gray' | 'blue' | 'green';
}

function TaskStatusCard({ title, count, icon, color }: TaskStatusCardProps) {
  const colorClasses = {
    gray: 'border-gray-200 bg-gray-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
  };
  
  const textColorClasses = {
    gray: 'text-gray-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]} hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={textColorClasses[color]}>
          {icon}
        </div>
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      <p className={`text-4xl font-bold ${textColorClasses[color]}`}>{count}</p>
    </div>
  );
}
