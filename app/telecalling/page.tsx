'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { DUMMY_LEADS, DUMMY_TASKS } from '@/lib/dummy-data';
import { Lead, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneOutgoing,
  PhoneMissed,
  Search,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  Timer,
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { toast } from 'sonner';

// Call log type
interface CallLog {
  id: string;
  lead_id: string;
  lead_name: string;
  lead_phone: string;
  type: 'outgoing' | 'incoming' | 'missed';
  status: 'completed' | 'no_answer' | 'busy' | 'failed';
  duration: number; // in seconds
  notes: string;
  outcome?: 'interested' | 'not_interested' | 'callback' | 'wrong_number';
  created_at: Date;
}

// Call queue item
interface CallQueueItem {
  lead: Lead;
  task?: Task;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export default function TelecallingPage() {
  const { isGuest } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'scheduled'>('queue');
  
  // Call state
  const [currentCall, setCurrentCall] = useState<Lead | null>(null);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState<string>('');
  const [showCallDialog, setShowCallDialog] = useState(false);
  
  // Dialer state
  const [dialerNumber, setDialerNumber] = useState('');
  const [isAutoDialing, setIsAutoDialing] = useState(false);

  // Current timestamp for calculations (updated on mount)
  const [currentTime] = useState(() => Date.now());

  // Generate dummy call logs
  const dummyCallLogs = useMemo<CallLog[]>(() => {
    if (!isGuest) return [];
    
    return [
      {
        id: 'call-1',
        lead_id: 'lead-1',
        lead_name: 'Rahul Sharma',
        lead_phone: '+919876543001',
        type: 'outgoing',
        status: 'completed',
        duration: 320,
        notes: 'Discussed 3BHK options in Whitefield. Very interested.',
        outcome: 'interested',
        created_at: new Date(currentTime - 2 * 60 * 60 * 1000),
      },
      {
        id: 'call-2',
        lead_id: 'lead-2',
        lead_name: 'Priya Menon',
        lead_phone: '+919876543002',
        type: 'outgoing',
        status: 'no_answer',
        duration: 0,
        notes: '',
        created_at: new Date(currentTime - 4 * 60 * 60 * 1000),
      },
      {
        id: 'call-3',
        lead_id: 'lead-3',
        lead_name: 'Amit Patel',
        lead_phone: '+919876543003',
        type: 'incoming',
        status: 'completed',
        duration: 180,
        notes: 'Called back after missed call. Wants to visit this weekend.',
        outcome: 'callback',
        created_at: new Date(currentTime - 6 * 60 * 60 * 1000),
      },
    ];
  }, [isGuest, currentTime]);

  // Use data from stores/dummy based on auth state
  const leads = useMemo(() => isGuest ? DUMMY_LEADS : [], [isGuest]);
  const tasks = useMemo(() => isGuest ? DUMMY_TASKS : [], [isGuest]);
  
  // Call logs with new logs added via state
  const [additionalCallLogs, setAdditionalCallLogs] = useState<CallLog[]>([]);
  const callLogs = useMemo(() => [...dummyCallLogs, ...additionalCallLogs], [dummyCallLogs, additionalCallLogs]);
  
  // Function to add new call log
  const addCallLog = (log: CallLog) => {
    setAdditionalCallLogs(prev => [log, ...prev]);
  };

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayLogs = callLogs.filter(log => isToday(log.created_at));
    const connected = todayLogs.filter(log => log.status === 'completed').length;
    const totalDuration = todayLogs.reduce((sum, log) => sum + log.duration, 0);
    
    return {
      totalCalls: todayLogs.length,
      connected,
      missed: todayLogs.filter(log => log.status === 'no_answer').length,
      avgDuration: connected > 0 ? Math.round(totalDuration / connected) : 0,
    };
  }, [callLogs]);

  // Build call queue
  const callQueue = useMemo<CallQueueItem[]>(() => {
    const queue: CallQueueItem[] = [];
    
    // Add leads with tasks due today
    const todayTasks = tasks.filter(t => 
      t.status === 'pending' && 
      (t.type === 'call' || t.type === 'followup') &&
      isToday(t.due_date.toDate())
    );
    
    todayTasks.forEach(task => {
      const lead = leads.find(l => l.id === task.lead_id);
      if (lead) {
        queue.push({
          lead,
          task,
          priority: 'high',
          reason: `${task.type === 'call' ? 'Call' : 'Follow-up'} scheduled for today`,
        });
      }
    });
    
    // Add hot leads without recent contact
    const hotLeads = leads.filter(l => 
      l.lead_priority === 'HOT' &&
      !queue.some(q => q.lead.id === l.id)
    );
    
    hotLeads.forEach(lead => {
      const lastContact = lead.last_interaction_at?.toDate();
      const hoursSince = lastContact ? 
        (currentTime - lastContact.getTime()) / (1000 * 60 * 60) : 999;
      
      if (hoursSince > 24) {
        queue.push({
          lead,
          priority: 'high',
          reason: 'Hot lead - no contact in 24+ hours',
        });
      }
    });
    
    // Add new leads
    const newLeads = leads.filter(l => 
      l.status === 'new' &&
      !queue.some(q => q.lead.id === l.id)
    );
    
    newLeads.forEach(lead => {
      queue.push({
        lead,
        priority: 'medium',
        reason: 'New lead - needs first contact',
      });
    });
    
    // Sort by priority
    return queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [leads, tasks, currentTime]);

  // Scheduled calls (tasks with type 'call')
  const scheduledCalls = useMemo(() => {
    return tasks
      .filter(t => t.status === 'pending' && t.type === 'call')
      .map(task => {
        const lead = leads.find(l => l.id === task.lead_id);
        return { task, lead };
      })
      .filter(item => item.lead)
      .sort((a, b) => a.task.due_date.toDate().getTime() - b.task.due_date.toDate().getTime());
  }, [tasks, leads]);

  // Filter call queue by search
  const filteredQueue = useMemo(() => {
    if (!searchQuery) return callQueue;
    const query = searchQuery.toLowerCase();
    return callQueue.filter(item =>
      item.lead.name.toLowerCase().includes(query) ||
      item.lead.phone.includes(query)
    );
  }, [callQueue, searchQuery]);

  // Start a call
  const startCall = (lead: Lead) => {
    setCurrentCall(lead);
    setShowCallDialog(true);
    setCallInProgress(true);
    setCallDuration(0);
    setCallNotes('');
    setCallOutcome('');
    
    // Open phone dialer
    window.open(`tel:${lead.phone}`, '_self');
    
    // Start timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    (window as Window & { callInterval?: NodeJS.Timeout }).callInterval = interval;
  };

  // End call
  const endCall = (status: 'completed' | 'no_answer' | 'busy' | 'failed') => {
    const interval = (window as Window & { callInterval?: NodeJS.Timeout }).callInterval;
    if (interval) clearInterval(interval);
    
    setCallInProgress(false);
    
    if (currentCall && status === 'completed') {
      // Keep dialog open for notes
    } else {
      // Log and close
      if (currentCall) {
        logCall(status);
      }
      setShowCallDialog(false);
    }
  };

  // Log call
  const logCall = (status: 'completed' | 'no_answer' | 'busy' | 'failed') => {
    if (!currentCall) return;
    
    const newLog: CallLog = {
      id: `call-${Date.now()}`,
      lead_id: currentCall.id,
      lead_name: currentCall.name,
      lead_phone: currentCall.phone,
      type: 'outgoing',
      status,
      duration: callDuration,
      notes: callNotes,
      outcome: callOutcome as CallLog['outcome'],
      created_at: new Date(),
    };
    
    addCallLog(newLog);
    toast.success('Call logged successfully!');
    
    // Reset
    setCurrentCall(null);
    setShowCallDialog(false);
    setCallDuration(0);
    setCallNotes('');
    setCallOutcome('');
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get call status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no_answer': return <PhoneMissed className="h-4 w-4 text-yellow-500" />;
      case 'busy': return <PhoneOff className="h-4 w-4 text-orange-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Auto-dial next
  const autoDialNext = () => {
    if (filteredQueue.length > 0) {
      startCall(filteredQueue[0].lead);
    } else {
      toast.info('No more leads in queue');
      setIsAutoDialing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Telecalling</h1>
            <p className="text-muted-foreground">Manage calls and follow-ups with leads</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Today&apos;s Calls</p>
                  <p className="text-lg font-bold">{todayStats.totalCalls}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Connected</p>
                  <p className="text-lg font-bold">{todayStats.connected}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                  <p className="text-lg font-bold">{formatDuration(todayStats.avgDuration)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Dialer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Dial</CardTitle>
            <CardDescription>Enter a phone number to call directly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter phone number..."
                value={dialerNumber}
                onChange={(e) => setDialerNumber(e.target.value)}
                className="max-w-xs"
              />
              <Button 
                onClick={() => {
                  if (dialerNumber) {
                    window.open(`tel:${dialerNumber}`, '_self');
                    toast.info('Opening phone dialer...');
                  }
                }}
                disabled={!dialerNumber}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (dialerNumber) {
                    window.open(`sms:${dialerNumber}`, '_self');
                    toast.info('Opening SMS app...');
                  }
                }}
                disabled={!dialerNumber}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="queue" className="gap-2">
                <PhoneOutgoing className="h-4 w-4" />
                Call Queue ({filteredQueue.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled ({scheduledCalls.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button 
                variant={isAutoDialing ? 'destructive' : 'default'}
                onClick={() => {
                  if (isAutoDialing) {
                    setIsAutoDialing(false);
                  } else {
                    setIsAutoDialing(true);
                    autoDialNext();
                  }
                }}
                className="gap-2"
              >
                {isAutoDialing ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Auto-Dial
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Auto-Dial
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Call Queue */}
          <TabsContent value="queue" className="mt-0">
            <Card>
              <CardContent className="p-0">
                {filteredQueue.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Phone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No calls in queue</p>
                    <p className="text-sm">Add follow-up tasks or import new leads</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Last Contact</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQueue.map((item, index) => (
                        <TableRow key={item.lead.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {item.lead.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{item.lead.name}</p>
                                <p className="text-sm text-muted-foreground">{item.lead.phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.reason}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {item.lead.last_interaction_at
                                ? formatDistanceToNow(item.lead.last_interaction_at.toDate(), { addSuffix: true })
                                : 'Never'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => startCall(item.lead)}
                              >
                                <Phone className="mr-1 h-3 w-3" />
                                Call
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  window.open(`sms:${item.lead.phone}`, '_self');
                                }}
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                              {index === 0 && filteredQueue.length > 1 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const newQueue = [...filteredQueue];
                                    newQueue.push(newQueue.shift()!);
                                    // In real app, this would update the queue order
                                    toast.info('Skipped to next lead');
                                  }}
                                >
                                  <SkipForward className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Calls */}
          <TabsContent value="scheduled" className="mt-0">
            <Card>
              <CardContent className="p-0">
                {scheduledCalls.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No scheduled calls</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Scheduled For</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledCalls.map(({ task, lead }) => {
                        const dueDate = task.due_date.toDate();
                        const isOverdue = isPast(dueDate) && !isToday(dueDate);
                        
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback>
                                    {lead!.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{lead!.name}</p>
                                  <p className="text-sm text-muted-foreground">{lead!.phone}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {isOverdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                                <span className={isOverdue ? 'text-red-600' : ''}>
                                  {isToday(dueDate) ? 'Today' : 
                                   isTomorrow(dueDate) ? 'Tomorrow' : 
                                   format(dueDate, 'MMM dd, yyyy')}
                                </span>
                                <span className="text-muted-foreground">
                                  at {format(dueDate, 'h:mm a')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{task.description || task.title}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => startCall(lead!)}
                              >
                                <Phone className="mr-1 h-3 w-3" />
                                Call Now
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Call History */}
          <TabsContent value="history" className="mt-0">
            <Card>
              <CardContent className="p-0">
                {callLogs.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No call history yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {log.lead_name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{log.lead_name}</p>
                                <p className="text-sm text-muted-foreground">{log.lead_phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {log.type === 'outgoing' ? (
                                <PhoneOutgoing className="mr-1 h-3 w-3" />
                              ) : log.type === 'incoming' ? (
                                <PhoneCall className="mr-1 h-3 w-3" />
                              ) : (
                                <PhoneMissed className="mr-1 h-3 w-3" />
                              )}
                              {log.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize text-sm">{log.status.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {log.duration > 0 ? formatDuration(log.duration) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-50">
                              {log.notes || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(log.created_at, { addSuffix: true })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call Dialog */}
        <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {callInProgress ? 'Call in Progress' : 'Log Call'}
              </DialogTitle>
              <DialogDescription>
                {callInProgress 
                  ? `Connected to ${currentCall?.name}`
                  : `Add notes for call with ${currentCall?.name}`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Caller Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">
                    {currentCall?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentCall?.name}</h3>
                  <p className="text-muted-foreground">{currentCall?.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
                  </div>
                </div>
              </div>

              {/* Call Controls */}
              {callInProgress && (
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => endCall('no_answer')}
                    className="gap-2"
                  >
                    <PhoneMissed className="h-4 w-4" />
                    No Answer
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full h-14 w-14 p-0"
                    onClick={() => endCall('completed')}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => endCall('busy')}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Busy
                  </Button>
                </div>
              )}

              {/* Call Notes Form (after call) */}
              {!callInProgress && (
                <div className="space-y-4">
                  <div>
                    <Label>Call Outcome</Label>
                    <Select value={callOutcome} onValueChange={setCallOutcome}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select outcome..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interested">Interested - Schedule Visit</SelectItem>
                        <SelectItem value="callback">Callback Later</SelectItem>
                        <SelectItem value="not_interested">Not Interested</SelectItem>
                        <SelectItem value="wrong_number">Wrong Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Call Notes</Label>
                    <Textarea
                      placeholder="Add notes about this call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {!callInProgress && (
                <>
                  <Button variant="outline" onClick={() => setShowCallDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => logCall('completed')}>
                    Save & Close
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
