'use client';

import Link from 'next/link';
import { useLeadStore } from '@/lib/stores';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, PRIORITY_ICONS } from '@/lib/config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export function LeadTable() {
  const { filteredLeads, deleteLead } = useLeadStore();
  const leads = filteredLeads();

  const formatBudget = (budget?: number) => {
    if (!budget) return '-';
    if (budget >= 10000000) {
      return `₹${(budget / 10000000).toFixed(1)}Cr`;
    } else if (budget >= 100000) {
      return `₹${(budget / 100000).toFixed(1)}L`;
    }
    return `₹${budget.toLocaleString('en-IN')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HOT': return 'destructive';
      case 'WARM': return 'default';
      default: return 'secondary';
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No leads found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <Link href={`/leads/${lead.id}`} className="font-medium hover:text-primary">
                  {lead.name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {lead.phone}
                  </p>
                  {lead.email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lead.location ? (
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {lead.location}
                  </p>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="font-medium">
                {formatBudget(lead.budget)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {LEAD_SOURCE_LABELS[lead.source] || lead.source}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {LEAD_STATUS_LABELS[lead.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(lead.lead_priority) as 'destructive' | 'default' | 'secondary'}>
                  {PRIORITY_ICONS[lead.lead_priority]} {lead.lead_priority}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">{lead.lead_score}</span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {format(lead.created_at.toDate(), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/leads/${lead.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => deleteLead(lead.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
