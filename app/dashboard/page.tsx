'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore, useTaskStore } from '@/lib/stores';
import {
  DUMMY_DASHBOARD_STATS,
  DUMMY_SALES_METRICS,
  DUMMY_CONVERSION_METRICS,
  DUMMY_SOURCE_PERFORMANCE,
  DUMMY_AGENT_PERFORMANCE,
} from '@/lib/dummy-data';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Flame,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { format, isToday, isTomorrow } from 'date-fns';
import { LEAD_SOURCE_LABELS, LEAD_STATUS_LABELS, PRIORITY_ICONS } from '@/lib/config';
import type { Lead, Task } from '@/lib/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const { user, isGuest } = useAuth();
  const { leads } = useLeadStore();
  const { tasks, dueTodayTasks, dueTomorrowTasks, overdueTasks } = useTaskStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [dateRange, setDateRange] = useState('6months');

  const salesMetrics = useMemo(() => isGuest ? DUMMY_SALES_METRICS : [], [isGuest]);
  const conversionMetrics = useMemo(() => isGuest ? DUMMY_CONVERSION_METRICS : [], [isGuest]);
  const sourcePerformance = useMemo(() => isGuest ? DUMMY_SOURCE_PERFORMANCE : [], [isGuest]);
  const agentPerformance = useMemo(() => isGuest ? DUMMY_AGENT_PERFORMANCE : [], [isGuest]);

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

  const analyticsStats = useMemo(() => {
    const totalRevenue = salesMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalDeals = salesMetrics.reduce((sum, m) => sum + m.deals_closed, 0);
    const avgConversion = conversionMetrics.length > 0
      ? conversionMetrics.reduce((sum, m) => sum + m.conversion_rate, 0) / conversionMetrics.length
      : 0;

    const lastPeriodRevenue = salesMetrics[salesMetrics.length - 1]?.revenue || 0;
    const prevPeriodRevenue = salesMetrics[salesMetrics.length - 2]?.revenue || 1;
    const revenueGrowth = ((lastPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;

    return {
      totalRevenue,
      totalDeals,
      avgConversion,
      revenueGrowth,
      avgDealSize: totalDeals > 0 ? totalRevenue / totalDeals : 0,
    };
  }, [salesMetrics, conversionMetrics]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

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

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name;
  };

  const getDueLabel = (task: Task) => {
    const dueDate = task.due_date.toDate();
    if (isToday(dueDate)) return 'Due Today';
    if (isTomorrow(dueDate)) return 'Due Tomorrow';
    return format(dueDate, 'MMM d');
  };

  const isTaskOverdue = (task: Task) => {
    return task.due_date.toDate() < new Date() && !isToday(task.due_date.toDate());
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-500">
              Here&apos;s what&apos;s happening with your leads today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger 
              value="overview" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <PieChartIcon className="h-4 w-4" />
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Leads</p>
                      <p className="text-2xl font-bold">{stats?.total_leads || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Hot Leads</p>
                      <p className="text-2xl font-bold">{stats?.hot_leads || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Flame className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Follow-ups Due</p>
                      <p className="text-2xl font-bold">{stats?.followups_due_today || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                      <p className="text-2xl font-bold">{(stats?.conversion_rate || 0).toFixed(1)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <div className="h-64 flex items-center justify-center text-gray-500">No data yet</div>
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
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">No data yet</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Leads & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Leads</CardTitle>
                  <Link href="/leads">
                    <Button variant="ghost" size="sm">View All<ArrowRight className="ml-1 w-4 h-4" /></Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recent_leads && stats.recent_leads.length > 0 ? (
                      stats.recent_leads.map((lead: Lead) => (
                        <Link key={lead.id} href={`/leads/${lead.id}`}>
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
                    <Button variant="ghost" size="sm">View All<ArrowRight className="ml-1 w-4 h-4" /></Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allDueTasks.length > 0 ? (
                      allDueTasks.map((task) => (
                        <Link key={task.id} href={`/leads/${task.lead_id}`}>
                          <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500">{getLeadName(task.lead_id)}</p>
                              </div>
                              <Badge variant={isTaskOverdue(task) ? 'destructive' : 'outline'}>
                                <Clock className="w-3 h-3 mr-1" />
                                {getDueLabel(task)}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {task.type}
                            </Badge>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(analyticsStats.totalRevenue)}</h3>
                      <div className={`flex items-center text-sm ${analyticsStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsStats.revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(analyticsStats.revenueGrowth).toFixed(1)}% vs last period
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Deals Closed</p>
                      <h3 className="text-2xl font-bold">{analyticsStats.totalDeals}</h3>
                      <p className="text-sm text-muted-foreground">Avg: {formatCurrency(analyticsStats.avgDealSize)}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                      <h3 className="text-2xl font-bold">{stats?.total_leads || 0}</h3>
                      <p className="text-sm text-muted-foreground">Across all sources</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <h3 className="text-2xl font-bold">{analyticsStats.avgConversion.toFixed(1)}%</h3>
                      <p className="text-sm text-muted-foreground">Average across periods</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Percent className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Funnel Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Conversion Funnel</CardTitle>
                  <CardDescription>Track leads through your sales pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={conversionMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="total_leads" name="Total Leads" fill="#3b82f6" />
                        <Bar yAxisId="left" dataKey="qualified_leads" name="Qualified" fill="#10b981" />
                        <Bar yAxisId="left" dataKey="converted_leads" name="Converted" fill="#8b5cf6" />
                        <Line yAxisId="right" type="monotone" dataKey="conversion_rate" name="Conversion %" stroke="#f59e0b" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Source Performance & Conversion Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                  <CardDescription>Compare lead sources by conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead className="text-right">Conv.</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourcePerformance.map((source) => (
                        <TableRow key={source.source}>
                          <TableCell className="font-medium">{source.source}</TableCell>
                          <TableCell className="text-right">{source.leads}</TableCell>
                          <TableCell className="text-right">{source.conversions}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={source.conversion_rate >= 10 ? 'default' : 'secondary'}>
                              {source.conversion_rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversion Trend</CardTitle>
                  <CardDescription>Lead conversion rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conversionMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Conversion Rate']} />
                        <Line type="monotone" dataKey="conversion_rate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Agent Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Compare team member performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Deals</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentPerformance.map((agent) => (
                      <TableRow key={agent.agent_id}>
                        <TableCell className="font-medium">{agent.agent_name}</TableCell>
                        <TableCell className="text-right">{agent.leads_handled}</TableCell>
                        <TableCell className="text-right">{agent.deals_closed}</TableCell>
                        <TableCell className="text-right">{formatCurrency(agent.revenue)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={agent.conversion_rate >= 14 ? 'default' : 'secondary'}>
                            {agent.conversion_rate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {agent.customer_rating}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
