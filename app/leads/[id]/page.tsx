'use client';

import { useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore, useTaskStore } from '@/lib/stores';
import { DUMMY_LEADS, DUMMY_MESSAGES, DUMMY_TASKS } from '@/lib/dummy-data';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Calendar,
  MessageSquare,
  CheckSquare,
  FileText,
  Send,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, PROPERTY_TYPE_LABELS, PRIORITY_ICONS, TASK_TYPE_LABELS } from '@/lib/config';
import type { Message, LeadStatus } from '@/lib/types';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isGuest, loading: authLoading } = useAuth();
  const { leads, updateLead, deleteLead } = useLeadStore();
  const { tasks, completeTask } = useTaskStore();
  
  // Derive lead data from stores/dummy data
  const lead = useMemo(() => {
    if (isGuest) {
      return DUMMY_LEADS.find(l => l.id === resolvedParams.id) || null;
    }
    return leads.find(l => l.id === resolvedParams.id) || null;
  }, [isGuest, resolvedParams.id, leads]);
  
  const leadTasks = useMemo(() => {
    if (isGuest) {
      return DUMMY_TASKS.filter(t => t.lead_id === resolvedParams.id);
    }
    return tasks.filter(t => t.lead_id === resolvedParams.id);
  }, [isGuest, resolvedParams.id, tasks]);
  
  // Get initial messages from dummy data
  const dummyMessages = useMemo(() => {
    if (isGuest) {
      return DUMMY_MESSAGES[resolvedParams.id] || [];
    }
    return [];
  }, [isGuest, resolvedParams.id]);
  
  // Track additional messages added by user
  const [additionalMessages, setAdditionalMessages] = useState<Message[]>([]);
  const messages = useMemo(() => [...dummyMessages, ...additionalMessages], [dummyMessages, additionalMessages]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleStatusChange = (status: LeadStatus) => {
    if (lead) {
      updateLead(lead.id, { status });
    }
  };

  const handleDelete = () => {
    if (lead && confirm('Are you sure you want to delete this lead?')) {
      deleteLead(lead.id);
      router.push('/leads');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !lead) return;
    
    // In guest mode, just add to local state
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      lead_id: lead.id,
      direction: 'out',
      content: newMessage,
      message_type: 'text',
      status: 'sent',
      timestamp: { toDate: () => new Date() } as Message['timestamp'],
    };
    
    setAdditionalMessages(prev => [...prev, newMsg]);
    setNewMessage('');
  };

  const generateAiSuggestions = async () => {
    setLoadingAi(true);
    // Simulate AI response in demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAiSuggestions([
      `Hi ${lead?.name?.split(' ')[0]}, I have some great properties in ${lead?.location || 'your preferred area'} within your budget. Would you like to schedule a visit this weekend?`,
      `Hello! Based on your requirements, I found a perfect ${lead?.property_type || 'property'} for you. Can we discuss the details today?`,
      `Good day! Just checking if you received the property brochures I sent. Let me know if you have any questions.`,
    ]);
    setLoadingAi(false);
  };

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Not specified';
    if (budget >= 10000000) {
      return `₹${(budget / 10000000).toFixed(2)} Cr`;
    } else if (budget >= 100000) {
      return `₹${(budget / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${budget.toLocaleString('en-IN')}`;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h1 className="text-xl font-semibold mb-4">Lead not found</h1>
          <Link href="/leads">
            <Button>Back to Leads</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <Badge variant={lead.lead_priority === 'HOT' ? 'destructive' : lead.lead_priority === 'WARM' ? 'default' : 'secondary'}>
                {PRIORITY_ICONS[lead.lead_priority]} {lead.lead_priority}
              </Badge>
            </div>
            <p className="text-gray-500">Score: {lead.lead_score}/100</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={lead.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
              
              {lead.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{lead.email}</p>
                  </div>
                </div>
              )}
              
              {lead.location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{lead.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">{formatBudget(lead.budget)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{format(lead.created_at.toDate(), 'PPP')}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Source</span>
                  <Badge variant="outline">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
                </div>
                {lead.property_type && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Property Type</span>
                    <span>{PROPERTY_TYPE_LABELS[lead.property_type]}</span>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{lead.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <Card className="lg:col-span-2">
            <Tabs defaultValue="messages">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="messages">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </TabsTrigger>
                  <TabsTrigger value="tasks">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger value="notes">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="pt-4">
                {/* Messages Tab */}
                <TabsContent value="messages" className="mt-0">
                  <div className="space-y-4">
                    {/* AI Suggestions */}
                    <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-sm">AI Reply Suggestions</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={generateAiSuggestions}
                          disabled={loadingAi}
                        >
                          {loadingAi ? 'Generating...' : 'Generate'}
                        </Button>
                      </div>
                      {aiSuggestions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {aiSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => setNewMessage(suggestion)}
                              className="bg-white p-2 rounded border text-sm cursor-pointer hover:bg-gray-50"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Message History */}
                    <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3 bg-gray-50">
                      {messages.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No messages yet</p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.direction === 'out'
                                  ? 'bg-primary text-white'
                                  : 'bg-white border'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.direction === 'out' ? 'text-white/70' : 'text-gray-400'}`}>
                                {format(msg.timestamp.toDate(), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />
                      <Button onClick={handleSendMessage} className="self-end">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="mt-0">
                  <div className="space-y-3">
                    {leadTasks.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No tasks for this lead</p>
                    ) : (
                      leadTasks.map((task) => {
                        const dueDate = task.due_date.toDate();
                        const isOverdue = dueDate < new Date() && !isToday(dueDate) && task.status === 'pending';
                        
                        return (
                          <div
                            key={task.id}
                            className={`p-4 border rounded-lg ${task.status === 'done' ? 'bg-gray-50 opacity-60' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
                                  {task.title}
                                </h4>
                                <p className="text-sm text-gray-500">{task.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{TASK_TYPE_LABELS[task.type]}</Badge>
                                  <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                                    <Clock className="w-3 h-3 mr-1" />
                                    {isToday(dueDate) ? 'Today' : isTomorrow(dueDate) ? 'Tomorrow' : format(dueDate, 'MMM d')}
                                  </Badge>
                                </div>
                              </div>
                              {task.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => completeTask(task.id)}
                                >
                                  Mark Done
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="mt-0">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a note..."
                      className="min-h-25"
                    />
                    <Button>Add Note</Button>
                    
                    <div className="border-t pt-4">
                      <p className="text-gray-500 text-center py-4">No notes yet</p>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
