'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore, useTaskStore } from '@/lib/stores';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, User, AlertTriangle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { TASK_TYPE_LABELS } from '@/lib/config';
import type { Task } from '@/lib/types';

function TaskItem({ 
  task, 
  leadName, 
  onComplete 
}: { 
  task: Task; 
  leadName?: string;
  onComplete: (id: string) => void;
}) {
  const dueDate = task.due_date.toDate();
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status === 'pending';
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);

  const getDueLabel = () => {
    if (isDueToday) return 'Today';
    if (isDueTomorrow) return 'Tomorrow';
    return format(dueDate, 'MMM d');
  };

  return (
    <div className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
      task.status === 'done' ? 'bg-gray-50 opacity-60' : ''
    }`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={() => task.status === 'pending' && onComplete(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h4>
            {isOverdue && task.status === 'pending' && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          {task.description && (
            <p className="text-sm text-gray-500 mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{TASK_TYPE_LABELS[task.type]}</Badge>
            <Badge variant={isOverdue ? 'destructive' : isDueToday ? 'default' : 'secondary'}>
              <Clock className="w-3 h-3 mr-1" />
              {getDueLabel()}
            </Badge>
            {leadName && (
              <Link href={`/leads/${task.lead_id}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  <User className="w-3 h-3 mr-1" />
                  {leadName}
                </Badge>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { isGuest, loading } = useAuth();
  const { leads, initGuestData: initLeads } = useLeadStore();
  const { 
    tasks, 
    completeTask, 
    dueTodayTasks, 
    dueTomorrowTasks, 
    overdueTasks,
    pendingTasks,
    initGuestData: initTasks 
  } = useTaskStore();

  useEffect(() => {
    if (isGuest && tasks.length === 0) {
      initLeads();
      initTasks();
    }
  }, [isGuest, tasks.length, initLeads, initTasks]);

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.name;
  };

  const overdue = overdueTasks();
  const today = dueTodayTasks();
  const tomorrow = dueTomorrowTasks();
  const allPending = pendingTasks();
  const completed = tasks.filter(t => t.status === 'done');

  // Get upcoming tasks (not overdue, not today, not tomorrow)
  const upcoming = allPending.filter(t => {
    const dueDate = t.due_date.toDate();
    return !isPast(dueDate) && !isToday(dueDate) && !isTomorrow(dueDate);
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-500">{allPending.length} pending tasks</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={overdue.length > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Due Today</p>
                  <p className="text-2xl font-bold">{today.length}</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tomorrow</p>
                  <p className="text-2xl font-bold">{tomorrow.length}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completed.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Lists */}
        <div className="space-y-6">
          {/* Overdue */}
          {overdue.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Overdue ({overdue.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdue.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    leadName={getLeadName(task.lead_id)}
                    onComplete={completeTask}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Due Today ({today.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {today.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks due today</p>
              ) : (
                today.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    leadName={getLeadName(task.lead_id)}
                    onComplete={completeTask}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Tomorrow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Due Tomorrow ({tomorrow.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tomorrow.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks due tomorrow</p>
              ) : (
                tomorrow.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    leadName={getLeadName(task.lead_id)}
                    onComplete={completeTask}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming ({upcoming.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    leadName={getLeadName(task.lead_id)}
                    onComplete={completeTask}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-500">Completed ({completed.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {completed.slice(0, 5).map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    leadName={getLeadName(task.lead_id)}
                    onComplete={completeTask}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
