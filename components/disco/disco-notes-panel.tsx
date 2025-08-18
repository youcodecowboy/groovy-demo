"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Plus,
  Clock,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Note {
  id: string
  text: string
  author: string
  timestamp: number
  type?: 'note' | 'alert' | 'instruction'
}

interface DiscoNotesPanelProps {
  notes: Note[]
  onAddNote?: (text: string) => Promise<void>
  currentUser?: string
}

export function DiscoNotesPanel({ notes, onAddNote, currentUser = "disco-user" }: DiscoNotesPanelProps) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAddingNote(true)
    try {
      await onAddNote?.(newNote.trim())
      setNewNote("")
      setShowAddForm(false)
      toast({
        title: "Note added",
        description: "Your note has been added successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to add note",
        description: "There was an error adding your note",
        variant: "destructive",
      })
    } finally {
      setIsAddingNote(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNoteTypeColor = (type?: Note['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-800'
      case 'instruction': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Notes
          <Badge variant="outline" className="ml-auto text-xs">
            {notes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notes List */}
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {note.author.split('@')[0]}
                  </span>
                  {note.type && (
                    <Badge className={`text-xs ${getNoteTypeColor(note.type)}`}>
                      {note.type}
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(note.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700">
                  {note.text}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-600">No notes yet</p>
            </div>
          )}
        </div>

        {/* Add Note Section */}
        {showAddForm ? (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isAddingNote}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewNote("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                size="sm"
                className="flex-1"
              >
                {isAddingNote ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
