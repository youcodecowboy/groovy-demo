"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Paperclip, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  FileText,
  Image,
  File,
  Clock,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Attachment {
  id: string
  name: string
  type: 'image' | 'pdf' | 'document' | 'other'
  size: number
  uploadedBy: string
  uploadedAt: number
  url?: string
  thumbnail?: string
}

interface AttachmentsPanelProps {
  attachments: Attachment[]
  onUploadFile?: (file: File) => Promise<void>
  onDeleteFile?: (fileId: string) => Promise<void>
  onPreviewFile?: (fileId: string) => void
}

export function AttachmentsPanel({ 
  attachments, 
  onUploadFile,
  onDeleteFile,
  onPreviewFile
}: AttachmentsPanelProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        await onUploadFile?.(files[i])
      }
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload files",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const getFileTypeColor = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pdf': return 'bg-red-100 text-red-800 border-red-200'
      case 'document': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleDeleteFile = async (fileId: string) => {
    try {
      await onDeleteFile?.(fileId)
      toast({
        title: "File deleted",
        description: "File has been removed successfully",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete file",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          Attachments
          <Badge variant="outline" className="ml-auto">
            {attachments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop files here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Supports images, PDFs, and documents up to 10MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Uploading files...
          </div>
        )}

        {/* Files List */}
        <div className="space-y-3">
          {attachments.length > 0 ? (
            attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                {/* File Icon */}
                <div className={`p-2 rounded-lg border ${getFileTypeColor(attachment.type)}`}>
                  {getFileIcon(attachment.type)}
                </div>
                
                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{attachment.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {attachment.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatFileSize(attachment.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {attachment.uploadedBy.split('@')[0]}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(attachment.uploadedAt)}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {attachment.type === 'image' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPreviewFile?.(attachment.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // Mock download - in real app this would trigger actual download
                      toast({
                        title: "Download started",
                        description: `Downloading ${attachment.name}`,
                      })
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteFile(attachment.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">No attachments</h4>
              <p className="text-gray-600">Upload photos, documents, or other files related to this item</p>
            </div>
          )}
        </div>

        {/* Summary */}
        {attachments.length > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Total Files</div>
                <div className="font-medium">{attachments.length}</div>
              </div>
              <div>
                <div className="text-gray-500">Total Size</div>
                <div className="font-medium">
                  {formatFileSize(attachments.reduce((total, file) => total + file.size, 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
