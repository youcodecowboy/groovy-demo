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
  User,
  Camera
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

interface DiscoAttachmentsProps {
  attachments: Attachment[]
  onUploadFile?: (file: File) => Promise<void>
  onDeleteFile?: (fileId: string) => Promise<void>
  onPreviewFile?: (fileId: string) => void
}

export function DiscoAttachments({ 
  attachments, 
  onUploadFile,
  onDeleteFile,
  onPreviewFile
}: DiscoAttachmentsProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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
      case 'image': return 'bg-blue-100 text-blue-800'
      case 'pdf': return 'bg-red-100 text-red-800'
      case 'document': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="h-4 w-4" />
          Attachments
          <Badge variant="outline" className="ml-auto text-xs">
            {attachments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Tap to upload files
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Images, PDFs, documents up to 10MB
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
          
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
                <div className={`p-2 rounded-lg ${getFileTypeColor(attachment.type)}`}>
                  {getFileIcon(attachment.type)}
                </div>
                
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
                    <span>{attachment.uploadedBy.split('@')[0]}</span>
                    <span>•</span>
                    <span>{formatTimestamp(attachment.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {attachment.type === 'image' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPreviewFile?.(attachment.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      toast({
                        title: "Download started",
                        description: `Downloading ${attachment.name}`,
                      })
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteFile(attachment.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-600">No attachments</p>
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
