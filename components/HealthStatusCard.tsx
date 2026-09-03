import React from 'react';
import { RiskAnalysis } from '../types';

interface Props {
  risk: RiskAnalysis;
}

export const HealthStatusCard: React.FC<Props> = ({ risk }) => {
  const getColors = () => {
    switch (risk.level) {
      case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-900';
      case 'WORSENING': return 'bg-orange-50 border-orange-200 text-orange-900';
      default: return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    }
  };

  const getStatusDot = () => {
      switch (risk.level) {
      case 'CRITICAL': return 'bg-red-600';
      case 'WORSENING': return 'bg-orange-500';
      default: return 'bg-emerald-500';
    }
  }

  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${getColors()}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-black uppercase tracking-widest opacity-70">Risk Assessment</h2>
        <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDot()}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusDot()}`}></span>
        </span>
      </div>
      
      <div className="mb-6">
          <div className="text-3xl font-black mb-2 tracking-tight">
            {risk.level === 'NORMAL' ? 'Stable' : risk.level}
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/50 border border-black/5">
             Trend: {risk.trend}
          </div>
      </div>

      <p className="text-sm font-medium mb-6 leading-relaxed opacity-90">
        {risk.summary}
      </p>

      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-black/5">
        <h4 className="font-bold text-xs mb-3 opacity-70 uppercase tracking-wide">Recommended Actions</h4>
        <ul className="space-y-2">
          {risk.actionItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm font-medium">
                <svg className="w-4 h-4 mt-0.5 opacity-70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};