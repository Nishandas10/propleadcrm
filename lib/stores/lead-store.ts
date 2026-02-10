// Zustand store for Lead Management

import { create } from "zustand";
import { Lead, LeadStatus } from "@/lib/types";
import { DUMMY_LEADS } from "@/lib/dummy-data";

interface LeadFilters {
  search: string;
  status: LeadStatus | "all";
  source: string;
  priority: string;
  assignedTo: string;
}

interface LeadStore {
  leads: Lead[];
  selectedLead: Lead | null;
  filters: LeadFilters;
  viewMode: "list" | "kanban";
  isLoading: boolean;

  // Actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  selectLead: (lead: Lead | null) => void;
  setFilters: (filters: Partial<LeadFilters>) => void;
  resetFilters: () => void;
  setViewMode: (mode: "list" | "kanban") => void;
  setLoading: (loading: boolean) => void;

  // Computed
  filteredLeads: () => Lead[];

  // Guest mode
  initGuestData: () => void;
}

const defaultFilters: LeadFilters = {
  search: "",
  status: "all",
  source: "all",
  priority: "all",
  assignedTo: "all",
};

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  selectedLead: null,
  filters: defaultFilters,
  viewMode: "kanban",
  isLoading: false,

  setLeads: (leads) => set({ leads }),

  addLead: (lead) =>
    set((state) => ({
      leads: [lead, ...state.leads],
    })),

  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead,
      ),
      selectedLead:
        state.selectedLead?.id === id
          ? { ...state.selectedLead, ...updates }
          : state.selectedLead,
    })),

  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      selectedLead: state.selectedLead?.id === id ? null : state.selectedLead,
    })),

  selectLead: (lead) => set({ selectedLead: lead }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setLoading: (loading) => set({ isLoading: loading }),

  filteredLeads: () => {
    const { leads, filters } = get();

    return leads.filter((lead) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(searchLower) ||
          lead.phone.includes(filters.search) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.location?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && lead.status !== filters.status) {
        return false;
      }

      // Source filter
      if (filters.source !== "all" && lead.source !== filters.source) {
        return false;
      }

      // Priority filter
      if (
        filters.priority !== "all" &&
        lead.lead_priority !== filters.priority
      ) {
        return false;
      }

      // Assigned to filter
      if (
        filters.assignedTo !== "all" &&
        lead.assigned_to !== filters.assignedTo
      ) {
        return false;
      }

      return true;
    });
  },

  initGuestData: () => set({ leads: DUMMY_LEADS }),
}));
