'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import {
  DUMMY_SALES_METRICS,
  DUMMY_CONVERSION_METRICS,
  DUMMY_REVENUE_PROJECTIONS,
  DUMMY_SOURCE_PERFORMANCE,
  DUMMY_AGENT_PERFORMANCE,
} from '@/lib/dummy-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import {
  IndianRupee,
  Users,
  Target,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  Percent,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const { isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'leads' | 'agents'>('overview');
  const [dateRange, setDateRange] = useState('6months');

  // Use dummy data for demo - wrapped in useMemo
  const salesMetrics = useMemo(() => isGuest ? DUMMY_SALES_METRICS : [], [isGuest]);
  const conversionMetrics = useMemo(() => isGuest ? DUMMY_CONVERSION_METRICS : [], [isGuest]);
  const revenueProjections = useMemo(() => isGuest ? DUMMY_REVENUE_PROJECTIONS : [], [isGuest]);
  const sourcePerformance = useMemo(() => isGuest ? DUMMY_SOURCE_PERFORMANCE : [], [isGuest]);
  const agentPerformance = useMemo(() => isGuest ? DUMMY_AGENT_PERFORMANCE : [], [isGuest]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalRevenue = salesMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalDeals = salesMetrics.reduce((sum, m) => sum + m.deals_closed, 0);
    const totalLeads = conversionMetrics.reduce((sum, m) => sum + m.total_leads, 0);
    const avgConversion = conversionMetrics.length > 0
      ? conversionMetrics.reduce((sum, m) => sum + m.conversion_rate, 0) / conversionMetrics.length
      : 0;

    // Calculate growth (compare last 2 periods)
    const lastPeriodRevenue = salesMetrics[salesMetrics.length - 1]?.revenue || 0;
    const prevPeriodRevenue = salesMetrics[salesMetrics.length - 2]?.revenue || 1;
    const revenueGrowth = ((lastPeriodRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;

    return {
      totalRevenue,
      totalDeals,
      totalLeads,
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Track your sales performance and make data-driven decisions
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</h3>
                  <div className={`flex items-center text-sm ${summaryStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summaryStats.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(summaryStats.revenueGrowth).toFixed(1)}% vs last period
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
                  <h3 className="text-2xl font-bold">{summaryStats.totalDeals}</h3>
                  <p className="text-sm text-muted-foreground">
                    Avg: {formatCurrency(summaryStats.avgDealSize)}
                  </p>
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
                  <h3 className="text-2xl font-bold">{summaryStats.totalLeads}</h3>
                  <p className="text-sm text-muted-foreground">
                    Across all sources
                  </p>
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
                  <h3 className="text-2xl font-bold">{summaryStats.avgConversion.toFixed(1)}%</h3>
                  <p className="text-sm text-muted-foreground">
                    Average across periods
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Percent className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Lead Analytics
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="h-4 w-4" />
              Agent Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
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
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>Distribution by source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourcePerformance}
                          dataKey="leads"
                          nameKey="source"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {sourcePerformance.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
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
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversion_rate"
                        name="Conversion %"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                  <CardDescription>Deals closed and revenue by period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salesMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis yAxisId="left" tickFormatter={(v) => formatCurrency(v)} />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'Revenue' ? formatCurrency(value as number) : value,
                            name,
                          ]}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#3b82f6" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="deals_closed"
                          name="Deals"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Projections */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>Projected revenue based on pipeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueProjections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          formatter={(value, name) => [formatCurrency(value as number), name]}
                        />
                        <Legend />
                        <Bar dataKey="projected_revenue" name="Projected" fill="#3b82f6" />
                        <Bar dataKey="pipeline_value" name="Pipeline" fill="#e5e7eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Deals</TableHead>
                      <TableHead className="text-right">Avg Deal Size</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesMetrics.map((metric) => (
                      <TableRow key={metric.period}>
                        <TableCell className="font-medium">{metric.period}</TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.revenue)}</TableCell>
                        <TableCell className="text-right">{metric.deals_closed}</TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.avg_deal_size)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(metric.commission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            {/* Source Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Compare lead sources by conversion and ROI</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Conversions</TableHead>
                      <TableHead className="text-right">Conv. Rate</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost/Lead</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
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
                        <TableCell className="text-right">{formatCurrency(source.revenue)}</TableCell>
                        <TableCell className="text-right">
                          {source.cost_per_lead ? `₹${source.cost_per_lead}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {source.roi && source.roi < 999 ? (
                            <span className="text-green-600">{source.roi}%</span>
                          ) : (
                            <span className="text-green-600">∞</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Trend</CardTitle>
                  <CardDescription>Lead conversion rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conversionMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v) => `${v}%`} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Conversion Rate']} />
                        <Line
                          type="monotone"
                          dataKey="conversion_rate"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Conversion Time</CardTitle>
                  <CardDescription>Days from lead to close</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(v) => `${v}d`} />
                        <Tooltip formatter={(v) => [`${v} days`, 'Avg. Time']} />
                        <Bar dataKey="avg_conversion_time_days" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
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
                      <TableHead className="text-right">Avg Response</TableHead>
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
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {agent.avg_response_time_mins}m
                          </div>
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

            {/* Agent Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Comparison</CardTitle>
                <CardDescription>Revenue and deals comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="agent_name" width={100} />
                      <Tooltip formatter={(v) => formatCurrency(v as number)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
