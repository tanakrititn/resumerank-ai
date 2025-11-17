'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, DollarSign, Users2, ArrowRight, Search, X, SlidersHorizontal, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import JobCardActions from '@/components/jobs/job-card-actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type JobWithCount = {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  salary_range: string | null
  status: string
  created_at: string
  candidatesCount?: number
}

interface JobsListClientProps {
  initialJobs: JobWithCount[]
}

const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48]

export default function JobsListClient({ initialJobs }: JobsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Get unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locations = initialJobs
      .map(job => job.location)
      .filter((loc): loc is string => loc !== null && loc !== '')
    return Array.from(new Set(locations)).sort()
  }, [initialJobs])

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...initialJobs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.requirements?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => job.location === locationFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'candidates':
          return (b.candidatesCount || 0) - (a.candidatesCount || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [initialJobs, searchQuery, statusFilter, locationFilter, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // Calculate stats
  const totalJobs = initialJobs.length
  const openJobs = initialJobs.filter(j => j.status === 'OPEN').length
  const pausedJobs = initialJobs.filter(j => j.status === 'PAUSED').length
  const totalCandidates = initialJobs.reduce((sum, job) => sum + (job.candidatesCount || 0), 0)

  const activeFiltersCount = [
    searchQuery !== '',
    statusFilter !== 'all',
    locationFilter !== 'all',
  ].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setLocationFilter('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  return (
    <>
      {/* Search & Filters Bar */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, description, location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilterChange()
                }}
                className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => {
                    setSearchQuery('')
                    handleFilterChange()
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* Filter Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 h-9 sm:h-10 px-3 sm:px-4 whitespace-nowrap">
                  <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-sm">Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Filter Jobs</h4>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value)
                        handleFilterChange()
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  {uniqueLocations.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Location</label>
                      <Select
                        value={locationFilter}
                        onValueChange={(value) => {
                          setLocationFilter(value)
                          handleFilterChange()
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {uniqueLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="title">Title (A-Z)</SelectItem>
                        <SelectItem value="candidates">Most Candidates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={clearAllFilters}
                    >
                      <X className="mr-2 h-3.5 w-3.5" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  Search: "{searchQuery}"
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-secondary-foreground/20 rounded-full"
                    onClick={() => {
                      setSearchQuery('')
                      handleFilterChange()
                    }}
                  />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  Status: {statusFilter}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-secondary-foreground/20 rounded-full"
                    onClick={() => {
                      setStatusFilter('all')
                      handleFilterChange()
                    }}
                  />
                </Badge>
              )}
              {locationFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  Location: {locationFilter}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-secondary-foreground/20 rounded-full"
                    onClick={() => {
                      setLocationFilter('all')
                      handleFilterChange()
                    }}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Results Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              {filteredJobs.length !== totalJobs && ` (filtered from ${totalJobs} total)`}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs">Per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || locationFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first job posting to get started'}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-9 px-3"
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-9 w-9 p-0 hidden sm:flex"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-9 px-3"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  )
}

// Job Card Component
function JobCard({ job, index }: { job: JobWithCount; index: number }) {
  const candidatesCount = job.candidatesCount || 0

  return (
    <div
      className="group animate-scale-in relative"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/jobs/${job.id}`}>
        <Card className="h-full border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <CardHeader className="space-y-2 sm:space-y-3 relative z-10 p-4 sm:p-5 md:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2 group-hover:text-primary transition-colors font-bold text-foreground">
                  {job.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <Badge
                  variant={job.status === 'OPEN' ? 'default' : 'secondary'}
                  className={
                    job.status === 'OPEN'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-sm text-xs'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold shadow-sm text-xs'
                  }
                >
                  {job.status}
                </Badge>
                <JobCardActions jobId={job.id} jobTitle={job.title} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 relative z-10 p-4 sm:p-5 md:p-6 pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {job.description}
            </p>

            <div className="space-y-2">
              {job.location && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                  </div>
                  <span className="text-muted-foreground line-clamp-1 flex-1">{job.location}</span>
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="p-1 sm:p-1.5 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                    <DollarSign className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                  </div>
                  <span className="text-muted-foreground line-clamp-1 flex-1">{job.salary_range}</span>
                </div>
              )}
            </div>

            <div className="pt-3 sm:pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 group-hover:from-purple-100 group-hover:to-blue-100 transition-colors">
                  <Users2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Candidates</span>
                  <span className="text-sm font-bold text-purple-600">{candidatesCount}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="pt-1 sm:pt-2 flex items-center justify-between">
              <div className="flex items-center text-xs sm:text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                View Details
                <ArrowRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
