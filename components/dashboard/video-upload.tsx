'use client';

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  videos: string[];
  onVideosChange: (videos: string[]) => void;
}

export default function VideoUpload({ videos, onVideosChange }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a video file`);
          continue;
        }

        // Validate file size (max 50MB for videos)
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 50MB)`);
          continue;
        }

        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { storageId } = await result.json();

        // Get the URL for the uploaded file
        const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
        uploadedUrls.push(url);
      }

      // Add new videos to existing ones
      onVideosChange([...videos, ...uploadedUrls]);
      toast.success(`Uploaded ${uploadedUrls.length} video(s)`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading videos:", error);
      toast.error("Failed to upload videos");
    } finally {
      setIsUploading(false);
    }
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Videos
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground self-center">
          Max 50MB per video • MP4, MOV, WebM
        </p>
      </div>

      {videos.length > 0 ? (
        <div className="space-y-2">
          {videos.map((videoUrl: string, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Play className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{videoUrl.split('/').pop() || videoUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="ml-2 text-destructive hover:text-destructive/80 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No videos yet. Click "Upload Videos" to add property videos.
          </p>
        </div>
      )}
    </div>
  );
}
