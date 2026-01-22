'use client';

import Link from 'next/link';
import { LayoutDashboard, ListTodo, Users, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/presentation/hooks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Mini Jira</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <NavLink href="/dashboard" icon={<LayoutDashboard size={20} />}>
            Dashboard
          </NavLink>
          <NavLink href="/tasks" icon={<ListTodo size={20} />}>
            Tâches
          </NavLink>
          <NavLink href="/users" icon={<Users size={20} />}>
            Utilisateurs
          </NavLink>
          <NavLink href="/scrum-notes" icon={<FileText size={20} />}>
            Notes Scrum
          </NavLink>
        </nav>
        
        {/* User info & logout */}
        {user && (
          <div className="absolute bottom-0 w-64 border-t bg-gray-50 p-4">
            <div className="mb-3 text-sm">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Bienvenue</h2>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
