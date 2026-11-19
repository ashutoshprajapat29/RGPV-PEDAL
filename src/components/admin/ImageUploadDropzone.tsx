"use client";

import { useState, useRef, DragEvent } from "react";
import { UploadCloud, X, Star, Image as ImageIcon, Loader2, Plus, Check } from "lucide-react";

export interface UploadedImageItem {
  id?: string;
  url: string;
  isPrimary: boolean;
  caption?: string;
  sortOrder: number;
}

interface ImageUploadDropzoneProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
}

export default function ImageUploadDropzone({ images, onChange }: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
        setErrorMessage("Only JPG, PNG, and WebP images are supported.");
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    validFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image(s).");
      }

      const newUploadedItems: UploadedImageItem[] = data.urls.map((url: string, idx: number) => ({
        url,
        isPrimary: images.length === 0 && idx === 0, // make first image primary if none exists
        caption: "",
        sortOrder: images.length + idx,
      }));

      onChange([...images, ...newUploadedItems]);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    // If the removed one was primary, assign primary to the first available
    if (images[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const updated = [...images];
    updated[index].caption = caption;
    onChange(updated);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem: UploadedImageItem = {
      url: urlInput.trim(),
      isPrimary: images.length === 0,
      caption: "",
      sortOrder: images.length,
    };
    onChange([...images, newItem]);
    setUrlInput("");
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
            : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-800">
              {isUploading ? "Uploading photos..." : "Click or drag & drop bicycle photos here"}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Supports JPG, PNG, and WebP (up to 10MB per image). Upload multiple perspectives (side, drivetrain, cockpit).
            </p>
          </div>
        </div>
      </div>

      {/* Direct Image URL input option */}
      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="Or paste an image web link (https://...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add URL</span>
        </button>
      </div>

      {errorMessage && (
        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
          {errorMessage}
        </p>
      )}

      {/* Uploaded Images Gallery Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Uploaded Bicycle Photos ({images.length})
            </span>
            <span className="text-[11px] text-neutral-500">
              Click the star <Star className="w-3 h-3 inline text-amber-500 fill-amber-500" /> to set the Cover Photo for the storefront
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`relative rounded-xl border-2 overflow-hidden bg-neutral-100 flex flex-col group ${
                  img.isPrimary ? "border-amber-400 ring-2 ring-amber-400/20" : "border-neutral-200"
                }`}
              >
                {/* Image Thumbnail */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={img.url}
                    alt={`Uploaded photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Set Primary Button */}
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className={`absolute top-2 left-2 p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-md ${
                      img.isPrimary
                        ? "bg-amber-400 text-neutral-950 font-black"
                        : "bg-black/60 text-white hover:bg-amber-400 hover:text-black"
                    }`}
                    title="Set as Storefront Cover Photo"
                  >
                    <Star className={`w-3.5 h-3.5 ${img.isPrimary ? "fill-neutral-950" : ""}`} />
                    <span className="text-[10px]">{img.isPrimary ? "Cover" : "Set Cover"}</span>
                  </button>

                  {/* Remove Photo Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors shadow-md"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Caption / Label Input */}
                <div className="p-2 bg-white">
                  <input
                    type="text"
                    placeholder="Caption (e.g. Side profile)"
                    value={img.caption || ""}
                    onChange={(e) => handleCaptionChange(idx, e.target.value)}
                    className="w-full text-[11px] px-2 py-1 rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
