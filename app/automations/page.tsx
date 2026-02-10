'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DashboardLayout } from '@/components/layout';
import { DUMMY_AUTOMATIONS } from '@/lib/dummy-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Zap, Clock, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Automation } from '@/lib/types';

const TRIGGER_LABELS: Record<string, string> = {
  lead_created: 'When lead is created',
  after_hours: 'After X hours',
  after_days: 'After X days',
  status_changed: 'When status changes',
  no_response: 'No response for X days',
};

export default function AutomationsPage() {
  const { isGuest, loading } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    if (isGuest) {
      setAutomations(DUMMY_AUTOMATIONS);
    }
  }, [isGuest]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, active: !auto.active } : auto
    ));
  };

  const deleteAutomation = (id: string) => {
    if (confirm('Are you sure you want to delete this automation?')) {
      setAutomations(prev => prev.filter(auto => auto.id !== id));
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
            <p className="text-gray-500">Set up automatic WhatsApp messages</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">How Automations Work</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Automations send WhatsApp messages automatically based on triggers you set up. 
                  Messages are sent as templates (pre-approved) or within the 24-hour customer service window.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No automations yet</h3>
                <p className="text-gray-500 mb-4">Create your first automation to start sending automatic messages</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            automations.map((automation) => (
              <Card key={automation.id} className={!automation.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {automation.name}
                        <Badge variant={automation.active ? 'default' : 'secondary'}>
                          {automation.active ? 'Active' : 'Paused'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {TRIGGER_LABELS[automation.trigger]}
                        {automation.trigger_value && ` (${automation.trigger_value})`}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={automation.active}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-600">{automation.template_text}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Created {format(automation.created_at.toDate(), 'MMM d, yyyy')}</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingAutomation(automation)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteAutomation(automation.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Example Templates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Example Templates</CardTitle>
            <CardDescription>Copy and customize these templates for your automations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Welcome Message',
                  template: 'Hi {{name}}, thanks for your interest in properties at {{location}}. I\'m {{agent_name}}, your dedicated property consultant. What\'s your budget range?',
                },
                {
                  title: '24-Hour Follow-up',
                  template: 'Hi {{name}}, just checking in! Did you have any questions about the properties we discussed? I\'m here to help.',
                },
                {
                  title: 'Site Visit Reminder',
                  template: 'Hi {{name}}, just a reminder about your site visit tomorrow at {{time}}. Looking forward to showing you the property!',
                },
                {
                  title: 'Price Drop Alert',
                  template: 'Great news {{name}}! The property you were interested in at {{location}} now has a special offer. Would you like to know more?',
                },
              ].map((example, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{example.title}</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{example.template}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen || !!editingAutomation} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingAutomation(null);
          }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAutomation ? 'Edit Automation' : 'Create Automation'}</DialogTitle>
              <DialogDescription>
                Set up an automatic WhatsApp message based on triggers
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Automation Name</Label>
                <Input placeholder="e.g., Welcome Message" defaultValue={editingAutomation?.name} />
              </div>
              
              <div>
                <Label>Trigger</Label>
                <Select defaultValue={editingAutomation?.trigger || 'lead_created'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead_created">When lead is created</SelectItem>
                    <SelectItem value="after_hours">After X hours (no response)</SelectItem>
                    <SelectItem value="after_days">After X days (no response)</SelectItem>
                    <SelectItem value="status_changed">When status changes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Message Template</Label>
                <Textarea 
                  placeholder="Hi {{name}}, thanks for your interest..."
                  className="min-h-24"
                  defaultValue={editingAutomation?.template_text}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{{name}}'}, {'{{location}}'}, {'{{budget}}'} as placeholders
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingAutomation(null);
                }}>
                  Cancel
                </Button>
                <Button>
                  {editingAutomation ? 'Save Changes' : 'Create Automation'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
