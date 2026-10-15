"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useUpdateProfileMutation } from "../../hooks/useUsersQuery";
import {
  resolveAssetUrl,
  uploadAvatar,
} from "../../services/uploads.service";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 1 * 1024 * 1024;

export const CompanyProfileForm: React.FC = () => {
  const { user } = useAuth();
  const updateProfile = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the form copies the signed-in user once it loads, and again when it changes
    setFormData({
      name: user.name || "",
      email: user.email || "",
      avatarUrl: user.avatarUrl || "",
    });
    setPreviewUrl(null);
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        name: formData.name.trim(),
        ...(formData.avatarUrl.trim()
          ? { avatarUrl: formData.avatarUrl.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 2500);
        },
      },
    );
  };

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG, GIF, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 1MB or smaller.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return localPreview;
    });

    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      await updateProfile.mutateAsync({
        name: formData.name.trim() || user?.name || "User",
        avatarUrl: url,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to upload photo";
      toast.error(message);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
    updateProfile.mutate({
      name: formData.name.trim() || user?.name || "User",
      avatarUrl: null,
    });
  };

  const avatarSrc =
    previewUrl || resolveAssetUrl(formData.avatarUrl) || null;
  const initials =
    (formData.name || formData.email || "U")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const busy = isUploading || updateProfile.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-8"
    >
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Profile
        </h3>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
          Update your display name and profile photo.
        </p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={handlePickPhoto}
            disabled={busy}
            className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 bg-[#0f2347] text-white flex items-center justify-center font-bold text-lg disabled:opacity-60 cursor-pointer"
            aria-label="Upload profile photo"
          >
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Profile Avatar"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              initials
            )}
            {isUploading && (
              <span className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handlePickPhoto}
            disabled={busy}
            className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform disabled:opacity-60 cursor-pointer"
            aria-label="Change profile photo"
          >
            <Camera className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
              Profile photo
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              JPG, PNG, GIF or WEBP. 1MB max.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePickPhoto}
              disabled={busy}
              className="px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
            >
              {avatarSrc ? "Change photo" : "Upload photo"}
            </button>
            {avatarSrc && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={busy}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-3 text-xs font-semibold bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-4 py-3 text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        {savedSuccess ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ✓ Settings saved successfully!
          </span>
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a366b] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl shadow-md transition-all ml-auto disabled:opacity-60 cursor-pointer"
        >
          {updateProfile.isPending && !isUploading && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          Save Changes
        </button>
      </div>
    </form>
  );
};
