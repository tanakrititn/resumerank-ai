import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
            <CardTitle>Page Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-6xl font-bold text-center text-muted-foreground">
              404
            </h3>
            <p className="text-muted-foreground text-center">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/jobs" className="flex-1">
              <Button variant="outline" className="w-full">
                View Jobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
