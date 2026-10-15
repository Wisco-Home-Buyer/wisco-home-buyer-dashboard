"use client";

import React, { useState } from "react";
import { UserPlus, ChevronDown, X, Loader2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  useInviteUserMutation,
  useRemoveUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useUsersList,
} from "../../hooks/useUsersQuery";
import {
  ApiRole,
  initialsFromName,
  INVITE_ROLE_OPTIONS,
  ROLE_LABELS,
  statusLabel,
} from "../../services/users.service";

export const UsersRolesTab: React.FC = () => {
  const { user } = useAuth();
  const canManage =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const canViewUsers =
    canManage || user?.role === "ANALYST";

  const { data: members = [], isLoading, isError, refetch } = useUsersList(
    canViewUsers,
  );
  const inviteMutation = useInviteUserMutation();
  const updateRoleMutation = useUpdateUserRoleMutation();
  const updateStatusMutation = useUpdateUserStatusMutation();
  const removeMutation = useRemoveUserMutation();
  const [pendingAction, setPendingAction] = useState<{
    kind: "disable" | "enable" | "remove";
    id: string;
    name: string;
  } | null>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<ApiRole>("VIEWER");
  const [inviteRoleDropdownOpen, setInviteRoleDropdownOpen] = useState(false);
  const [activeOpenDropdown, setActiveOpenDropdown] = useState<string | null>(
    null,
  );

  const handleRoleChange = (id: string, newRole: ApiRole) => {
    if (!canManage) return;
    updateRoleMutation.mutate({ id, role: newRole });
    setActiveOpenDropdown(null);
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    const done = { onSettled: () => setPendingAction(null) };

    if (pendingAction.kind === "remove") {
      removeMutation.mutate(pendingAction.id, done);
      return;
    }
    updateStatusMutation.mutate(
      {
        id: pendingAction.id,
        status: pendingAction.kind === "disable" ? "SUSPENDED" : "ACTIVE",
      },
      done,
    );
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !canManage) return;

    const name =
      inviteName.trim() ||
      inviteEmail
        .split("@")[0]
        ?.replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) ||
      "New Member";

    inviteMutation.mutate(
      { email: inviteEmail.trim(), name, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteName("");
          setInviteRole("VIEWER");
          setIsInviteOpen(false);
        },
      },
    );
  };

  if (!canViewUsers) {
    return (
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <p className="text-xs text-slate-500">
          You don&apos;t have permission to view team members.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0f2347] dark:text-white">
            Users & Roles
          </h3>
          <p className="text-xs font-normal text-slate-400 dark:text-slate-500 mt-0.5">
            Give your team the right level of access to manage leads and property data.
          </p>
        </div>

        {canManage &&
          (isInviteOpen ? (
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0e1726] hover:bg-[#1a2942] dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0e1726] hover:bg-[#1a2942] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite team member</span>
            </button>
          ))}
      </div>

      {isInviteOpen && canManage && (
        <form
          onSubmit={handleSendInvite}
          className="p-5 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Work email
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Name
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <button
                type="button"
                onClick={() =>
                  setInviteRoleDropdownOpen(!inviteRoleDropdownOpen)
                }
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all cursor-pointer"
              >
                <span>{ROLE_LABELS[inviteRole]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {inviteRoleDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 space-y-1">
                  {INVITE_ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setInviteRole(opt);
                        setInviteRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        inviteRole === opt
                          ? "bg-[#0f2347] text-white dark:bg-blue-600"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {ROLE_LABELS[opt]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-[#0f2347] hover:bg-[#1a366b] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {inviteMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Send Invite
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {isLoading && (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading team…
          </div>
        )}

        {isError && (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-400">Couldn&apos;t load team members.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          members.map((member) => {
            const isSelf = member.id === user?.id;
            const isSuperAdmin = member.role === "SUPER_ADMIN";
            const canEditRole = canManage && !isSelf && !isSuperAdmin;
            const label = statusLabel(member.status);
            const canManageMember =
              canManage && !isSelf && (user?.role === "SUPER_ADMIN" || !isSuperAdmin);

            return (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#0b1424] text-white flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-xs overflow-hidden relative">
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      initialsFromName(member.name)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#0f2347] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {member.name}
                        {isSelf ? " (you)" : ""}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                          label === "Active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : label === "Pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-[11px] font-normal text-slate-400 mt-0.5 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="relative shrink-0">
                  {canEditRole ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveOpenDropdown(
                            activeOpenDropdown === member.id
                              ? null
                              : member.id,
                          )
                        }
                        className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>{ROLE_LABELS[member.role]}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>

                      {activeOpenDropdown === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveOpenDropdown(null)}
                          />
                          <div className="absolute right-0 mt-2 w-40 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 space-y-1">
                            {INVITE_ROLE_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleRoleChange(member.id, opt)}
                                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                  member.role === opt
                                    ? "bg-[#0f2347] text-white dark:bg-blue-600"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                              >
                                {ROLE_LABELS[opt]}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl whitespace-nowrap">
                      {ROLE_LABELS[member.role]}
                    </span>
                  )}
                </div>

                {canManageMember && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.status !== "INVITED" && (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAction({
                            kind:
                              member.status === "SUSPENDED"
                                ? "enable"
                                : "disable",
                            id: member.id,
                            name: member.name,
                          })
                        }
                        className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer whitespace-nowrap"
                      >
                        {member.status === "SUSPENDED" ? "Enable" : "Disable"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAction({
                          kind: "remove",
                          id: member.id,
                          name: member.name,
                        })
                      }
                      className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm user action"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[22px] p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#0f2347] dark:text-white">
              {pendingAction.kind === "remove"
                ? "Remove this team member?"
                : pendingAction.kind === "disable"
                  ? "Disable this account?"
                  : "Enable this account?"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pendingAction.kind === "remove"
                ? `${pendingAction.name} will be deleted permanently and lose access. This cannot be undone.`
                : pendingAction.kind === "disable"
                  ? `${pendingAction.name} will be signed out and won't be able to sign in until you enable the account again.`
                  : `${pendingAction.name} will be able to sign in again.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={
                  removeMutation.isPending || updateStatusMutation.isPending
                }
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingAction}
                disabled={
                  removeMutation.isPending || updateStatusMutation.isPending
                }
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl cursor-pointer disabled:opacity-50 ${
                  pendingAction.kind === "remove"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#0f2347] hover:bg-[#1a386d] dark:bg-blue-600"
                }`}
              >
                {removeMutation.isPending || updateStatusMutation.isPending
                  ? "Working..."
                  : pendingAction.kind === "remove"
                    ? "Remove"
                    : pendingAction.kind === "disable"
                      ? "Disable"
                      : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
