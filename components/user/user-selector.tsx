'use client'

import React, { useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Plus, Loader2 } from 'lucide-react'

export function UserSelector() {
  const { currentUser, users, setCurrentUser, createUser, isLoading } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleUserChange = (userId: string) => {
    if (userId === 'add-new') {
      setIsDialogOpen(true)
      return
    }
    setCurrentUser(userId)
  }

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return

    setIsCreating(true)
    try {
      await createUser(newUserName.trim())
      setNewUserName('')
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newUserName.trim()) {
      handleCreateUser()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentUser?.id || ''}
        onValueChange={handleUserChange}
      >
        <SelectTrigger className="w-[160px] sm:w-[200px] h-10">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <SelectValue 
              placeholder="Select User" 
              className="text-sm"
            />
          </div>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">{user.name}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="add-new">
            <div className="flex items-center gap-2 text-blue-600">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add New User</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Add New User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New User</DialogTitle>
            <DialogDescription>
              Create a new user profile to track your mental math progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-base">
                Name
              </Label>
              <Input
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className="h-12 text-base"
                autoFocus
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setNewUserName('')
              }}
              className="h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateUser}
              disabled={!newUserName.trim() || isCreating}
              className="h-12 px-6"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Welcome component for when no users exist
export function WelcomeScreen() {
  const { createUser } = useUser()
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateFirstUser = async () => {
    if (!name.trim()) return

    setIsCreating(true)
    try {
      await createUser(name.trim())
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleCreateFirstUser()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Mental Sum!</h1>
          <p className="text-muted-foreground">
            Let&apos;s get started by creating your user profile.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcome-name" className="text-base">
              What&apos;s your name?
            </Label>
            <Input
              id="welcome-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your name"
              className="h-12 text-base text-center"
              autoFocus
              maxLength={50}
            />
          </div>

          <Button
            onClick={handleCreateFirstUser}
            disabled={!name.trim() || isCreating}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 