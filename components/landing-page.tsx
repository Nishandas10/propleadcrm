'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  Users,
  BarChart3,
  Zap,
  Bell,
  CheckCircle2,
  ArrowRight,
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
  Gift,
  Rocket,
  BadgePercent,
  PartyPopper,
  Flame,
  TrendingDown,
  XCircle,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Track all leads in a visual Kanban pipeline. Import from CSV, capture from WhatsApp, or add manually.',
    color: 'bg-blue-500',
  },
  {
    icon: null,
    customIcon: '/logos/WhatsApp.png',
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

const integrations = [
  { name: 'MagicBricks', logo: '/logos/Magicbricks.png' },
  { name: '99acres', logo: '/logos/99acres.png' },
  { name: 'Housing.com', logo: '/logos/Housing.png' },
  { name: 'Meta Ads', logo: '/logos/Meta.png' },
  { name: 'Google Ads', logo: '/logos/Google.png' },
  { name: 'WhatsApp', logo: '/logos/WhatsApp.png' },
];

const earlyBirdBenefits = [
  { icon: BadgePercent, text: 'First 100 users get 70% OFF lifetime' },
  { icon: Gift, text: 'Free onboarding & setup assistance' },
  { icon: Rocket, text: 'Priority access to new features' },
  { icon: PartyPopper, text: 'Exclusive founder community access' },
];

export function LandingPage() {
  const { enterGuestMode } = useAuth();
  const router = useRouter();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialForm, setTrialForm] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [waitlistCount] = useState(73); // Simulated current count - replace with real data

  const handleGuestLogin = () => {
    enterGuestMode();
    router.push('/dashboard');
  };

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.name || !trialForm.phone) {
      toast.error('Please fill name and phone number');
      return;
    }

    setSubmitting(true);
    try {
      const db = getDbInstance();
      await addDoc(collection(db, 'waitlist'), {
        name: trialForm.name,
        phone: trialForm.phone,
        created_at: serverTimestamp(),
        source: 'landing_page',
        offer: 'early_bird_70_off',
      });
      toast.success('🎉 Your free trial is starting! We\'ll be in touch shortly.');
      setShowTrialModal(false);
      setTrialForm({ name: '', phone: '' });
    } catch (error) {
      console.error('Error saving waitlist signup:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Urgency Banner */}
      <div className="bg-linear-to-r from-orange-500 via-red-500 to-pink-500 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          🔥 Early Bird Offer: First 100 users get 70% OFF lifetime! Only few spots left
          <Sparkles className="w-4 h-4" />
        </span>
      </div>

      {/* Header */}
      <header className="fixed top-10 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="font-bold text-xl">PropLead</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How It Works</a>
              <Button variant="ghost" size="sm" onClick={handleGuestLogin}>Try Live Demo</Button>
              <Button size="sm" onClick={() => setShowTrialModal(true)} className="shadow-md bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                👉 Start Free Trial
              </Button>
            </div>
            
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleGuestLogin}>Demo</Button>
              <Button size="sm" onClick={() => setShowTrialModal(true)} className="bg-linear-to-r from-orange-500 to-red-500">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-primary/10 to-blue-500/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            AI-powered CRM + WhatsApp Automation
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Close 2X More Property Deals{' '}
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">Without Hiring More Staff.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Capture leads. Follow up automatically.<br className="hidden sm:block" />
            Track every deal in one simple dashboard.
          </p>

          {/* Sync Sources */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="text-sm text-gray-500">Sync leads from:</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { name: 'WhatsApp', logo: '/logos/WhatsApp.png' },
                { name: 'MagicBricks', logo: '/logos/Magicbricks.png' },
                { name: '99acres', logo: '/logos/99acres.png' },
                { name: 'Housing.com', logo: '/logos/Housing.png' },
                { name: 'Meta Ads', logo: '/logos/Meta.png' },
                { name: 'Google Ads', logo: '/logos/Google.png' },
              ].map((source) => (
                <div key={source.name} className="flex items-center gap-1.5 bg-white border rounded-full px-3 py-1.5 shadow-sm">
                  <Image src={source.logo} alt={source.name} width={20} height={20} className="object-contain" />
                  <span className="text-xs font-medium text-gray-700">{source.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Waitlist Form - Inline */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6">
              <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold mb-4">
                <Clock className="w-5 h-5" />
                <span>Limited Time: First 100 users get 70% OFF forever!</span>
              </div>
              
              <form onSubmit={handleTrialSubmit} className="space-y-3">
                <Input
                  placeholder="Your name *"
                  value={trialForm.name}
                  onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                  className="h-12 text-base"
                  required
                />
                <Input
                  placeholder="Phone number *"
                  type="tel"
                  value={trialForm.phone}
                  onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                  className="h-12 text-base"
                  required
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-base bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                  disabled={submitting}
                >
                  {submitting ? 'Starting...' : '👉 Start Free Trial & Get 70% OFF'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 mt-3 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Unsubscribe anytime
                </span>
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGuestLogin}
            className="text-base px-8 group"
          >
            <Play className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" />
            Try Live Demo (No Signup)
          </Button>
        </div>

        {/* Early Bird Benefits */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-linear-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200 p-6">
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              🎉 Early Bird Benefits (First 100 Users)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {earlyBirdBenefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center p-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <benefit.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - The Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <TrendingDown className="w-4 h-4" />
            The Hard Truth
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Most Real Estate Agents Lose 30–50% of Leads
          </h2>
          <p className="text-xl text-gray-400 mb-12">Because:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              'They forget to follow up',
              'Leads get buried in WhatsApp',
              'No system to track hot vs cold prospects',
              'No reminders for callbacks',
              'No clear sales pipeline',
            ].map((problem, index) => (
              <div key={index} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-gray-300">{problem}</span>
              </div>
            ))}
          </div>

          <div className="bg-linear-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
            <p className="text-xl sm:text-2xl font-semibold text-white">
              Every missed follow-up = <span className="text-red-400">lost commission.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 - The Solution */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            The Solution
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Meet Your AI Sales Assistant
          </h2>
          <p className="text-xl text-gray-600 mb-12">Your CRM automatically:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {[
              'Captures leads from website, portals & ads',
              'Sends instant WhatsApp replies',
              'Follows up automatically until they respond',
              'Reminds you to call hot leads',
              'Scores leads (Hot / Warm / Cold)',
              'Tracks your full sales pipeline',
            ].map((solution, index) => (
              <div key={index} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                <span className="text-gray-700 font-medium">{solution}</span>
              </div>
            ))}
          </div>

          <div className="bg-linear-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-6">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900">
              Everything in <span className="text-primary">one place.</span>
            </p>
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
                  {feature.customIcon ? (
                    <Image
                      src={feature.customIcon}
                      alt={feature.title}
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  ) : feature.icon ? (
                    <feature.icon className="w-6 h-6 text-white" />
                  ) : null}
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Seamless Integrations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Integrates with Your Favorite Platforms
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Auto-import leads from property portals and ad platforms. Connect once and watch leads flow in automatically.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="group flex flex-col items-center justify-center bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    width={64}
                    height={64}
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="font-medium text-gray-700 text-sm text-center">{integration.name}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-8">
            And many more coming soon...
          </p>
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
                  <div className="w-16 h-16 bg-linear-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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

      {/* Why Join Now Section */}
      <section id="why-now" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Flame className="w-4 h-4" />
              Limited Time Only
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Start Your Free Trial Now?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Early supporters get exclusive benefits that won&apos;t be available after launch.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">70% OFF Forever</h3>
              <p className="text-gray-600">
                First 100 users lock in 70% discount on all plans. This price never increases for you.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Setup & Training</h3>
              <p className="text-gray-600">
                Get personalized onboarding worth ₹15,000 absolutely free. We&apos;ll help you migrate your data.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Shape the Product</h3>
              <p className="text-gray-600">
                Early users get direct access to our team. Your feedback will shape PropLead&apos;s future.
              </p>
            </div>
          </div>

          {/* Urgency Counter */}
          <div className="mt-12 bg-linear-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div>
                <p className="text-white/80 text-sm mb-1">Early Bird Spots Remaining</p>
                <p className="text-5xl font-bold text-white">{100 - waitlistCount}</p>
              </div>
              <div className="hidden md:block w-px h-16 bg-white/30"></div>
              <div>
                <p className="text-white text-lg font-medium mb-2">Don&apos;t miss out on 70% OFF!</p>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="shadow-lg"
                  onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Claim Your Spot Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist-form" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <PartyPopper className="w-4 h-4" />
                Only {100 - waitlistCount} Early Bird Spots Left!
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Don&apos;t Miss 70% OFF Forever
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Start your free trial now and lock in early bird pricing before we launch. 
                This offer won&apos;t be available after the first 100 users.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg text-orange-600 font-bold" onClick={() => setShowTrialModal(true)}>
                  🎁 Claim My 70% Discount
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
                <li><a href="#why-now" className="hover:text-white transition-colors">Why Join Now</a></li>
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

      {/* Waitlist Modal */}
      <Dialog open={showTrialModal} onOpenChange={setShowTrialModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">👉 Start Your Free Trial</DialogTitle>
            <DialogDescription>
              Lock in 70% OFF forever as an early bird! Only {100 - waitlistCount} spots remaining.
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
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={trialForm.phone}
                onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" size="lg" disabled={submitting}>
              {submitting ? 'Starting...' : '� Start Free Trial & Get 70% OFF'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Start your 7-day free trial. No credit card required.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}