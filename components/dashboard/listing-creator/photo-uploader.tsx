'use client';

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Id } from '@/convex/_generated/dataModel';

interface PhotoUploaderProps {
  onPhotosUploaded: (photoIds: Id<'_storage'>[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoUploader({ 
  onPhotosUploaded, 
  maxPhotos = 20,
  disabled 
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<Array<{ id: Id<'_storage'>; url: string; file: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const uploadFile = async (file: File): Promise<{ id: Id<'_storage'>; url: string }> => {
    const uploadUrl = await generateUploadUrl();
    
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    const { storageId } = await result.json();
    
    // Get the URL for preview
    const url = URL.createObjectURL(file);
    
    return { id: storageId, url };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || photos.length >= maxPhotos) return;

    setUploading(true);
    setUploadProgress(0);

    const filesToUpload = acceptedFiles.slice(0, maxPhotos - photos.length);
    const uploaded: Array<{ id: Id<'_storage'>; url: string; file: File }> = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      try {
        const { id, url } = await uploadFile(filesToUpload[i]);
        uploaded.push({ id, url, file: filesToUpload[i] });
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    const newPhotos = [...photos, ...uploaded];
    setPhotos(newPhotos);
    onPhotosUploaded(newPhotos.map(p => p.id));
    setUploading(false);
    setUploadProgress(0);
  }, [photos, maxPhotos, disabled, generateUploadUrl, onPhotosUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: disabled || uploading || photos.length >= maxPhotos,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosUploaded(newPhotos.map(p => p.id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <p className="text-sm font-medium">Uploading photos...</p>
                <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse • Max {maxPhotos} photos • Max 5MB each
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Uploaded Photos ({photos.length}/{maxPhotos})
            </p>
            {photos.length > 0 && (
              <p className="text-xs text-muted-foreground">
                AI will analyze these to detect features and rooms
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative group aspect-square">
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                    <p className="text-xs font-medium truncate">
                      {photo.file.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ImageIcon className="h-4 w-4" />
          <p>No photos uploaded yet. Add photos for AI analysis.</p>
        </div>
      )}
    </div>
  );
}
