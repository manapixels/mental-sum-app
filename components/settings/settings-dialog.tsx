'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/contexts/user-context'
import { UserPreferences } from '@/lib/types'
import { Plus, Minus, Calculator, Brain, Clock, Trophy } from 'lucide-react'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { currentUser, updateUser } = useUser()
  const [preferences, setPreferences] = useState<UserPreferences>(
    currentUser?.preferences || {
      difficultyLevel: 'beginner',
      enabledOperations: {
        addition: true,
        subtraction: true,
        multiplication: true,
        division: true,
      },
      sessionLength: 10,
      timeLimit: 30,
      showStrategies: true,
      enableSound: true,
      numberRanges: {
        addition: { min: 1, max: 99 },
        subtraction: { min: 1, max: 99 },
        multiplication: { min: 1, max: 12 },
        division: { min: 1, max: 144 },
      },
    }
  )

  const handleSave = async () => {
    if (!currentUser) return

    updateUser(currentUser.id, { preferences })
    onOpenChange(false)
  }

  const updateOperations = (operation: keyof typeof preferences.enabledOperations, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      enabledOperations: {
        ...prev.enabledOperations,
        [operation]: enabled,
      },
    }))
  }

  const adjustSessionLength = (direction: 'up' | 'down') => {
    setPreferences(prev => ({
      ...prev,
      sessionLength: direction === 'up' 
        ? Math.min(prev.sessionLength + 5, 50)
        : Math.max(prev.sessionLength - 5, 5),
    }))
  }

  const adjustTimeLimit = (direction: 'up' | 'down') => {
    setPreferences(prev => ({
      ...prev,
      timeLimit: direction === 'up' 
        ? Math.min(prev.timeLimit + 5, 120)
        : Math.max(prev.timeLimit - 5, 10),
    }))
  }

  const enabledOperationsCount = Object.values(preferences.enabledOperations).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Difficulty Level
            </Label>
            <Select
              value={preferences.difficultyLevel}
              onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                setPreferences(prev => ({ ...prev, difficultyLevel: value }))
              }
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Beginner</span>
                    <span className="text-xs text-muted-foreground">
                      Simple numbers, basic operations
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Intermediate</span>
                    <span className="text-xs text-muted-foreground">
                      Two-digit numbers, mixed operations
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Advanced</span>
                    <span className="text-xs text-muted-foreground">
                      Large numbers, complex calculations
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Operations */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Math Operations
              <Badge variant="secondary" className="ml-auto">
                {enabledOperationsCount}/4 enabled
              </Badge>
            </Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-green-600" />
                  <Label htmlFor="addition" className="text-sm font-medium">Addition</Label>
                </div>
                <Switch
                  id="addition"
                  checked={preferences.enabledOperations.addition}
                  onCheckedChange={(checked) => updateOperations('addition', checked)}
                  disabled={enabledOperationsCount === 1 && preferences.enabledOperations.addition}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Minus className="h-4 w-4 text-red-600" />
                  <Label htmlFor="subtraction" className="text-sm font-medium">Subtraction</Label>
                </div>
                <Switch
                  id="subtraction"
                  checked={preferences.enabledOperations.subtraction}
                  onCheckedChange={(checked) => updateOperations('subtraction', checked)}
                  disabled={enabledOperationsCount === 1 && preferences.enabledOperations.subtraction}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="h-4 w-4 text-blue-600 font-bold text-xs flex items-center justify-center">×</span>
                  <Label htmlFor="multiplication" className="text-sm font-medium">Multiplication</Label>
                </div>
                <Switch
                  id="multiplication"
                  checked={preferences.enabledOperations.multiplication}
                  onCheckedChange={(checked) => updateOperations('multiplication', checked)}
                  disabled={enabledOperationsCount === 1 && preferences.enabledOperations.multiplication}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="h-4 w-4 text-purple-600 font-bold text-xs flex items-center justify-center">÷</span>
                  <Label htmlFor="division" className="text-sm font-medium">Division</Label>
                </div>
                <Switch
                  id="division"
                  checked={preferences.enabledOperations.division}
                  onCheckedChange={(checked) => updateOperations('division', checked)}
                  disabled={enabledOperationsCount === 1 && preferences.enabledOperations.division}
                />
              </div>
            </div>

            {enabledOperationsCount === 1 && (
              <p className="text-xs text-muted-foreground">
                At least one operation must be enabled for training sessions.
              </p>
            )}
          </div>

          <Separator />

          {/* Session Length */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Length
            </Label>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Problems per session</span>
                <span className="text-xs text-muted-foreground">
                  Recommended: 10-20 problems
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustSessionLength('down')}
                  disabled={preferences.sessionLength <= 5}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {preferences.sessionLength}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustSessionLength('up')}
                  disabled={preferences.sessionLength >= 50}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Time per problem</span>
                <span className="text-xs text-muted-foreground">
                  Seconds to solve each problem
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustTimeLimit('down')}
                  disabled={preferences.timeLimit <= 10}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {preferences.timeLimit}s
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => adjustTimeLimit('up')}
                  disabled={preferences.timeLimit >= 120}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Training Features */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Training Features</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Show Strategy Hints</span>
                  <span className="text-xs text-muted-foreground">
                    Learn mental calculation strategies
                  </span>
                </div>
                <Switch
                  checked={preferences.showStrategies}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, showStrategies: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Sound Effects</span>
                  <span className="text-xs text-muted-foreground">
                    Audio feedback for answers
                  </span>
                </div>
                <Switch
                  checked={preferences.enableSound}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, enableSound: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 