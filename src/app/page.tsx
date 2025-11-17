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
        <div className="container mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg md:text-xl font-bold gradient-text whitespace-nowrap">
              ResumeRank AI
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gradient-primary text-white text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4 whitespace-nowrap">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-primary">AI-Powered Recruitment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight px-2">
              Hire Smarter with{' '}
              <span className="gradient-text block sm:inline mt-1 sm:mt-0">
                AI-Powered
              </span>{' '}
              Resume Screening
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Transform your recruitment process with intelligent resume analysis.
              Save time, reduce bias, and find the perfect candidates faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="gradient-primary text-white w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12 group shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12 border-2 hover:bg-secondary/80 text-foreground">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 px-4">
              No credit card required • 100 free AI credits
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Why Choose ResumeRank AI?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Leverage cutting-edge AI technology to streamline your hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                <CardContent className="p-5 sm:p-6">
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-lg bg-secondary mb-3 sm:mb-4`}>
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-secondary to-primary/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8 text-center">
            {[
              { value: '70%', label: 'Faster Hiring' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '10k+', label: 'Resumes Analyzed' },
            ].map((stat, index) => (
              <div key={index} className="animate-slide-up py-4" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-2 sm:mb-3">
                  {stat.value}
                </div>
                <div className="text-base sm:text-lg md:text-xl text-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <Card className="border-2 border-primary/20 gradient-card overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12 text-center">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 sm:mb-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">Ready to Transform Your Hiring?</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Join hundreds of companies using AI to find better candidates faster
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="gradient-primary text-white w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12 shadow-lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                100 free AI credits • No credit card required
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-10 md:py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            <div className="flex items-center space-x-2 mb-3 md:mb-0">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="font-bold gradient-text text-sm sm:text-base">
                ResumeRank AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right">
              © 2025 ResumeRank AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
