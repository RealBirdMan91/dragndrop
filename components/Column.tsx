import { TColummn, Task } from "./KanbanBoard";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/utils/cn";
import Button from "./ui/Button";

type Props = {
  column: TColummn;
  onDeleteColumn?: (id: string) => void;
  children?: React.ReactNode;
};

function Column({ column, onDeleteColumn: onDelete, children }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      key={column.id}
      className={cn(
        "select-none min-h-full w-[230px] bg-slate-600 cursor-grab p-4",
        isDragging && "opacity-50 border-red-500 border-2"
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Button onClick={() => onDelete && onDelete(column.id)}>Delete</Button>
      <h2 className="select-none text-white text-xl font-bold">
        {column.title}
      </h2>
      <div
        className="select-none w-full h-2"
        style={{ backgroundColor: column.color }}
      />
      <div className=" select-none flex flex-col gap-4 mt-4">{children}</div>
    </div>
  );
}

export type CardProps = {
  task: Task;
  color: string;
  parent?: string;
  onDelete?: (id: string) => void;
};

export function ColumnCard({ task, color, onDelete, parent }: CardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
      parent,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: color,
  };

  return (
    <div
      className={cn(
        "select-none cursor-grab p-4 rounded-md shadow-md",
        isDragging && "opacity-50 border-red-500 border-2"
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <h1 className="select-none text-xl font-bold text-white">{task.title}</h1>
      <h3 className="select-none text-white font-semibold">{task.subTitle}</h3>
      <small className="select-none text-white">{task.date}</small>
      <Button className="mt-4" onClick={() => onDelete && onDelete(task.id)}>
        Delete
      </Button>
    </div>
  );
}

export default Column;
