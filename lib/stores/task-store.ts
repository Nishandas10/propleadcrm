// Zustand store for Task Management

import { create } from "zustand";
import { Task, TaskStatus } from "@/lib/types";
import { DUMMY_TASKS } from "@/lib/dummy-data";
import { isToday, isTomorrow, isPast } from "date-fns";

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setLoading: (loading: boolean) => void;

  // Computed
  tasksByLead: (leadId: string) => Task[];
  dueTodayTasks: () => Task[];
  dueTomorrowTasks: () => Task[];
  overdueTasks: () => Task[];
  pendingTasks: () => Task[];

  // Guest mode
  initGuestData: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: "done" as TaskStatus } : task,
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  tasksByLead: (leadId) => {
    return get().tasks.filter((task) => task.lead_id === leadId);
  },

  dueTodayTasks: () => {
    return get().tasks.filter(
      (task) => task.status === "pending" && isToday(task.due_date.toDate()),
    );
  },

  dueTomorrowTasks: () => {
    return get().tasks.filter(
      (task) => task.status === "pending" && isTomorrow(task.due_date.toDate()),
    );
  },

  overdueTasks: () => {
    return get().tasks.filter(
      (task) =>
        task.status === "pending" &&
        isPast(task.due_date.toDate()) &&
        !isToday(task.due_date.toDate()),
    );
  },

  pendingTasks: () => {
    return get().tasks.filter((task) => task.status === "pending");
  },

  initGuestData: () => set({ tasks: DUMMY_TASKS }),
}));
