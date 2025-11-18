'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Brain,
  Target,
  Rocket,
  BarChart3,
  Lock,
  ChevronDown,
  Mail,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/20">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="relative">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-glow" />
              <div className="absolute inset-0 blur-lg bg-primary/30 animate-pulse"></div>
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold gradient-text-vibrant whitespace-nowrap">
              ResumeRank AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gradient-primary text-white text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 whitespace-nowrap hover-glow">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced with floating elements */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-32 sm:py-40 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-card mb-8 animate-slide-up">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              <span className="text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI-Powered Recruitment Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 sm:mb-8 leading-[1.1] animate-slide-up">
              <span className="block mb-2">Hire Smarter,</span>
              <span className="gradient-text-vibrant block">Move Faster</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Transform your recruitment with AI that screens resumes in seconds,
              ranks candidates intelligently, and eliminates hiring bias.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-primary text-white w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 group hover-glow shadow-2xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="glass-card w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 border-2 hover:scale-105 transition-transform">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>100 free AI credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 sm:py-20 bg-white border-y">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '70%', label: 'Faster Hiring', icon: Zap },
              { value: '95%', label: 'Accuracy Rate', icon: Target },
              { value: '10k+', label: 'Resumes Analyzed', icon: BarChart3 },
              { value: '500+', label: 'Happy Clients', icon: Users },
            ].map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text-vibrant mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with 3D cards */}
      <section className="py-20 sm:py-28 md:py-32 gradient-blur">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Rocket className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-semibold text-primary">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-vibrant">
              Everything You Need to Hire Better
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with intuitive design
              to revolutionize your recruitment process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Advanced machine learning algorithms analyze resumes with human-like understanding',
                color: 'from-purple-500 to-pink-500',
                delay: 0,
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Screen hundreds of resumes in seconds, not hours. Get instant results',
                color: 'from-yellow-500 to-orange-500',
                delay: 0.1,
              },
              {
                icon: Shield,
                title: 'Eliminate Bias',
                description: 'Make objective decisions based purely on skills and qualifications',
                color: 'from-blue-500 to-cyan-500',
                delay: 0.2,
              },
              {
                icon: TrendingUp,
                title: 'Smart Ranking',
                description: 'Automatically rank candidates by fit score with detailed insights',
                color: 'from-green-500 to-emerald-500',
                delay: 0.3,
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Share candidates, add notes, and make hiring decisions together',
                color: 'from-indigo-500 to-purple-500',
                delay: 0.4,
              },
              {
                icon: Lock,
                title: 'Secure & Private',
                description: 'Enterprise-grade security with GDPR compliance built-in',
                color: 'from-red-500 to-pink-500',
                delay: 0.5,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="card-3d hover-glow border-2 border-transparent hover:border-primary/30 bg-white overflow-hidden group"
                style={{ animationDelay: `${feature.delay}s` }}
              >
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:gradient-text-vibrant transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section id="demo" className="py-20 sm:py-28 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text-vibrant">
                See It In Action
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Watch how ResumeRank AI transforms the hiring process in real-time
              </p>
            </div>

            {/* Demo mockup */}
            <div className="relative">
              <div className="glass-card rounded-3xl p-3 shadow-2xl">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6 animate-glow">
                      <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-white text-xl font-semibold mb-4">Interactive Demo</p>
                    <Button className="gradient-primary text-white">
                      Launch Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 md:py-32 gradient-mesh">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Star className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-semibold text-primary">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text-vibrant">
              Loved by HR Teams Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about transforming their hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'HR Director',
                company: 'TechCorp',
                content: 'ResumeRank AI cut our time-to-hire by 60%. The AI analysis is incredibly accurate and has helped us find candidates we would have missed.',
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Talent Acquisition Lead',
                company: 'StartupXYZ',
                content: 'Game-changer for our startup. We processed 500+ applications for our last role in under an hour. The ROI is massive.',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Recruiting Manager',
                company: 'Enterprise Inc',
                content: 'The bias reduction alone makes this worth it. We\'re making more diverse hires and our team is stronger because of it.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="glass-card border-2 hover:border-primary/30 hover-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-base text-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 sm:py-28 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text-vibrant">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for trying out ResumeRank AI',
                features: ['100 AI credits', 'Up to 5 jobs', 'Basic analytics', 'Email support'],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'Professional',
                price: '$99',
                period: '/month',
                description: 'For growing teams and recruiters',
                features: ['Unlimited AI credits', 'Unlimited jobs', 'Advanced analytics', 'Priority support', 'Team collaboration', 'Custom workflows'],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: ['Everything in Pro', 'Custom AI training', 'Dedicated support', 'SLA guarantee', 'API access', 'Advanced security'],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 hover-glow ${
                  plan.popular ? 'border-primary shadow-2xl scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-white text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold gradient-text-vibrant">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular ? 'gradient-primary text-white' : 'border-2'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-28 md:py-32 gradient-blur">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 gradient-text-vibrant">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Everything you need to know about ResumeRank AI
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'How does the AI resume screening work?',
                  answer: 'Our AI uses advanced natural language processing to analyze resumes, extracting key information about skills, experience, and qualifications. It then compares this data against your job requirements to generate accurate match scores.',
                },
                {
                  question: 'Is my data secure?',
                  answer: 'Yes! We use enterprise-grade encryption and are fully GDPR compliant. Your data is stored securely and never shared with third parties. We also offer on-premise deployment for enterprises.',
                },
                {
                  question: 'Can I try it for free?',
                  answer: 'Absolutely! We offer 100 free AI credits to get you started. No credit card required. You can upgrade to a paid plan anytime as your needs grow.',
                },
                {
                  question: 'How accurate is the AI analysis?',
                  answer: 'Our AI has a 95% accuracy rate, continuously improving through machine learning. It\'s been trained on millions of resumes and job descriptions to provide highly reliable results.',
                },
                {
                  question: 'Do you offer support for implementation?',
                  answer: 'Yes! All plans include email support. Professional and Enterprise plans get priority support and dedicated account management to help you get the most out of the platform.',
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="glass-card border-2 hover:border-primary/30 cursor-pointer transition-all"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    {openFaq === index && (
                      <p className="mt-4 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 sm:py-28 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <Card className="border-0 gradient-primary overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
            <CardContent className="p-12 sm:p-16 md:p-20 text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-8">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join hundreds of companies using AI to find better candidates faster.
                Start your free trial today - no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto text-lg px-10 h-14 shadow-xl hover:scale-105 transition-transform">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto text-lg px-10 h-14">
                    Sign In
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/80 mt-6">
                100 free AI credits • No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ResumeRank AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                AI-powered resume screening and candidate ranking platform that helps you hire smarter and faster.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-white/10 pt-12 mb-12">
            <div className="max-w-xl mx-auto text-center">
              <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-400 mb-6">
                Get the latest updates on AI recruitment and product features
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="gradient-primary text-white px-6">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 ResumeRank AI. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built with by FenexTech
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
