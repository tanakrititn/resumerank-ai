'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Shield, Trash2, Crown, Search, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_quotas?: Database['public']['Tables']['user_quotas']['Row'] | null
}

export default function UsersTable({ users }: { users: Profile[] }) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false)
  const [isQuotaDialogOpen, setIsQuotaDialogOpen] = useState(false)
  const [isResetCreditsDialogOpen, setIsResetCreditsDialogOpen] = useState(false)
  const [newQuota, setNewQuota] = useState(100)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.is_admin) ||
      (roleFilter === 'user' && !user.is_admin)

    return matchesSearch && matchesRole
  })

  // Paginate filtered users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setCurrentPage(1)
  }

  async function handleDeleteUser() {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      toast.success('Success', {
        description: 'User deleted successfully',
      })

      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete user',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleAdmin() {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          isAdmin: !selectedUser.is_admin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      toast.success('Success', {
        description: selectedUser.is_admin
          ? 'Admin privileges revoked'
          : 'Admin privileges granted',
      })

      setIsPromoteDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update user',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateQuota() {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users/update-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          aiCredits: newQuota,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update quota')
      }

      toast.success('Success', {
        description: 'Quota updated successfully',
      })

      setIsQuotaDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update quota',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResetCredits() {
    if (!selectedUser) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/users/reset-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset credits')
      }

      toast.success('Success', {
        description: 'Used credits reset to 0',
      })

      setIsResetCreditsDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to reset credits',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin Only</SelectItem>
              <SelectItem value="user">Users Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>AI Credits</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {filteredUsers.length === 0 && users.length > 0
                    ? 'No users match your search criteria'
                    : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.full_name || 'No name'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.company_name || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge className="bg-purple-600">
                        <Crown className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.user_quotas ? (
                      <span>
                        {user.user_quotas.ai_credits - user.user_quotas.used_credits} /{' '}
                        {user.user_quotas.ai_credits}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setNewQuota(user.user_quotas?.ai_credits || 100)
                          setIsQuotaDialogOpen(true)
                        }}
                      >
                        Quota
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsResetCreditsDialogOpen(true)
                        }}
                        disabled={!user.user_quotas || user.user_quotas.used_credits === 0}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsPromoteDialogOpen(true)
                        }}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
            {filteredUsers.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
              This will permanently delete all their jobs and candidates. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Admin Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_admin ? 'Revoke Admin' : 'Grant Admin'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_admin ? (
                <>
                  Remove admin privileges from{' '}
                  <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
                  They will no longer have access to the admin panel.
                </>
              ) : (
                <>
                  Grant admin privileges to{' '}
                  <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
                  They will have full access to all system features.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromoteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleToggleAdmin} disabled={isLoading}>
              {isLoading
                ? 'Updating...'
                : selectedUser?.is_admin
                ? 'Revoke Admin'
                : 'Grant Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Quota Dialog */}
      <Dialog open={isQuotaDialogOpen} onOpenChange={setIsQuotaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update AI Credits</DialogTitle>
            <DialogDescription>
              Set the monthly AI credits for{' '}
              <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quota">AI Credits</Label>
              <Input
                id="quota"
                type="number"
                min="0"
                value={newQuota}
                onChange={(e) => setNewQuota(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuotaDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuota} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Quota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Credits Dialog */}
      <Dialog open={isResetCreditsDialogOpen} onOpenChange={setIsResetCreditsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Used Credits</DialogTitle>
            <DialogDescription>
              Reset the used credits to 0 for{' '}
              <strong>{selectedUser?.full_name || selectedUser?.email}</strong>?
              This will restore their available credits to the full quota amount.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Used:</span>
                <span className="font-semibold">{selectedUser?.user_quotas?.used_credits || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Quota:</span>
                <span className="font-semibold">{selectedUser?.user_quotas?.ai_credits || 0}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">After Reset:</span>
                <span className="font-semibold text-green-600">
                  {selectedUser?.user_quotas?.ai_credits || 0} / {selectedUser?.user_quotas?.ai_credits || 0}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetCreditsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleResetCredits} disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
