"use client";

import { useState, useEffect } from "react";
import { X, Bike, Check, Loader2, Sparkles } from "lucide-react";
import ImageUploadDropzone, { UploadedImageItem } from "./ImageUploadDropzone";

interface BikeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
}

export default function BikeFormModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: BikeFormModalProps) {
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("Mountain");
  const [frameSize, setFrameSize] = useState("M");
  const [gearCount, setGearCount] = useState(7);
  const [isElectric, setIsElectric] = useState(false);
  const [batteryRangeKm, setBatteryRangeKm] = useState<string | number>("");
  const [hourlyRate, setHourlyRate] = useState<number>(15.0);
  const [securityDeposit, setSecurityDeposit] = useState<number>(50.0);
  const [status, setStatus] = useState("AVAILABLE");
  const [location, setLocation] = useState("RGPV Main Gate Cycle Stand");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedImageItem[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clear specific field error on user input
  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // PRE-FILL FORM VALUES AUTOMATICALLY WHEN EDITING
  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name || "");
      setBrand(initialData.brand || "");
      setModel(initialData.model || "");
      setType(initialData.type || "Mountain");
      setFrameSize(initialData.frameSize || "M");
      setGearCount(initialData.gearCount || 7);
      setIsElectric(Boolean(initialData.isElectric));
      setBatteryRangeKm(initialData.batteryRangeKm || "");
      setHourlyRate(initialData.hourlyRate || 15.0);
      setSecurityDeposit(initialData.securityDeposit || 50.0);
      setStatus(initialData.status || "AVAILABLE");
      setLocation(initialData.location || "RGPV Main Gate Cycle Stand");
      setDescription(initialData.description || "");
      setImages(
        initialData.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
          caption: img.caption || "",
          sortOrder: img.sortOrder || 0,
        })) || []
      );
    } else if (!initialData && isOpen) {
      // Reset for new cycle
      setName("");
      setBrand("");
      setModel("");
      setType("Mountain");
      setFrameSize("M");
      setGearCount(7);
      setIsElectric(false);
      setBatteryRangeKm("");
      setHourlyRate(15.0);
      setSecurityDeposit(50.0);
      setStatus("AVAILABLE");
      setLocation("RGPV Main Gate Cycle Stand");
      setDescription("");
      setImages([]);
    }
    setErrorMessage(null);
    setFieldErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Comprehensive client-side form validation
    const errors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = "Bicycle model name is required.";
    } else if (trimmedName.length < 3) {
      errors.name = "Bicycle name must be at least 3 characters long.";
    } else if (trimmedName.length > 80) {
      errors.name = "Bicycle name cannot exceed 80 characters.";
    }

    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      errors.hourlyRate = "Hourly rate must be greater than ₹0 (e.g. ₹15/hr).";
    } else if (hourlyRate > 1000) {
      errors.hourlyRate = "Hourly rate cannot exceed ₹1,000 / hr.";
    }

    if (isNaN(securityDeposit) || securityDeposit < 0) {
      errors.securityDeposit = "Security deposit must be ₹0 or greater.";
    } else if (securityDeposit > 10000) {
      errors.securityDeposit = "Security deposit cannot exceed ₹10,000.";
    }

    if (isNaN(gearCount) || gearCount < 1 || gearCount > 30) {
      errors.gearCount = "Gears must be between 1 and 30.";
    }

    if (isElectric) {
      const rangeNum = Number(batteryRangeKm);
      if (!batteryRangeKm || isNaN(rangeNum) || rangeNum <= 0) {
        errors.batteryRangeKm = "Please specify a valid battery range in km (> 0).";
      } else if (rangeNum > 200) {
        errors.batteryRangeKm = "Battery range seems too high (max 200 km).";
      }
    }

    if (!location.trim()) {
      errors.location = "Please select a campus cycle stand location.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please correct the highlighted form errors below.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || "Hero",
        model: model.trim() || "Standard",
        type,
        frameSize,
        gearCount: Number(gearCount),
        isElectric,
        batteryRangeKm: isElectric && batteryRangeKm ? Number(batteryRangeKm) : null,
        hourlyRate: parseFloat(hourlyRate.toString()),
        securityDeposit: parseFloat(securityDeposit.toString()),
        status,
        location,
        description: description.trim(),
        images,
      };

      const url = isEditing ? `/api/bikes/${initialData.id}` : "/api/bikes";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save bicycle.");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm">
                {isEditing ? `Edit: ${initialData?.name}` : "Add Bicycle & Upload Photos"}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {isEditing
                  ? "All existing cycle details and photos are pre-filled below. Change only what you need."
                  : "Upload cycle pictures, set Cover Photo, and specify hourly rental rate in ₹."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Upload Bicycle Photos
            </h4>
            <p className="text-[11px] text-neutral-600 mb-3">
              Drag & drop photos or select files. Click the star on any photo to set it as the Cover Photo for students.
            </p>
            <ImageUploadDropzone images={images} onChange={setImages} />
            {images.length === 0 && (
              <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 mt-2 font-medium">
                Tip: Adding at least one photo helps students identify the cycle at the stand.
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <h4 className="font-bold text-neutral-700 uppercase tracking-wider mb-2.5 text-[10px]">
              Cycle Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <label className="block font-semibold text-neutral-700 mb-1">
                  Bicycle Model Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hero Lectro C6E or Firefox Target"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                      : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                  }`}
                  required
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Brand (Hero, Firefox, Hercules, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hero"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Model Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. C6E"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Electric">Electric (e-Cycle)</option>
                  <option value="Mountain">Geared Mountain Bike (MTB)</option>
                  <option value="City">Campus Roadster / Single Speed</option>
                  <option value="Hybrid">Hybrid Commuter</option>
                  <option value="Road">Road / Speed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing in ₹ */}
          <div>
            <h4 className="font-bold text-neutral-700 uppercase tracking-wider mb-2.5 text-[10px]">
              Hourly Pricing & Security Deposit (INR ₹)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Hourly Rate (₹ / hr) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="15"
                    value={hourlyRate || ""}
                    onChange={(e) => {
                      setHourlyRate(parseFloat(e.target.value) || 0);
                      clearError("hourlyRate");
                    }}
                    className={`w-full pl-7 pr-3 py-2 rounded-xl border font-bold focus:outline-none transition-colors ${
                      fieldErrors.hourlyRate
                        ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                        : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                    }`}
                    required
                  />
                </div>
                {fieldErrors.hourlyRate && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.hourlyRate}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Refundable Security Deposit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="5"
                    min="0"
                    placeholder="50"
                    value={securityDeposit}
                    onChange={(e) => {
                      setSecurityDeposit(parseFloat(e.target.value) || 0);
                      clearError("securityDeposit");
                    }}
                    className={`w-full pl-7 pr-3 py-2 rounded-xl border font-bold focus:outline-none transition-colors ${
                      fieldErrors.securityDeposit
                        ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                        : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                    }`}
                  />
                </div>
                {fieldErrors.securityDeposit && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.securityDeposit}</p>
                )}
              </div>
            </div>
          </div>

          {/* Specs & Campus Cycle Stand Location */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Frame Size
              </label>
              <select
                value={frameSize}
                onChange={(e) => setFrameSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="S">Small (S)</option>
                <option value="M">Medium (M)</option>
                <option value="L">Large (L)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Gears
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={gearCount}
                onChange={(e) => {
                  setGearCount(parseInt(e.target.value) || 1);
                  clearError("gearCount");
                }}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none transition-colors ${
                  fieldErrors.gearCount
                    ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                    : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                }`}
              />
              {fieldErrors.gearCount && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.gearCount}</p>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={isElectric}
                  onChange={(e) => setIsElectric(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-neutral-800">Electric Assist?</span>
              </label>
            </div>

            {isElectric && (
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Battery Range (km) *
                </label>
                <input
                  type="number"
                  placeholder="35"
                  min="1"
                  max="200"
                  value={batteryRangeKm}
                  onChange={(e) => {
                    setBatteryRangeKm(e.target.value);
                    clearError("batteryRangeKm");
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-medium focus:outline-none transition-colors ${
                    fieldErrors.batteryRangeKm
                      ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                      : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.batteryRangeKm && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.batteryRangeKm}</p>
                )}
              </div>
            )}
          </div>

          {/* Campus Cycle Stand & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Campus Cycle Stand Location
              </label>
              <select
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  clearError("location");
                }}
                className={`w-full px-3 py-2 rounded-xl border font-medium bg-white focus:outline-none ${
                  fieldErrors.location
                    ? "border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-400"
                    : "border-neutral-300 focus:ring-2 focus:ring-emerald-500"
                }`}
              >
                <option value="RGPV Main Gate Cycle Stand">RGPV Main Gate Cycle Stand</option>
                <option value="UIT Academic Block Cycle Stand">UIT Academic Block Cycle Stand</option>
                <option value="Central Library Cycle Stand">Central Library Cycle Stand</option>
                <option value="Hostel Cluster Cycle Stand">Hostel Cluster Cycle Stand</option>
                <option value="Sports Complex Cycle Stand">Sports Complex Cycle Stand</option>
              </select>
              {fieldErrors.location && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.location}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="AVAILABLE">Available for Rent</option>
                <option value="RENTED">Currently Rented Out</option>
                <option value="MAINTENANCE">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Equipped with front basket, ideal for quick campus trips..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Update Cycle" : "Add to Fleet"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
