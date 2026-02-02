'use client';

import { useState } from 'react';
import {
  LayoutGrid,
  List,
  Table2,
  CheckCircle2,
  Circle,
  Filter,
  ArrowUpDown,
  Search,
  Settings2,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/presentation/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';

export type ViewMode = 'kanban' | 'list' | 'table';
export type FilterMode = 'all' | 'incomplete' | 'completed';

interface TaskToolbarProps {
  viewMode: ViewMode;
  filterMode: FilterMode;
  searchQuery: string;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterModeChange: (mode: FilterMode) => void;
  onSearchChange: (query: string) => void;
  onAddTask?: () => void;
  isAdmin?: boolean;
}

export function TaskToolbar({
  viewMode,
  filterMode,
  searchQuery,
  onViewModeChange,
  onFilterModeChange,
  onSearchChange,
  onAddTask,
  isAdmin = false,
}: TaskToolbarProps) {
  const [showSearch, setShowSearch] = useState(false);

  const viewTabs = [
    { id: 'all' as FilterMode, label: 'Tout', icon: Circle },
    { id: 'incomplete' as FilterMode, label: 'En cours', icon: Circle },
    { id: 'completed' as FilterMode, label: 'Terminé', icon: CheckCircle2 },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Barre principale */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Tabs de filtrage - scrollable sur mobile */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg overflow-x-auto w-full sm:w-auto">
          {viewTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onFilterModeChange(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', isActive && tab.id === 'completed' && 'text-green-600')} />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            );
          })}

          {/* Séparateur - caché sur mobile */}
          <div className="hidden sm:block w-px h-5 bg-border mx-1" />

          {/* Boutons de vue : Kanban, Liste, Table */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap',
                'transition-all duration-150',
                viewMode === 'kanban'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
              title="Vue Kanban"
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Kanban</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap',
                'transition-all duration-150',
                viewMode === 'list'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
              title="Vue Liste"
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Liste</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap',
                'transition-all duration-150',
                viewMode === 'table'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              )}
              title="Vue Table"
            >
              <Table2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
          {/* Recherche */}
          {showSearch ? (
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-full sm:w-48"
                autoFocus
                onBlur={() => !searchQuery && setShowSearch(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Filtre */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterModeChange('all')}>
                Toutes les tâches
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterModeChange('incomplete')}>
                En cours uniquement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterModeChange('completed')}>
                Terminées uniquement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tri - caché sur mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Options - caché sur mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="h-4 w-4" />
          </Button>

          {/* Bouton Nouveau */}
          {isAdmin && onAddTask && (
            <Button
              onClick={onAddTask}
              size="sm"
              className="ml-1 sm:ml-2 bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Nouveau</span>
              <ChevronDown className="h-3 w-3 hidden sm:inline" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
