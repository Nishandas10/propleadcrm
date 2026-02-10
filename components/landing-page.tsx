'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Users,
  BarChart3,
  Zap,
  Bell,
  CheckCircle2,
  ArrowRight,
  Star,
  IndianRupee,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Track all leads in a visual pipeline. Never lose a potential deal again.',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Integration',
    description: 'Send & receive WhatsApp messages directly. Auto-capture incoming leads.',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Auto-send follow-ups, welcome messages & reminders. Save hours daily.',
  },
  {
    icon: Bell,
    title: 'Reminders & Tasks',
    description: 'Never miss a site visit or follow-up call. Get timely notifications.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & Reports',
    description: 'Track conversion rates, hot leads & team performance at a glance.',
  },
  {
    icon: Star,
    title: 'Lead Scoring',
    description: 'Automatically rank leads as Hot, Warm, or Cold. Focus on what matters.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 999,
    features: [
      'Up to 100 leads',
      'WhatsApp integration',
      'Basic automations',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    price: 2499,
    features: [
      'Up to 500 leads',
      'WhatsApp integration',
      'Advanced automations',
      'AI reply suggestions',
      'Team (up to 5 agents)',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Agency',
    price: 4999,
    features: [
      'Unlimited leads',
      'WhatsApp integration',
      'Advanced automations',
      'AI reply suggestions',
      'Unlimited team members',
      'Dedicated support',
      'Custom integrations',
    ],
    popular: false,
  },
];

export function LandingPage() {
  const { enterGuestMode } = useAuth();
  const router = useRouter();

  const handleGuestLogin = () => {
    enterGuestMode();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PL</span>
              </div>
              <span className="font-semibold text-lg">PropLead</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Button size="sm" onClick={handleGuestLogin}>
                Try Demo
              </Button>
            </div>
            
            <div className="md:hidden flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built for Indian Real Estate Agents
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Never Miss a Follow-up,{' '}
            <span className="text-primary">Close More Deals</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The all-in-one CRM with WhatsApp automation for real estate agents. 
            Capture leads, automate follow-ups, and track your pipeline — all from one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGuestLogin}
              className="w-full sm:w-auto"
            >
              Try Demo (No Signup)
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            7-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Close More Deals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop juggling multiple tools. PropLead brings your leads, messages, and tasks together.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Connect WhatsApp',
                description: 'Create your account and connect your WhatsApp Business number in minutes.',
              },
              {
                step: '2',
                title: 'Import Your Leads',
                description: 'Add leads manually, import from CSV, or auto-capture from WhatsApp messages.',
              },
              {
                step: '3',
                title: 'Set Up Automations',
                description: 'Configure auto-replies and follow-up sequences. Let PropLead work for you.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business. All plans include a 7-day free trial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-xl border-2 p-8 relative ${
                  plan.popular ? 'border-primary shadow-lg' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <IndianRupee className="w-5 h-5 text-gray-900" />
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/signup">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Close More Deals?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Join hundreds of real estate agents who never miss a follow-up.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleGuestLogin}
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              Try Demo First
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">PL</span>
              </div>
              <span className="font-semibold text-white">PropLead</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
            
            <p className="text-sm">
              © 2026 PropLead. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
