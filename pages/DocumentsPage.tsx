import React from 'react';
import { MOCK_DOCUMENTS } from '../constants';
import { Patient } from '../types';

interface DocumentsPageProps {
  patient: Patient;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ patient }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        
        {/* Section 1: Documents */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">My Documents</h2>
                <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload New
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold">Type</th>
                            <th className="px-6 py-3 font-semibold">Size</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_DOCUMENTS.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors bg-white">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-slate-900">{doc.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{doc.date}</td>
                                <td className="px-6 py-4 text-slate-600">{doc.type}</td>
                                <td className="px-6 py-4 text-slate-500 text-xs">{doc.size}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Section 2: Recent Logs (Moved from Overview) */}
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Recent Activity & Logs</h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Synced via n8n</span>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {[...patient.vitalsHistory].reverse().map((record) => (
                    <div key={record.id} className="px-6 py-4 hover:bg-slate-50/80 transition flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full ${record.source === 'MANUAL' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'} group-hover:scale-110 transition-transform`}>
                            {record.source === 'MANUAL' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                            {record.source === 'MANUAL' ? 'Daily Vitals Check-in' : 'Lab Report Processed'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(record.timestamp).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            {record.systolic}/{record.diastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};