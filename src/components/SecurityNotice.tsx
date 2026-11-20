import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface SecurityNoticeProps {
  title: string;
  children: React.ReactNode;
}

export const SecurityNotice: React.FC<SecurityNoticeProps> = ({ title, children }) => (
  <aside className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs font-mono text-slate-300">
    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
    <div className="space-y-1">
      <h2 className="font-bold text-emerald-300">{title}</h2>
      <p className="leading-relaxed">{children}</p>
    </div>
  </aside>
);
