'use client';

import { useScrumNotes } from '@/presentation/hooks/useScrumNotes';
import { AddScrumNoteModal } from '@/presentation/components/modals';
import { LoadingSpinner, ErrorMessage } from '@/presentation/components/shared';
import { ScrumNoteList } from '@/presentation/components/scrum-note/ScrumNoteList';
import { ScrumNotesTable } from '@/presentation/components/scrum-note';
import { useState, useMemo } from 'react';
import { Grid3x3, List, Filter, X, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useUsers } from '@/presentation/hooks/useUsers';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/shared/utils';

type ViewMode = 'grid' | 'list';

export default function ScrumNotesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [blockersOnly, setBlockersOnly] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);
  
  const { scrumNotes, isLoading, error, refetch } = useScrumNotes();
  const { user } = useAuth();
  const { users } = useUsers();
  
  const isAdmin = user?.role === 'ADMIN';

  const filteredNotes = useMemo(() => {
    let filtered = [...scrumNotes];

    // Filter by today
    if (todayOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter((note) => {
        const noteDate = new Date(note.date);
        noteDate.setHours(0, 0, 0, 0);
        return noteDate.getTime() === today.getTime();
      });
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter((note) => new Date(note.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter((note) => new Date(note.date) <= new Date(dateTo));
    }

    // Filter by user (ADMIN only)
    if (isAdmin && selectedUserId) {
      filtered = filtered.filter((note) => note.userId === selectedUserId);
    }

    // Filter by blockers
    if (blockersOnly) {
      filtered = filtered.filter((note) => note.blockers && note.blockers.trim() !== '');
    }

    return filtered;
  }, [scrumNotes, dateFrom, dateTo, selectedUserId, blockersOnly, isAdmin, todayOnly]);

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedUserId('');
    setBlockersOnly(false);
    setTodayOnly(false);
  };

  const handleTodayFilter = () => {
    setTodayOnly(!todayOnly);
    if (!todayOnly) {
      // Reset date filters when activating today filter
      setDateFrom('');
      setDateTo('');
    }
  };

  const hasActiveFilters = dateFrom || dateTo || selectedUserId || blockersOnly || todayOnly;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Notes Scrum</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={todayOnly ? 'default' : 'outline'}
            size="sm"
            onClick={handleTodayFilter}
            className="text-xs sm:text-sm"
          >
            <CalendarCheck className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Aujourd'hui</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('text-xs sm:text-sm', showFilters && 'bg-gray-100')}
          >
            <Filter className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Filtres</span>
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none px-2 sm:px-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none px-2 sm:px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <AddScrumNoteModal onNoteAdded={refetch} />
        </div>
      </div>
      <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600">
        Daily stand-up notes de l'équipe
      </p>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Filtres</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="mr-1 h-3 w-3" />
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* User Filter (ADMIN only) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les utilisateurs</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Blockers Only */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blockersOnly}
                  onChange={(e) => setBlockersOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Seulement avec blocages
                </span>
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="text-sm text-gray-600">
              {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''} trouvée
              {filteredNotes.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!isLoading && !error && (
          viewMode === 'grid' ? (
            <ScrumNoteList notes={filteredNotes} onNoteUpdated={refetch} />
          ) : (
            <ScrumNotesTable notes={filteredNotes} onNoteUpdated={refetch} />
          )
        )}
      </div>
    </div>
  );
}

