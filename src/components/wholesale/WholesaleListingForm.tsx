"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  ListingStatus,
  ListingVisibility,
  WholesaleListing,
  WholesaleListingInput,
} from "../../services/wholesaleListings.service";
import { ImageLightbox } from "./ImageLightbox";
import { US_STATES } from "../../lib/us-states";
import { lookupZip } from "../../services/zip.service";
import {
  resolveAssetUrl,
  uploadListingImages,
} from "../../services/uploads.service";

const MAX_IMAGES = 20;

const inputClass =
  "w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

const labelClass =
  "block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider";

interface WholesaleListingFormProps {
  listing?: WholesaleListing;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (input: WholesaleListingInput) => void;
}

const optionalNumber = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const WholesaleListingForm: React.FC<WholesaleListingFormProps> = ({
  listing,
  isSubmitting,
  submitLabel,
  onSubmit,
}) => {
  const [title, setTitle] = useState(listing?.title ?? "");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [price, setPrice] = useState(listing ? String(listing.price) : "");
  const [street, setStreet] = useState(listing?.street ?? "");
  const [city, setCity] = useState(listing?.city ?? "");
  const [state, setState] = useState(listing?.state ?? "WI");
  const [zip, setZip] = useState(listing?.zip ?? "");
  const [bedrooms, setBedrooms] = useState(
    listing?.bedrooms != null ? String(listing.bedrooms) : ""
  );
  const [bathrooms, setBathrooms] = useState(
    listing?.bathrooms != null ? String(listing.bathrooms) : ""
  );
  const [squareFeet, setSquareFeet] = useState(
    listing?.squareFeet != null ? String(listing.squareFeet) : ""
  );
  const [videoUrl, setVideoUrl] = useState(listing?.videoUrl ?? "");
  const [status, setStatus] = useState<ListingStatus>(
    listing?.status ?? "AVAILABLE"
  );
  const [visibility, setVisibility] = useState<ListingVisibility>(
    listing?.visibility ?? "PRIVATE"
  );
  const [zipStatus, setZipStatus] = useState<"idle" | "loading" | "notfound">(
    "idle"
  );
  const zipAbortRef = useRef<AbortController | null>(null);
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => () => zipAbortRef.current?.abort(), []);

  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/[^\d-]/g, "");
    setZip(cleaned);
    zipAbortRef.current?.abort();

    const fiveDigits = cleaned.match(/^\d{5}(?:-\d{4})?$/)?.[0].slice(0, 5);
    if (!fiveDigits) {
      setZipStatus("idle");
      return;
    }

    const controller = new AbortController();
    zipAbortRef.current = controller;
    setZipStatus("loading");

    lookupZip(fiveDigits, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result) {
          setCity(result.city);
          setState(result.state);
          setZipStatus("idle");
        } else {
          setZipStatus("notfound");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setZipStatus("notfound");
      });
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`You can add up to ${MAX_IMAGES} photos per listing`);
      return;
    }

    setIsUploading(true);
    try {
      const urls = await uploadListingImages(files);
      setImages((current) => [...current, ...urls]);
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to upload photos"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImages((current) => current.filter((item) => item !== url));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const priceValue = optionalNumber(price);
    if (priceValue === undefined) {
      toast.error("Enter a valid price");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      street: street.trim(),
      city: city.trim(),
      state: state.trim() || undefined,
      zip: zip.trim(),
      bedrooms: optionalNumber(bedrooms),
      bathrooms: optionalNumber(bathrooms),
      squareFeet: optionalNumber(squareFeet),
      videoUrl: videoUrl.trim() || undefined,
      status,
      visibility,
      imageUrls: images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-5">
        <div>
          <label className={labelClass} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="3BR ranch near downtown Appleton"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={5}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condition, repairs needed, ARV, rent potential..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="price">
              Price (USD)
            </label>
            <input
              id="price"
              required
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ListingStatus)}
              className={inputClass}
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_CONTRACT">Under contract</option>
              <option value="SOLD">Sold</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="visibility">
              Visibility
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as ListingVisibility)
              }
              className={inputClass}
            >
              <option value="PRIVATE">Private (Buyers List)</option>
              <option value="PUBLIC">Public (Wholesale Listings)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="street">
            Street
          </label>
          <input
            id="street"
            required
            maxLength={200}
            autoComplete="address-line1"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main St"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="zip">
              ZIP
            </label>
            <input
              id="zip"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="\d{5}(-\d{4})?"
              maxLength={10}
              value={zip}
              onChange={(e) => handleZipChange(e.target.value)}
              className={inputClass}
            />
            {zipStatus !== "idle" && (
              <p
                className={`mt-1 text-[11px] font-medium ${
                  zipStatus === "notfound"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-400"
                }`}
              >
                {zipStatus === "loading"
                  ? "Looking up ZIP..."
                  : "ZIP not found. Enter the city and state manually."}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="city">
              City
            </label>
            <input
              id="city"
              required
              maxLength={100}
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="state">
              State
            </label>
            <select
              id="state"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={inputClass}
            >
              {US_STATES.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              min={0}
              step={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              id="bathrooms"
              type="number"
              min={0}
              step={0.5}
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="squareFeet">
              Square feet
            </label>
            <input
              id="squareFeet"
              type="number"
              min={0}
              step={1}
              value={squareFeet}
              onChange={(e) => setSquareFeet(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="videoUrl">
            Video link (YouTube / Vimeo)
          </label>
          <input
            id="videoUrl"
            type="url"
            maxLength={500}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
            Photos ({images.length}/{MAX_IMAGES})
          </h2>
          <label className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4 text-slate-500" />
            )}
            <span>{isUploading ? "Uploading..." : "Add photos"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/heic"
              multiple
              disabled={isUploading}
              onChange={handleFiles}
              className="sr-only"
            />
          </label>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View photo ${index + 1} larger`}
                  className="block w-full h-full cursor-zoom-in"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(url) ?? ""}
                    alt={`Listing photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-800">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-400">
            No photos yet. JPG, PNG or HEIC. The first photo is the cover.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="px-6 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>

      <ImageLightbox
        images={images.map((url) => resolveAssetUrl(url) ?? "")}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
      />
    </form>
  );
};
