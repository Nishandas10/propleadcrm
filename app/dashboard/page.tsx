'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore, useTaskStore } from '@/lib/stores';
import { DUMMY_DASHBOARD_STATS } from '@/lib/dummy-data';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Flame,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, isToday, isTomorrow } from 'date-fns';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PRIORITY_ICONS } from '@/lib/config';
import type { Lead, Task } from '@/lib/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium">{lead.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </p>
          </div>
          <Badge variant={lead.lead_priority === 'HOT' ? 'destructive' : lead.lead_priority === 'WARM' ? 'default' : 'secondary'}>
            {PRIORITY_ICONS[lead.lead_priority]} {lead.lead_priority}
          </Badge>
        </div>
        {lead.location && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {lead.location}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline">{LEAD_STATUS_LABELS[lead.status]}</Badge>
          <span className="text-xs text-gray-400">
            {format(lead.created_at.toDate(), 'MMM d')}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TaskCard({ task, leadName }: { task: Task; leadName?: string }) {
  const getDueLabel = () => {
    const dueDate = task.due_date.toDate();
    if (isToday(dueDate)) return 'Due Today';
    if (isTomorrow(dueDate)) return 'Due Tomorrow';
    return format(dueDate, 'MMM d');
  };

  const isOverdue = task.due_date.toDate() < new Date() && !isToday(task.due_date.toDate());

  return (
    <Link href={`/leads/${task.lead_id}`}>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-medium">{task.title}</p>
            {leadName && (
              <p className="text-sm text-gray-500">{leadName}</p>
            )}
          </div>
          <Badge variant={isOverdue ? 'destructive' : 'outline'}>
            <Clock className="w-3 h-3 mr-1" />
            {getDueLabel()}
          </Badge>
        </div>
        <Badge variant="secondary" className="capitalize">
          {task.type}
        </Badge>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, isGuest, loading } = useAuth();
  const { leads } = useLeadStore();
  const { tasks, dueTodayTasks, dueTomorrowTasks, overdueTasks } = useTaskStore();

  const stats = useMemo(() => {
    if (isGuest) {
      return DUMMY_DASHBOARD_STATS;
    }
    
    if (leads.length === 0) {
      return null;
    }

    const hotLeads = leads.filter(l => l.lead_priority === 'HOT').length;
    const warmLeads = leads.filter(l => l.lead_priority === 'WARM').length;
    const coldLeads = leads.filter(l => l.lead_priority === 'COLD').length;
    const closedWon = leads.filter(l => l.status === 'closed_won').length;
    
    const leadsBySource: Record<string, number> = {};
    leads.forEach(lead => {
      leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
    });

    const leadsByStatus: Record<string, number> = {};
    leads.forEach(lead => {
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    });

    return {
      total_leads: leads.length,
      hot_leads: hotLeads,
      warm_leads: warmLeads,
      cold_leads: coldLeads,
      followups_due_today: dueTodayTasks().length,
      conversion_rate: leads.length > 0 ? (closedWon / leads.length) * 100 : 0,
      leads_by_source: leadsBySource,
      leads_by_status: leadsByStatus,
      recent_leads: leads.slice(0, 5),
      due_tasks: tasks.filter(t => t.status === 'pending').slice(0, 5),
    };
  }, [isGuest, leads, tasks, dueTodayTasks]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const sourceChartData = stats ? Object.entries(stats.leads_by_source)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: LEAD_SOURCE_LABELS[key] || key,
      value,
    })) : [];

  const statusChartData = stats ? Object.entries(stats.leads_by_status)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: LEAD_STATUS_LABELS[key] || key,
      value,
    })) : [];

  const allDueTasks = [...overdueTasks(), ...dueTodayTasks(), ...dueTomorrowTasks()].slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">
            Here&apos;s what&apos;s happening with your leads today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Leads"
            value={stats?.total_leads || 0}
            icon={Users}
          />
          <StatCard
            title="Hot Leads"
            value={stats?.hot_leads || 0}
            icon={Flame}
            className="border-red-200"
          />
          <StatCard
            title="Follow-ups Due"
            value={stats?.followups_due_today || 0}
            icon={CalendarCheck}
          />
          <StatCard
            title="Conversion Rate"
            value={`${(stats?.conversion_rate || 0).toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {sourceChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusChartData} layout="vertical">
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <Link href="/leads">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recent_leads && stats.recent_leads.length > 0 ? (
                  stats.recent_leads.map((lead: Lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No leads yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allDueTasks.length > 0 ? (
                  allDueTasks.map((task) => {
                    const lead = leads.find(l => l.id === task.lead_id);
                    return (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        leadName={lead?.name}
                      />
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
