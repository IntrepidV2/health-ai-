
import React, { useState, useEffect } from 'react';
import { DeviceIntegration } from '../types';
import { dataService } from '../services/dataService';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<DeviceIntegration[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setDevices(dataService.getDevices());
  }, []);

  const handleToggle = async (id: string) => {
    setLoadingId(id);
    try {
        const updated = await dataService.toggleDeviceConnection(id);
        setDevices(updated);
    } catch (e) {
        console.error("Failed to toggle device", e);
    } finally {
        setLoadingId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    const updated = await dataService.syncAllDevices();
    setDevices(updated);
    setIsSyncing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Connected Wearables</h2>
                <p className="text-sm text-slate-500">Manage your fitness trackers and medical devices.</p>
            </div>
            <button 
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
            >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? 'Syncing Data...' : 'Sync All'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
                <div key={device.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-48 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${device.iconBg} ${device.iconColor}`}>
                            {device.provider.charAt(0)}
                        </div>
                        <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            device.status === 'Connected' 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-slate-50 border-slate-100 text-slate-500'
                        }`}>
                            {device.status}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{device.name}</h3>
                        <p className="text-xs text-slate-500">{device.type} • {device.provider}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                            {device.status === 'Connected' && (
                                <>
                                    {device.batteryLevel !== undefined && (
                                        <div className="flex items-center gap-1 text-xs font-medium text-slate-600" title="Battery Level">
                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {device.batteryLevel}%
                                        </div>
                                    )}
                                    <div className="text-[10px] text-slate-400">
                                        Synced: {device.lastSync}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => handleToggle(device.id)}
                            disabled={loadingId === device.id}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                                device.status === 'Connected'
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                            }`}
                        >
                            {loadingId === device.id 
                                ? '...' 
                                : device.status === 'Connected' ? 'Disconnect' : 'Connect'
                            }
                        </button>
                    </div>
                </div>
            ))}

            {/* Add New Placeholder */}
            <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-48 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h3 className="font-bold text-slate-800">Add New Device</h3>
                <p className="text-xs text-slate-400 mt-1">Supports Bluetooth & Cloud API</p>
            </div>
        </div>
    </div>
  );
};
