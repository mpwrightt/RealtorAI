'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Plus, Loader2 } from "lucide-react";
import ImageUpload from "./image-upload";
import VideoUpload from "./video-upload";

interface EditListingFormProps {
  listing: any;
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const updateListing = useMutation(api.listings.updateListing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    price: listing.price,
    status: listing.status,
    description: listing.description,
    features: listing.features || [],
    images: listing.images || [],
    videos: listing.videos || [],
    virtualTourUrl: listing.virtualTourUrl || "",
  });

  const [newFeature, setNewFeature] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateListing({
        listingId: listing._id as Id<"listings">,
        price: formData.price,
        status: formData.status,
        description: formData.description,
        features: formData.features,
        images: formData.images,
        videos: formData.videos,
        virtualTourUrl: formData.virtualTourUrl || undefined,
      });

      toast.success("Listing updated successfully!");
      router.push(`/dashboard/listings/${listing._id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Failed to update listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_: string, i: number) => i !== index),
    });
  };

  const handleImagesChange = (images: string[]) => {
    setFormData({
      ...formData,
      images,
    });
  };

  const handleVideosChange = (videos: string[]) => {
    setFormData({
      ...formData,
      videos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Details (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium">{listing.address}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">City, State</Label>
              <p className="font-medium">
                {listing.city}, {listing.state} {listing.zipCode}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Bedrooms</Label>
              <p className="font-medium">{listing.bedrooms} beds</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Bathrooms</Label>
              <p className="font-medium">{listing.bathrooms} baths</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Square Feet</Label>
              <p className="font-medium">{listing.sqft.toLocaleString()} sqft</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Property Type</Label>
              <p className="font-medium">{listing.propertyType}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              placeholder="Describe the property..."
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature (e.g., Hardwood Floors)"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" onClick={addFeature} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {formData.features.length === 0 && (
              <p className="text-sm text-muted-foreground">No features added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Property Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
          />
        </CardContent>
      </Card>

      {/* Videos & Virtual Tour */}
      <Card>
        <CardHeader>
          <CardTitle>Videos & Virtual Tour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
            <Input
              id="virtualTourUrl"
              type="url"
              value={formData.virtualTourUrl}
              onChange={(e) =>
                setFormData({ ...formData, virtualTourUrl: e.target.value })
              }
              placeholder="https://my.matterport.com/..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add a Matterport or other virtual tour link
            </p>
          </div>

          <div>
            <Label>Property Videos</Label>
            <div className="mt-2">
              <VideoUpload
                videos={formData.videos}
                onVideosChange={handleVideosChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/listings/${listing._id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
