'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { DUMMY_INTEGRATIONS, DUMMY_AD_CAMPAIGNS } from '@/lib/dummy-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Facebook,
  Instagram,
  ExternalLink,
  Copy,
  RefreshCw,
  CheckCircle,
  Plus,
  Settings,
  Zap,
  TrendingUp,
  Users,
  IndianRupee,
  Link2,
  Unlink,
  Play,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function IntegrationsPage() {
  const { isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'campaigns'>('integrations');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'facebook' | 'instagram' | 'google' | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Use dummy data for demo
  const integrations = useMemo(() => isGuest ? DUMMY_INTEGRATIONS : [], [isGuest]);
  const campaigns = useMemo(() => isGuest ? DUMMY_AD_CAMPAIGNS : [], [isGuest]);

  // Stats
  const stats = useMemo(() => {
    const totalLeads = integrations.reduce((sum, i) => sum + i.total_leads_imported, 0);
    const activeIntegrations = integrations.filter(i => i.status === 'active').length;
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
    
    return { totalLeads, activeIntegrations, totalSpend, avgCostPerLead };
  }, [integrations, campaigns]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'google':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleConnect = (platform: 'facebook' | 'instagram' | 'google') => {
    setSelectedPlatform(platform);
    setShowConnectDialog(true);
  };

  const handleCopyWebhook = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard!');
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lead Ad Integration</h1>
            <p className="text-muted-foreground">
              Connect your social media ads and automatically capture leads
            </p>
          </div>
          <Button onClick={() => handleConnect('facebook')}>
            <Plus className="mr-2 h-4 w-4" />
            Connect Platform
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads Imported</p>
                  <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Integrations</p>
                  <h3 className="text-2xl font-bold">{stats.activeIntegrations}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ad Spend</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</h3>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cost/Lead</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(Math.round(stats.avgCostPerLead))}</h3>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              Connected Platforms
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Facebook */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <Facebook className="w-full h-full" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Facebook className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Facebook Lead Ads</CardTitle>
                        <CardDescription>Import leads automatically</CardDescription>
                      </div>
                    </div>
                    {integrations.find(i => i.platform === 'facebook')?.status === 'active' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {integrations.find(i => i.platform === 'facebook') ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leads imported</span>
                        <span className="font-medium">
                          {integrations.find(i => i.platform === 'facebook')?.total_leads_imported}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last lead</span>
                        <span className="font-medium">
                          {integrations.find(i => i.platform === 'facebook')?.last_lead_at
                            ? formatDistanceToNow(
                                integrations.find(i => i.platform === 'facebook')!.last_lead_at!.toDate(),
                                { addSuffix: true }
                              )
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedIntegration('int-1');
                            setShowSettingsDialog(true);
                          }}
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={() => handleConnect('facebook')}>
                      Connect Facebook
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Instagram */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <Instagram className="w-full h-full" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Instagram Lead Ads</CardTitle>
                        <CardDescription>Capture IG ad leads</CardDescription>
                      </div>
                    </div>
                    {integrations.find(i => i.platform === 'instagram')?.status === 'active' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {integrations.find(i => i.platform === 'instagram') ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leads imported</span>
                        <span className="font-medium">
                          {integrations.find(i => i.platform === 'instagram')?.total_leads_imported}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last lead</span>
                        <span className="font-medium">
                          {integrations.find(i => i.platform === 'instagram')?.last_lead_at
                            ? formatDistanceToNow(
                                integrations.find(i => i.platform === 'instagram')!.last_lead_at!.toDate(),
                                { addSuffix: true }
                              )
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedIntegration('int-2');
                            setShowSettingsDialog(true);
                          }}
                        >
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={() => handleConnect('instagram')}>
                      Connect Instagram
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Zapier */}
              <Card className="relative overflow-hidden border-dashed">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Zapier Integration</CardTitle>
                      <CardDescription>Connect 5000+ apps</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use Zapier to connect PropLead with thousands of other apps and automate your workflow.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Zapier
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Integration Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Integrations</CardTitle>
                <CardDescription>Manage your connected platforms and webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(integration.platform)}
                            <span className="capitalize font-medium">{integration.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{integration.account_name}</p>
                            <p className="text-sm text-muted-foreground">{integration.page_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(integration.status)}</TableCell>
                        <TableCell>{integration.total_leads_imported}</TableCell>
                        <TableCell>
                          {integration.webhook_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyWebhook(integration.webhook_url)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not configured</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {integration.last_sync_at
                            ? formatDistanceToNow(integration.last_sync_at.toDate(), { addSuffix: true })
                            : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedIntegration(integration.id);
                                  setShowSettingsDialog(true);
                                }}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Sync Now
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Unlink className="mr-2 h-4 w-4" />
                                Disconnect
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ad Campaigns</CardTitle>
                <CardDescription>Track performance of your lead generation campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Leads</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">Cost/Lead</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.campaign_name}</p>
                            {campaign.ad_set_name && (
                              <p className="text-sm text-muted-foreground">{campaign.ad_set_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(campaign.platform)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={campaign.status === 'active' ? 'default' : 'secondary'}
                            className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {campaign.status === 'active' && <Play className="mr-1 h-3 w-3" />}
                            {campaign.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{campaign.leads_count}</TableCell>
                        <TableCell className="text-right">
                          {campaign.spend ? formatCurrency(campaign.spend) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.cost_per_lead ? formatCurrency(campaign.cost_per_lead) : '-'}
                        </TableCell>
                        <TableCell>
                          {format(campaign.start_date.toDate(), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Connect Platform Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPlatform && getPlatformIcon(selectedPlatform)}
                Connect {selectedPlatform ? selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : ''} Lead Ads
              </DialogTitle>
              <DialogDescription>
                Connect your {selectedPlatform} account to automatically import leads from your ad campaigns.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Connect your {selectedPlatform} Business account</li>
                  <li>2. Select the pages and forms to import from</li>
                  <li>3. Configure lead assignment and notifications</li>
                  <li>4. New leads will automatically appear in PropLead</li>
                </ol>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Or use Zapier webhook:</h4>
                <div className="space-y-3">
                  <div>
                    <Label>Your Webhook URL</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value="https://api.proplead.com/webhooks/leads/abc123"
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyWebhook('https://api.proplead.com/webhooks/leads/abc123')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this URL in Zapier to connect {selectedPlatform} Lead Ads to PropLead.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success(`${selectedPlatform} connection initiated! Complete setup in the popup.`);
                setShowConnectDialog(false);
              }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect with {selectedPlatform}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Integration Settings</DialogTitle>
              <DialogDescription>Configure how leads are imported and processed</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-assign leads</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign new leads to team members</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Default Lead Status</Label>
                <Select defaultValue="new">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notification Email</Label>
                <Input type="email" placeholder="leads@company.com" defaultValue="leads@proplead.com" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Send WhatsApp welcome message</Label>
                  <p className="text-sm text-muted-foreground">Auto-send greeting to new leads</p>
                </div>
                <Switch />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Settings saved!');
                setShowSettingsDialog(false);
              }}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
