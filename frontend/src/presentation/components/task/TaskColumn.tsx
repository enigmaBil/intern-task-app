'use client';

import { Task } from '@/core/domain/entities';
import { TaskStatus, TaskStatusLabels } from '@/core/domain/enums';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskColumn({ status, tasks, onEdit, onDelete }: TaskColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);

  return (
    <div className="flex min-h-[500px] flex-col rounded-lg border bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">{TaskStatusLabels[status]}</h2>
        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium">
          {columnTasks.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
