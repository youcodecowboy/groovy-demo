"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Send, 
  User,
  Clock,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Note {
  id: string
  text: string
  author: string
  timestamp: number
  type?: 'note' | 'alert' | 'instruction'
}

interface NotesPanelProps {
  notes: Note[]
  onAddNote?: (text: string) => Promise<void>
  currentUser?: string
}

export function NotesPanel({ notes, onAddNote, currentUser = "admin@demo" }: NotesPanelProps) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAddingNote(true)
    try {
      await onAddNote?.(newNote.trim())
      setNewNote("")
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getNoteTypeColor = (type?: Note['type']) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-800 border-red-200'
      case 'instruction': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthorInitials = (author: string) => {
    return author.split('@')[0].substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes
          <Badge variant="outline" className="ml-auto">
            {notes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notes List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(note.author)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {note.author.split('@')[0]}
                    </span>
                    {note.type && (
                      <Badge className={`text-xs ${getNoteTypeColor(note.type)}`}>
                        {note.type}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(note.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {note.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No notes yet</h4>
              <p className="text-gray-600">Add notes to track important information about this item</p>
            </div>
          )}
        </div>

        {/* Note Composer */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Add a note... (Enter to save, Shift+Enter for new line)"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
              disabled={isAddingNote}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Press Enter to save, Shift+Enter for new line
              </div>
              
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isAddingNote}
                size="sm"
                className="h-8"
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
        </div>
      </CardContent>
    </Card>
  )
}
