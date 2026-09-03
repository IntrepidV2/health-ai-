import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" defaultValue="Alex Rivera" className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input type="email" defaultValue="alex.rivera@example.com" className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input type="tel" defaultValue="+1 (555) 012-3456" className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <input type="date" defaultValue="1982-05-15" className="w-full rounded-lg border-slate-200 bg-slate-50 p-2.5 text-sm" />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-800">Email Alerts</p>
                            <p className="text-xs text-slate-500">Receive summaries and doctor notes via email.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-medium text-slate-800">Risk Alerts (SMS)</p>
                            <p className="text-xs text-slate-500">Immediate alerts when vitals enter red zone.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">Cancel</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">Save Changes</button>
            </div>
        </div>
    </div>
  );
};