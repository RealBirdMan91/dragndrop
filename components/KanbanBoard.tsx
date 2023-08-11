"use client";
import React, { useRef, useState } from "react";
import Button from "./ui/Button";
import { v4 as uuidv4 } from "uuid";
import Column, { ColumnCard } from "./Column";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

export type Task = {
  id: string;
  title: string;
  subTitle: string;
  date: string;
};

export type TColummn = {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
};

const DUMMY_TASKS_FROM_DB: Task[] = [
  {
    id: "t1",
    title: "Task 1",
    subTitle: "Sub Task 1",
    date: "2021-10-10",
  },
  {
    id: "t2",
    title: "Task 2",
    subTitle: "Sub Task 2",
    date: "2021-10-10",
  },
];

const DUMMY_COLUMNS_FROM_DB: TColummn[] = [
  {
    id: "c1",
    title: "To Do",
    color: "red",
    tasks: [],
  },
  {
    id: "c2",
    title: "In Progress",
    color: "blue",
    tasks: [],
  },
  {
    id: "c3",
    title: "Done",
    color: "green",
    tasks: DUMMY_TASKS_FROM_DB,
  },
];

function KanbanBoard() {
  const [columns, setColumns] = useState<TColummn[]>(DUMMY_COLUMNS_FROM_DB);
  const [activeColumn, setActiveColumn] = useState<TColummn | null>(null);
  const [activeTask, setActiveTask] = useState<
    (Task & { color: string }) | null
  >(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  );

  function onAddColumn() {
    const newColumn = {
      id: uuidv4(),
      title: "New Form column",
      color: "purple",
      tasks: [],
    };
    setColumns(columns.concat(newColumn));
  }

  function onDeleteColumn(id: string) {
    setColumns(columns.filter((column) => column.id !== id));
  }

  function onAddTask(id: string) {
    const newTask = {
      id: uuidv4(),
      title: "New Task",
      subTitle: "New Sub Task",
      date: "2021-10-10",
    };
    const newColumns = columns.map((column) => {
      if (column.id === id) {
        return {
          ...column,
          tasks: column.tasks.concat(newTask),
        };
      }
      return column;
    });
    setColumns(newColumns);
  }

  function onDeleteTask(id: string) {
    const newColumns = columns.map((column) => {
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== id),
      };
    });
    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "column") {
      return setActiveColumn(event.active.data.current.column);
    }
    if (event.active.data.current?.type === "task") {
      const findParent = columns.find(
        (col) => event.active.data.current?.parent === col.id
      );
      return setActiveTask({
        ...event.active.data.current.task,
        color: findParent?.color,
      });
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over || over.id === active.id) return;
    const movedArray = arrayMove(
      columns,
      columns.findIndex((col) => col.id === active.id),
      columns.findIndex((col) => col.id === over.id)
    );
    setColumns(movedArray);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || over.id === active.id) return;

    if (
      over.data.current?.type === "task" &&
      active.data.current?.type === "task"
    ) {
      if (over.data.current?.parent === active.data.current?.parent) {
        const parentIndex = columns.findIndex(
          (col) => col.id === over.data.current?.parent
        );
        const parentColumn = columns[parentIndex];
        const movedArray = arrayMove(
          parentColumn.tasks,
          parentColumn.tasks.findIndex(
            (task) => task.id === active.data.current?.task.id
          ),
          parentColumn.tasks.findIndex(
            (task) => task.id === over.data.current?.task.id
          )
        );
        setColumns([
          ...columns.slice(0, parentIndex),
          { ...parentColumn, tasks: movedArray },
          ...columns.slice(parentIndex + 1),
        ]);
        return;
      }

      const newColumns = columns.map((column) => {
        if (column.id === over.data.current?.parent) {
          const currentTask = active.data.current?.task;
          const findArrayPosition = column.tasks.findIndex(
            (col) => col.id === over.data.current?.task.id
          );
          return {
            ...column,
            tasks: [
              ...column.tasks.slice(0, findArrayPosition),
              currentTask,
              ...column.tasks.slice(findArrayPosition),
            ],
          };
        }

        if (column.id === active.data.current?.parent) {
          return {
            ...column,
            tasks: column.tasks.filter(
              (task) => task.id !== active.data.current?.task.id
            ),
          };
        }
        return column;
      });
      setColumns(newColumns);
    }

    if (
      over.data.current?.type === "column" &&
      active.data.current?.type === "task" &&
      over.data.current?.column.id !== active.data.current?.parent
    ) {
      const newColumns = columns.map((column) => {
        if (column.id === over.id) {
          return {
            ...column,
            tasks: column.tasks.concat(active.data.current?.task),
          };
        }

        if (column.id === active.data.current?.parent) {
          return {
            ...column,
            tasks: column.tasks.filter(
              (task) => task.id !== active.data.current?.task.id
            ),
          };
        }
        return column;
      });
      setColumns(newColumns);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-white text-2xl font-bold">KanbanBoard:</h1>
      <Button onClick={onAddColumn}>Add Column</Button>

      <div className="flex flex-row gap-6 min-h-[450px]">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <SortableContext items={columns.map((column) => column.id)}>
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onDeleteColumn={onDeleteColumn}
              >
                <div className="flex flex-col gap-4">
                  <Button
                    className="flex-grow"
                    onClick={() => onAddTask(column.id)}
                  >
                    Add +
                  </Button>
                  <SortableContext items={column.tasks.map((task) => task.id)}>
                    {column.tasks.map((task) => (
                      <ColumnCard
                        key={task.id}
                        task={task}
                        color={column.color}
                        onDelete={onDeleteTask}
                        parent={column.id}
                      />
                    ))}
                  </SortableContext>
                </div>
              </Column>
            ))}
          </SortableContext>

          {activeTask &&
            createPortal(
              <DragOverlay>
                <ColumnCard task={activeTask} color={activeTask.color} />
              </DragOverlay>,
              document.body
            )}

          {activeColumn &&
            createPortal(
              <DragOverlay>
                <Column column={activeColumn}>
                  <div className="flex flex-col gap-4">
                    <Button className="flex-grow">Add +</Button>
                    {activeColumn.tasks.map((task) => (
                      <ColumnCard
                        key={task.id}
                        task={task}
                        color={activeColumn.color}
                      />
                    ))}
                  </div>
                </Column>
              </DragOverlay>,
              document.body
            )}
        </DndContext>
      </div>
    </div>
  );
}

export default KanbanBoard;
