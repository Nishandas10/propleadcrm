'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getDbInstance } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  MessageSquare,
  Users,
  BarChart3,
  Zap,
  Bell,
  CheckCircle2,
  ArrowRight,
  Star,
  Building2,
  Phone,
  Target,
  Clock,
  Smartphone,
  Globe,
  Play,
  ChevronRight,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Track all leads in a visual Kanban pipeline. Import from CSV, capture from WhatsApp, or add manually.',
    color: 'bg-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integration',
    description: 'Send & receive WhatsApp messages directly. Auto-capture incoming leads and log all conversations.',
    color: 'bg-green-500',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Set up auto-replies, welcome messages, and timed follow-up sequences. Save hours daily.',
    color: 'bg-yellow-500',
  },
  {
    icon: Bell,
    title: 'Tasks & Reminders',
    description: 'Never miss a site visit or follow-up. Get push notifications and in-app alerts.',
    color: 'bg-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track conversion rates, revenue, agent performance, and source ROI at a glance.',
    color: 'bg-pink-500',
  },
  {
    icon: Target,
    title: 'Lead Scoring',
    description: 'Automatically rank leads as Hot, Warm, or Cold based on engagement and behavior.',
    color: 'bg-orange-500',
  },
  {
    icon: Building2,
    title: 'Listing Management',
    description: 'Manage properties and sync across MagicBricks, 99acres, Housing.com and more.',
    color: 'bg-cyan-500',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Get AI-powered reply suggestions and next-action recommendations for each lead.',
    color: 'bg-indigo-500',
  },
  {
    icon: Phone,
    title: 'Telecalling Suite',
    description: 'Built-in click-to-call, call logging, and telecaller performance tracking.',
    color: 'bg-red-500',
  },
];

const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Senior Broker, Mumbai',
    content: 'PropLead helped me close 40% more deals in just 3 months. The WhatsApp automation is a game-changer!',
    avatar: 'RS',
  },
  {
    name: 'Priya Patel',
    role: 'Real Estate Agent, Bangalore',
    content: 'Finally, a CRM that understands Indian real estate. The lead scoring saves me hours of manual sorting.',
    avatar: 'PP',
  },
  {
    name: 'Amit Verma',
    role: 'Agency Owner, Delhi NCR',
    content: 'My team of 12 agents uses PropLead daily. The dashboard gives me complete visibility into their performance.',
    avatar: 'AV',
  },
];

const stats = [
  { value: '10,000+', label: 'Leads Managed' },
  { value: '500+', label: 'Active Agents' },
  { value: '₹50Cr+', label: 'Deals Closed' },
  { value: '98%', label: 'Customer Satisfaction' },
];

const integrations = [
  { name: 'MagicBricks', icon: '🧱' },
  { name: '99acres', icon: '🏘️' },
  { name: 'Housing.com', icon: '🏢' },
  { name: 'Facebook Ads', icon: '📘' },
  { name: 'Google Ads', icon: '🔍' },
  { name: 'WhatsApp', icon: '💬' },
];

export function LandingPage() {
  const { enterGuestMode } = useAuth();
  const router = useRouter();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialForm, setTrialForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleGuestLogin = () => {
    enterGuestMode();
    router.push('/dashboard');
  };

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.name || !trialForm.email || !trialForm.phone) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      const db = getDbInstance();
      await addDoc(collection(db, 'trial_signups'), {
        name: trialForm.name,
        email: trialForm.email,
        phone: trialForm.phone,
        created_at: serverTimestamp(),
        status: 'pending',
      });
      toast.success('Thank you! We\'ll contact you shortly.');
      setShowTrialModal(false);
      setTrialForm({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error saving trial signup:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="font-bold text-xl">PropLead</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Testimonials</a>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Button size="sm" onClick={() => setShowTrialModal(true)} className="shadow-md">
                Start Free Trial
              </Button>
            </div>
            
            <div className="md:hidden flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Button size="sm" onClick={() => setShowTrialModal(true)}>
                Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Built for Indian Real Estate Agents
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Never Miss a Follow-up,{' '}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Close More Deals</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The all-in-one CRM with WhatsApp automation for real estate agents. 
            Capture leads, automate follow-ups, and track your pipeline — all from one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow text-base px-8" onClick={() => setShowTrialModal(true)}>
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGuestLogin}
              className="w-full sm:w-auto text-base px-8 group"
            >
              <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              7-day free trial
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Cancel anytime
            </span>
          </p>
        </div>

        {/* Stats Bar */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-xl border p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Layers className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Close More Deals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop juggling multiple tools. PropLead brings your leads, messages, listings, and analytics together in one powerful platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Integrates with Your Favorite Platforms
            </h2>
            <p className="text-gray-600">
              Auto-import leads from property portals and ad platforms
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className="font-medium text-gray-700">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              Quick Setup
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Under 5 Minutes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Connect WhatsApp',
                description: 'Create your account and connect your WhatsApp Business number. Our wizard makes it simple.',
                icon: Smartphone,
              },
              {
                step: '2',
                title: 'Import Your Leads',
                description: 'Add leads manually, import from CSV, or auto-capture from WhatsApp and property portals.',
                icon: Users,
              },
              {
                step: '3',
                title: 'Set Up Automations',
                description: 'Configure auto-replies, follow-up sequences, and reminders. Let PropLead work 24/7 for you.',
                icon: Zap,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-2xl border p-8 text-center hover:shadow-lg transition-shadow h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Real Estate Professionals
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary via-primary to-blue-600 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Close More Deals?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of real estate agents who never miss a follow-up. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg" onClick={() => setShowTrialModal(true)}>
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleGuestLogin}
                  className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10"
                >
                  Try Demo First
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">PL</span>
                </div>
                <span className="font-bold text-xl text-white">PropLead</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                The all-in-one CRM with WhatsApp automation for Indian real estate professionals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 PropLead. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Free Trial Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Start Your Free Trial</DialogTitle>
            <DialogDescription>
              Get 7 days of full access. No credit card required.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTrialSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={trialForm.name}
                onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={trialForm.email}
                onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={trialForm.phone}
                onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Start Free Trial'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}