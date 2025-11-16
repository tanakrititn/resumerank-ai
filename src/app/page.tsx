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
  ArrowRight
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold gradient-text">
              ResumeRank AI
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm sm:text-base sm:size-default">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gradient-primary text-sm sm:text-base sm:size-default">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-24 sm:py-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Recruitment</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Hire Smarter with{' '}
              <span className="gradient-text">
                AI-Powered
              </span>{' '}
              Resume Screening
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform your recruitment process with intelligent resume analysis.
              Save time, reduce bias, and find the perfect candidates faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gradient-primary text-lg px-8 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 100 free AI credits
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Why Choose ResumeRank AI?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to streamline your hiring process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast Analysis',
                description: 'Screen hundreds of resumes in seconds with our advanced AI engine',
                color: 'text-yellow-500',
              },
              {
                icon: Shield,
                title: 'Reduce Hiring Bias',
                description: 'Make objective decisions based on skills and qualifications',
                color: 'text-blue-500',
              },
              {
                icon: TrendingUp,
                title: 'Smart Ranking System',
                description: 'Get AI-powered scores to identify top candidates instantly',
                color: 'text-green-500',
              },
              {
                icon: Users,
                title: 'Collaborative Hiring',
                description: 'Share insights and collaborate with your team seamlessly',
                color: 'text-purple-500',
              },
              {
                icon: Clock,
                title: 'Save Time & Money',
                description: 'Reduce time-to-hire by up to 70% with automated screening',
                color: 'text-orange-500',
              },
              {
                icon: CheckCircle2,
                title: 'Better Matches',
                description: 'Find candidates that truly fit your requirements',
                color: 'text-pink-500',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-lg bg-secondary mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: '70%', label: 'Faster Hiring' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '10k+', label: 'Resumes Analyzed' },
            ].map((stat, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/20 gradient-card overflow-hidden">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-6 text-primary" />
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Hiring?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of companies using AI to find better candidates faster
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="gradient-primary text-lg px-8">
                    Get Started Free
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                100 free AI credits • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold gradient-text">
                ResumeRank AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ResumeRank AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
