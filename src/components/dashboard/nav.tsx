'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { signOut } from '@/lib/actions/auth'
import { Briefcase, LayoutDashboard, Shield, Sparkles, LogOut, Menu, ChevronDown } from 'lucide-react'

type User = {
  email?: string
  profile?: {
    full_name?: string | null
    is_admin?: boolean
  } | null
}

export default function DashboardNav({ user }: { user: User }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
  ]

  const getInitials = () => {
    if (user.profile?.full_name) {
      return user.profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return (user.email?.[0] || 'U').toUpperCase()
  }

  if (!mounted) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                    ResumeRank AI
                  </span>
                </div>
              </Link>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {getInitials()}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                  ResumeRank AI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className={
                        isActive
                          ? 'relative bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300'
                          : 'hover:bg-secondary/80 hover:scale-105 transition-all duration-200'
                      }
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full" />
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right Side - Desktop User Menu & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Desktop User Dropdown */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-3 hover:bg-secondary/80 h-auto py-2 px-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getInitials()}
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-semibold leading-tight">
                          {user.profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          View profile
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center space-x-3 p-2">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold shadow-lg">
                        {getInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight mb-1">
                          {user.profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-tight text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.profile?.is_admin && (
                    <>
                      <Link href="/admin/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4 text-primary" />
                          <span>Admin Panel</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="border-2 hover:border-primary/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
                      ResumeRank AI
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 flex flex-col space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 pb-4 border-b bg-secondary/30 rounded-lg p-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-base">
                        {user.profile?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className={`w-full justify-start text-base h-12 ${
                              isActive
                                ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg'
                                : 'hover:bg-secondary/80'
                            }`}
                            size="lg"
                          >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Admin Link */}
                  {user.profile?.is_admin && (
                    <>
                      <div className="border-t pt-4">
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start text-base border-2 border-primary/20 hover:border-primary/50 h-12"
                            size="lg"
                          >
                            <Shield className="mr-3 h-5 w-5 text-primary" />
                            Admin Panel
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}

                  {/* Sign Out */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-base border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 h-12"
                      size="lg"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut()
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
