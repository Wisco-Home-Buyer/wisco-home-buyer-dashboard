"use client";

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  useAppSettings,
  useResetAppSettingMutation,
  useUpdateAppSettingMutation,
} from "../../hooks/useAppSettings";
import { AppSetting } from "../../services/appSettings.service";

const cardClass =
  "p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs";

const SettingRow: React.FC<{ setting: AppSetting }> = ({ setting }) => {
  const update = useUpdateAppSettingMutation();
  const reset = useResetAppSettingMutation();
  const [draft, setDraft] = useState<string | null>(null);
  const busy = update.isPending || reset.isPending;

  const isBoolean = setting.type === "boolean";
  const text = draft ?? String(setting.value);
  const changed = !isBoolean && draft !== null && draft.trim() !== setting.value;

  return (
    <div className="py-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-[#0f2347] dark:text-white">
            {setting.label}
          </h3>
          <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-1">
            {setting.description}
          </p>
        </div>

        {isBoolean && (
          <button
            type="button"
            role="switch"
            aria-checked={setting.value === true}
            aria-label={setting.label}
            disabled={busy}
            onClick={() =>
              update.mutate({ key: setting.key, value: setting.value !== true })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
              setting.value === true
                ? "bg-emerald-500"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                setting.value === true ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        )}
      </div>

      {!isBoolean && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={text}
            onChange={(e) => setDraft(e.target.value)}
            disabled={busy}
            type={setting.type === "email" ? "email" : "url"}
            aria-label={setting.label}
            className="flex-1 min-w-[220px] px-3.5 py-2.5 text-xs font-medium bg-slate-50/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            disabled={!changed || busy}
            onClick={() =>
              update.mutate(
                { key: setting.key, value: text.trim() },
                { onSuccess: () => setDraft(null) }
              )
            }
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      )}

      <p className="text-[11px] font-medium text-slate-400">
        {setting.isCustom ? "Customized" : "Using the default"}
        {setting.isCustom && (
          <>
            {" · "}
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                reset.mutate(setting.key, { onSuccess: () => setDraft(null) })
              }
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              Reset to default
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export const AutomationSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const { data: settings, isLoading, isError, refetch } =
    useAppSettings(isSuperAdmin);

  if (!isSuperAdmin) {
    return (
      <div className={cardClass}>
        <p className="text-xs text-slate-500">
          Only a Super Admin can change these settings.
        </p>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="mb-2">
        <h2 className="text-sm font-bold text-[#0f2347] dark:text-white">
          Automation
        </h2>
        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">
          Changes apply within about 30 seconds and don&apos;t need a deploy.
        </p>
      </div>

      {isLoading ? (
        <p className="py-6 text-xs font-semibold text-slate-400">Loading...</p>
      ) : isError || !settings ? (
        <p className="py-6 text-xs font-semibold text-rose-600">
          Could not load settings.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline cursor-pointer"
          >
            Retry
          </button>
        </p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {settings.map((setting) => (
            <SettingRow key={setting.key} setting={setting} />
          ))}
        </div>
      )}
    </div>
  );
};
