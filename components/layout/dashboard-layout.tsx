'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useLeadStore, useTaskStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDbInstance } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Phone,
  Calendar,
  Zap,
  Settings,
  LogOut,
  Menu,
  Bell,
  Link2,
  Building2,
  Clock,
  CheckCircle2,
  Gift,
  ArrowRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Listings', href: '/listings', icon: Building2 },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Telecalling', href: '/telecalling', icon: Phone },
  { name: 'Tasks', href: '/tasks', icon: Calendar },
  { name: 'Automations', href: '/automations', icon: Zap },
  { name: 'Integrations', href: '/integrations', icon: Link2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isGuest, exitGuestMode } = useAuth();
  const { initGuestData: initLeads } = useLeadStore();
  const { initGuestData: initTasks, dueTodayTasks } = useTaskStore();

  // Waitlist modal state
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Initialize guest data when in guest mode
  useEffect(() => {
    if (isGuest) {
      initLeads();
      initTasks();
    }
  }, [isGuest, initLeads, initTasks]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const db = getDbInstance();
      await addDoc(collection(db, 'trial_signups'), {
        name: waitlistForm.name,
        email: waitlistForm.email,
        phone: waitlistForm.phone,
        created_at: serverTimestamp(),
        status: 'waitlist',
        source: 'dashboard_sidebar',
      });
      
      toast.success('🎉 You\'re on the waitlist! We\'ll notify you when we launch.');
      setShowWaitlistModal(false);
      setWaitlistForm({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error submitting waitlist form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (isGuest) {
      exitGuestMode();
    } else {
      await signOut();
    }
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const dueTasks = dueTodayTasks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 h-16 flex items-center justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Main navigation menu for PropLead CRM</SheetDescription>
            <div className="p-4 border-b">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PL</span>
                </div>
                <span className="font-semibold text-lg">PropLead</span>
              </Link>
            </div>
            <nav className="p-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/dashboard" className="font-semibold text-lg">
          PropLead
        </Link>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {dueTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dueTasks.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-muted-foreground">Tasks due today</p>
              </div>
              <ScrollArea className="h-75">
                {dueTasks.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No tasks due today</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dueTasks.slice(0, 10).map((task) => (
                      <Link
                        key={task.id}
                        href="/tasks"
                        className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Clock className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.description || 'No description'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {dueTasks.length > 0 && (
                <div className="p-2 border-t">
                  <Link href="/tasks">
                    <Button variant="ghost" className="w-full text-sm">
                      View all tasks
                    </Button>
                  </Link>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PL</span>
            </div>
            <span className="font-semibold text-lg">PropLead</span>
          </Link>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Join Waitlist CTA */}
        <div className="px-3 pb-2">
          <Button 
            onClick={() => setShowWaitlistModal(true)}
            className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
          >
            <Gift className="mr-2 h-4 w-4" />
            Join Waitlist - 70% OFF
          </Button>
        </div>

        {/* User Section */}
        <div className="p-4 border-t">
          {isGuest && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-medium">Guest Mode</p>
              <p className="text-xs text-yellow-600">Data will not be saved</p>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Waitlist Modal */}
      <Dialog open={showWaitlistModal} onOpenChange={setShowWaitlistModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">🎁 Join the Waitlist</DialogTitle>
            <DialogDescription>
              Lock in 70% OFF forever as an early bird! Limited spots available.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWaitlistSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">Full Name</Label>
              <Input
                id="waitlist-name"
                placeholder="Enter your name"
                value={waitlistForm.name}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waitlist-email">Email Address</Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="Enter your email"
                value={waitlistForm.email}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waitlist-phone">Phone Number</Label>
              <Input
                id="waitlist-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={waitlistForm.phone}
                onChange={(e) => setWaitlistForm({ ...waitlistForm, phone: e.target.value })}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
              size="lg" 
              disabled={submitting}
            >
              {submitting ? 'Joining...' : '🚀 Claim My Spot & 70% OFF'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              We&apos;ll notify you when we launch. Unsubscribe anytime.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
