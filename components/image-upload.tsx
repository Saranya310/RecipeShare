'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImageUrl?: string
  disabled?: boolean
  uploadText?: string
  bucketName?: string
  folderPath?: string
}

export default function ImageUpload({ onImageUpload, currentImageUrl, disabled, uploadText = "Upload Recipe Image", bucketName = "recipe-images", folderPath = "recipe-images" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folderPath}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        console.error('Bucket name:', bucketName)
        console.error('File path:', filePath)
        console.error('File size:', file.size)
        console.error('File type:', file.type)
        
        // More specific error messages
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('404')) {
          alert('Storage bucket not configured. Please use the URL input below to add an image URL instead.')
        } else if (uploadError.message.includes('permission') || uploadError.message.includes('403')) {
          alert('Permission denied. Please use the URL input below to add an image URL instead.')
        } else if (uploadError.message.includes('row-level security policy') || uploadError.message.includes('RLS')) {
          alert('Upload failed: new row violates row-level security policy.\n\nPlease use the URL input below instead.')
        } else if (uploadError.message.includes('size')) {
          alert('File too large. Please select a smaller image or use the URL input below.')
        } else {
          alert(`Upload failed: ${uploadError.message}\n\nPlease use the URL input below instead.`)
        }
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onImageUpload(publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Recipe preview"
            className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-gray-50"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Upload Button */}
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-8 h-8 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {preview ? 'Change Image' : uploadText}
            </p>
            <p className="text-xs text-gray-500">
              Click to select or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* URL Input as Fallback */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or enter image URL
        </label>
        <input
          type="url"
          value={currentImageUrl || ''}
          onChange={(e) => {
            setPreview(e.target.value)
            onImageUpload(e.target.value)
          }}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-white disabled:bg-gray-50"
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          If upload fails, you can paste an image URL here instead
        </p>
      </div>
    </div>
  )
}
