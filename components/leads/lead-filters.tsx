'use client';

import { useLeadStore } from '@/lib/stores';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/lib/config';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LeadFilters() {
  const { filters, setFilters, resetFilters } = useLeadStore();
  
  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.source !== 'all' || 
    filters.priority !== 'all';

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                {[filters.status !== 'all', filters.source !== 'all', filters.priority !== 'all'].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.status} onValueChange={(v) => setFilters({ status: v as typeof filters.status })}>
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
              <DropdownMenuRadioItem key={key} value={key}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Source</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.source} onValueChange={(v) => setFilters({ source: v })}>
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
              <DropdownMenuRadioItem key={key} value={key}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={filters.priority} onValueChange={(v) => setFilters({ priority: v })}>
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="HOT">🔥 Hot</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="WARM">🟡 Warm</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="COLD">❄️ Cold</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
