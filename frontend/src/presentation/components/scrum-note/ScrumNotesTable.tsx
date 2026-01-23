'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ScrumNote } from '@/core/domain/entities';
import { ArrowUpDown, AlertCircle, MoreVertical, Edit, Trash } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { EditScrumNoteModal, DeleteScrumNoteDialog } from '@/presentation/components/modals';
import { useAuth } from '@/presentation/hooks/useAuth';

interface ScrumNotesTableProps {
  notes: ScrumNote[];
  onNoteUpdated?: () => void;
}

export function ScrumNotesTable({ notes, onNoteUpdated }: ScrumNotesTableProps) {
  const { user } = useAuth();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingNote, setEditingNote] = useState<ScrumNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const handleSuccess = () => {
    if (onNoteUpdated) {
      onNoteUpdated();
    }
  };

  const columns = useMemo<ColumnDef<ScrumNote>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-transparent p-0"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="whitespace-nowrap font-medium">
              {new Date(row.getValue('date')).toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          );
        },
      },
      {
        accessorKey: 'whatIDid',
        header: 'Travail effectué',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="line-clamp-2 text-sm">{row.getValue('whatIDid') || '-'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'nextSteps',
        header: 'Prochaines étapes',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="line-clamp-2 text-sm">{row.getValue('nextSteps') || '-'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'blockers',
        header: 'Blocages',
        cell: ({ row }) => {
          const blockers = row.getValue('blockers') as string;
          return blockers ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="line-clamp-1 text-sm text-red-700">{blockers}</p>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Aucun</span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const note = row.original;
          // User can edit/delete their own notes or if they are ADMIN
          const canModify = user && (user.id === note.userId || user.role === 'ADMIN');

          if (!canModify) {
            return <div className="text-center text-gray-400 text-xs">-</div>;
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingNote(note)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeletingNoteId(note.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [user, setEditingNote, setDeletingNoteId]
  );

  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Rechercher dans les notes..."
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
        />
        <div className="text-sm text-gray-600">
          {notes.length} note{notes.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  Aucune note trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>

      <EditScrumNoteModal
        note={editingNote}
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        onSuccess={handleSuccess}
      />

      <DeleteScrumNoteDialog
        noteId={deletingNoteId}
        open={!!deletingNoteId}
        onOpenChange={(open) => !open && setDeletingNoteId(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
