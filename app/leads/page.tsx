'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore } from '@/lib/stores';
import { DashboardLayout } from '@/components/layout';
import { LeadKanban } from '@/components/leads/lead-kanban';
import { LeadTable } from '@/components/leads/lead-table';
import { LeadFilters } from '@/components/leads/lead-filters';
import { AddLeadDialog } from '@/components/leads/add-lead-dialog';
import { ImportCSVDialog } from '@/components/leads/import-csv-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LeadsPage() {
  const { isGuest, loading } = useAuth();
  const { leads, viewMode, setViewMode, filters, setFilters, initGuestData } = useLeadStore();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (isGuest && leads.length === 0) {
      initGuestData();
    }
  }, [isGuest, leads.length, initGuestData]);

  const handleSearch = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-500">{leads.length} total leads</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setAddLeadOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or location..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <LeadFilters />
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'list')}>
              <TabsList>
                <TabsTrigger value="kanban">
                  <LayoutGrid className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'kanban' ? (
          <LeadKanban />
        ) : (
          <LeadTable />
        )}

        {/* Dialogs */}
        <AddLeadDialog open={addLeadOpen} onOpenChange={setAddLeadOpen} />
        <ImportCSVDialog open={importOpen} onOpenChange={setImportOpen} />
      </div>
    </DashboardLayout>
  );
}
