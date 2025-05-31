import { Calculator } from 'lucide-react'
import { UserSelector } from '@/components/user/user-selector'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">Mental Sum</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <UserSelector />
          </div>
        </div>
      </div>
    </header>
  )
} 