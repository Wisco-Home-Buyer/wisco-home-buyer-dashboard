"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
      toast.success("If that email is registered, a reset link is on its way.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#0b1329] font-sans text-slate-900 dark:text-slate-100 px-4 py-8">
      <div className="w-full max-w-[420px] flex flex-col items-center space-y-6">
        <Link href="/" className="inline-block transition-transform hover:scale-105">
          <div className="relative h-14 w-48">
            <Image
              src="/logo.png"
              alt="Wisco Home Buyer Logo"
              fill
              priority
              className="object-contain dark:brightness-0 dark:invert"
            />
          </div>
        </Link>

        <div className="flex flex-col items-center space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2347] dark:text-white tracking-tight">
            Forgot password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>

        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-6 sm:p-9 space-y-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Check your inbox
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                If an account exists for <span className="font-semibold">{email}</span>,
                we&apos;ve sent a link to reset your password. It expires in 60 minutes.
              </p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter Email"
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-medium rounded-xl bg-slate-50/50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2347] dark:focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 mt-2 rounded-xl bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-[#0f2347]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <span>Send reset link</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <Link
          href="/login"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#0f2347] dark:hover:text-white transition-colors"
        >
          Back to sign in
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>256-bit Secure Admin Access</span>
        </div>
      </div>
    </main>
  );
}
