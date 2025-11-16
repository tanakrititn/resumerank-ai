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
import { signOut } from '@/lib/actions/auth'
import { Shield, Users, Briefcase, Activity, BarChart, LogOut, Home, ChevronDown } from 'lucide-react'

type User = {
  email?: string
  profile?: {
    full_name?: string | null
    is_admin?: boolean
  }
}

export default function AdminNav({ user }: { user: User }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: BarChart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/admin/activity', label: 'Activity', icon: Activity },
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
    return (user.email?.[0] || 'A').toUpperCase()
  }

  if (!mounted) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-400 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
            </Link>
            <div className="hidden lg:flex space-x-1">
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
                          ? 'relative bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300'
                          : 'hover:bg-purple-50 hover:scale-105 transition-all duration-200'
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                <span>User View</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-3 hover:bg-purple-50 h-auto py-2 px-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {getInitials()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold leading-tight">
                          {user.profile?.full_name || 'Admin'}
                        </p>
                        <Shield className="h-3 w-3 text-purple-600" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">
                        Administrator
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center space-x-3 p-2">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-semibold shadow-lg">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-sm font-semibold leading-tight">
                          {user.profile?.full_name || 'Admin'}
                        </p>
                        <Shield className="h-3 w-3 text-purple-600" />
                      </div>
                      <p className="text-xs leading-tight text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <Home className="mr-2 h-4 w-4 text-purple-600" />
                    <span>Go to My Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
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
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent hover:scrollbar-thumb-purple-400">
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
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-lg whitespace-nowrap focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2'
                      : 'hover:bg-purple-50 whitespace-nowrap focus-visible:bg-purple-50 focus-visible:scale-105'
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
