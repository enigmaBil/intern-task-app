'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, ListTodo, Users, FileText, Menu, X } from 'lucide-react';
import { UserDropdown } from '@/presentation/components/layout/UserDropdown';
import { NotificationBell } from '@/presentation/components/notification';
import { useSession } from 'next-auth/react';
import { useUserSync } from '@/presentation/hooks/useUserSync';
import { cn } from '@/shared/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Synchroniser automatiquement l'utilisateur avec le backend
  useUserSync();

  return (
    <div className="flex min-h-screen">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 border-r bg-gray-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold">Mini Jira</h1>
          <button 
            className="lg:hidden p-1 rounded-md hover:bg-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />} onClick={() => setSidebarOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink href="/tasks" icon={<ListTodo size={20} />} onClick={() => setSidebarOpen(false)}>
            Tâches
          </NavLink>
          <NavLink href="/scrum-notes" icon={<FileText size={20} />} onClick={() => setSidebarOpen(false)}>
            Notes Scrum
          </NavLink>
          {userRole === 'ADMIN' && (
            <NavLink href="/users" icon={<Users size={20} />} onClick={() => setSidebarOpen(false)}>
              Utilisateurs
            </NavLink>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserDropdown />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
