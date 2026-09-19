import React from "react";

export const BuyersTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-wider">
              <th className="pb-3 px-3">BUYER ID</th>
              <th className="pb-3 px-3">CONTACT</th>
              <th className="pb-3 px-3">AREAS</th>
              <th className="pb-3 px-3">SOURCE</th>
              <th className="pb-3 px-3">JOINED</th>
              <th className="pb-3 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="py-4">
                <td className="py-4 px-3">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </td>
                <td className="py-4 px-3">
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                  </div>
                </td>
                <td className="py-4 px-3">
                  <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </td>
                <td className="py-4 px-3">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </td>
                <td className="py-4 px-3">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </td>
                <td className="py-4 px-3 text-right">
                  <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded-full ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
