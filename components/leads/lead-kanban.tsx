'use client';

import { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useLeadStore } from '@/lib/stores';
import { LEAD_STATUS_ORDER, LEAD_STATUS_LABELS, PRIORITY_ICONS } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import type { Lead, LeadStatus } from '@/lib/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-50 border-blue-200',
  contacted: 'bg-yellow-50 border-yellow-200',
  visit_scheduled: 'bg-purple-50 border-purple-200',
  negotiation: 'bg-orange-50 border-orange-200',
  closed_won: 'bg-green-50 border-green-200',
  closed_lost: 'bg-gray-50 border-gray-200',
};

function LeadCard({ lead, index }: { lead: Lead; index: number }) {
  const formatBudget = (budget: number) => {
    if (budget >= 10000000) {
      return `${(budget / 10000000).toFixed(1)}Cr`;
    } else if (budget >= 100000) {
      return `${(budget / 100000).toFixed(1)}L`;
    }
    return budget.toLocaleString('en-IN');
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <Link href={`/leads/${lead.id}`}>
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow mb-2 ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm truncate flex-1">{lead.name}</h4>
              <span className="text-xs ml-1">
                {PRIORITY_ICONS[lead.lead_priority]}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </p>
            
            {lead.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-1 truncate">
                <MapPin className="w-3 h-3" />
                {lead.location}
              </p>
            )}
            
            {lead.budget && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                {formatBudget(lead.budget)}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <Badge variant="outline" className="text-xs capitalize">
                {lead.source}
              </Badge>
              <span className="text-xs text-gray-400">
                Score: {lead.lead_score}
              </span>
            </div>
          </div>
        </Link>
      )}
    </Draggable>
  );
}

export function LeadKanban() {
  const { filteredLeads, updateLead } = useLeadStore();
  const leads = filteredLeads();

  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as LeadStatus;
    
    updateLead(draggableId, { status: newStatus });
  }, [updateLead]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUS_ORDER.map((status) => {
          const statusLeads = getLeadsByStatus(status);
          
          return (
            <div
              key={status}
              className="shrink-0 w-72"
            >
              <Card className={`h-full ${STATUS_COLORS[status]} border`}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{LEAD_STATUS_LABELS[status]}</span>
                    <Badge variant="secondary" className="ml-2">
                      {statusLeads.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-2">
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-50 rounded-lg p-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                      >
                        {statusLeads.map((lead, index) => (
                          <LeadCard key={lead.id} lead={lead} index={index} />
                        ))}
                        {provided.placeholder}
                        
                        {statusLeads.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center text-gray-400 text-sm py-8">
                            No leads
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
