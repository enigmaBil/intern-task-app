'use client';

import { Task } from '@/core/domain/entities';
import { TaskStatus } from '@/core/domain/enums';
import { TaskColumn } from './TaskColumn';

interface KanbanBoardProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function KanbanBoard({ tasks, onEdit, onDelete }: KanbanBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TaskColumn
        status={TaskStatus.TODO}
        tasks={tasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskColumn
        status={TaskStatus.IN_PROGRESS}
        tasks={tasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <TaskColumn
        status={TaskStatus.DONE}
        tasks={tasks}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
