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
import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2, UserCheck, Calendar } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';
import { useAuth } from '@/presentation/hooks';
import { TaskDetailsModal, EditTaskModal, AssignTaskModal } from '@/presentation/components/modals';
import { ConfirmDialog } from '@/presentation/components/shared/ConfirmDialog';
import { useTaskMutations } from '@/presentation/hooks/useTaskMutations';
import { toast } from 'sonner';

interface TaskTableViewProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

export function TaskTableView({ tasks, onTaskUpdated }: TaskTableViewProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { deleteTask } = useTaskMutations();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    if (!selectedTask) return;
    const success = await deleteTask(selectedTask.id);
    if (success) {
      toast.success('Tâche supprimée');
      onTaskUpdated?.();
    }
    setDeleteOpen(false);
    setSelectedTask(null);
  };

  const openModal = (task: Task, modal: 'details' | 'edit' | 'assign' | 'delete') => {
    setSelectedTask(task);
    switch (modal) {
      case 'details':
        setDetailsOpen(true);
        break;
      case 'edit':
        setEditOpen(true);
        break;
      case 'assign':
        setAssignOpen(true);
        break;
      case 'delete':
        setDeleteOpen(true);
        break;
    }
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Titre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium max-w-[200px] sm:max-w-[300px] truncate">
            {row.getValue('title')}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="text-gray-500 max-w-[150px] sm:max-w-[200px] truncate text-sm">
            {row.getValue('description') || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as TaskStatus;
          return (
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                status === TaskStatus.DONE && 'bg-green-100 text-green-700',
                status === TaskStatus.IN_PROGRESS && 'bg-blue-100 text-blue-700',
                status === TaskStatus.TODO && 'bg-gray-100 text-gray-700'
              )}
            >
              {TaskStatusLabels[status]}
            </span>
          );
        },
      },
      {
        accessorKey: 'deadline',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Deadline
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const deadline = row.getValue('deadline') as Date | null;
          if (!deadline) return <span className="text-gray-400">-</span>;
          
          const date = new Date(deadline);
          const now = new Date();
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0;
          const isUrgent = diffDays >= 0 && diffDays <= 2;
          
          return (
            <div className={cn(
              'flex items-center gap-1 text-sm',
              isOverdue && 'text-red-600',
              isUrgent && !isOverdue && 'text-orange-600',
              !isOverdue && !isUrgent && 'text-gray-600'
            )}>
              <Calendar className="h-3 w-3" />
              {date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="hover:bg-transparent p-0 font-semibold"
          >
            Créée le
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {new Date(row.getValue('createdAt')).toLocaleDateString('fr-FR')}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const task = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openModal(task, 'details')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => openModal(task, 'edit')}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openModal(task, 'assign')}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Assigner
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openModal(task, 'delete')}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isAdmin]
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
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
              <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => openModal(row.original, 'details')}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td 
                          key={cell.id} 
                          className="px-4 py-3"
                          onClick={(e) => {
                            if (cell.column.id === 'actions') {
                              e.stopPropagation();
                            }
                          }}
                        >
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
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      Aucune tâche trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700">
            {tasks.length} tâche{tasks.length > 1 ? 's' : ''} • Page{' '}
            {table.getState().pagination.pageIndex + 1} sur {table.getPageCount() || 1}
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
      </div>

      {/* Modales */}
      {selectedTask && (
        <>
          <TaskDetailsModal
            task={selectedTask}
            open={detailsOpen}
            onOpenChange={(open) => {
              setDetailsOpen(open);
              if (!open) setSelectedTask(null);
            }}
          />
          <EditTaskModal
            task={selectedTask}
            open={editOpen}
            onOpenChange={(open) => {
              setEditOpen(open);
              if (!open) setSelectedTask(null);
            }}
            onTaskUpdated={onTaskUpdated}
          />
          <AssignTaskModal
            task={selectedTask}
            open={assignOpen}
            onOpenChange={(open: boolean) => {
              setAssignOpen(open);
              if (!open) setSelectedTask(null);
            }}
            onTaskAssigned={onTaskUpdated}
          />
          <ConfirmDialog
            open={deleteOpen}
            onOpenChange={(open: boolean) => {
              setDeleteOpen(open);
              if (!open) setSelectedTask(null);
            }}
            title="Confirmer la suppression"
            description={`Êtes-vous sûr de vouloir supprimer la tâche "${selectedTask.title}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            cancelText="Annuler"
            onConfirm={handleDelete}
            variant="destructive"
          />
        </>
      )}
    </>
  );
}
