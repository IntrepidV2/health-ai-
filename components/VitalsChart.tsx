import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VitalRecord } from '../types';

interface VitalsChartProps {
  data: VitalRecord[];
  mode?: 'TABS' | 'CARDIO' | 'METABOLIC';
  hideControls?: boolean;
}

export const VitalsChart: React.FC<VitalsChartProps> = ({ data, mode = 'TABS', hideControls = false }) => {
  const [activeTabState, setActiveTabState] = useState<'CARDIO' | 'METABOLIC'>('CARDIO');
  const activeTab = mode === 'TABS' ? activeTabState : mode;

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(r => ({
        timestamp: new Date(r.timestamp).getTime(),
        dateLabel: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
        systolic: r.systolic,
        diastolic: r.diastolic,
        heartRate: r.heartRate,
        glucose: r.glucose,
        temperature: r.temperature
      }));
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
             {activeTab === 'CARDIO' ? 'Cardiovascular Trends' : 'Metabolic Trends'}
        </h3>
        
        {!hideControls && (
            <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTabState('CARDIO')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'CARDIO' ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                BP & HR
            </button>
            <button 
                onClick={() => setActiveTabState('METABOLIC')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'METABOLIC' ? 'bg-white text-red-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
                Glucose
            </button>
            </div>
        )}
      </div>

      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'CARDIO' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis 
                dataKey="dateLabel" 
                fontSize={11} 
                tickMargin={10} 
                stroke="#a1a1aa" 
                axisLine={false} 
                tickLine={false} 
                interval="preserveStartEnd"
              />
              <YAxis fontSize={11} stroke="#a1a1aa" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Line isAnimationActive={false} type="monotone" dataKey="systolic" stroke="#dc2626" strokeWidth={3} dot={{r: 4, fill: '#dc2626', strokeWidth: 2, stroke: '#fff'}} name="Systolic BP" />
              <Line isAnimationActive={false} type="monotone" dataKey="diastolic" stroke="#f87171" strokeWidth={3} dot={{r: 4, fill: '#f87171', strokeWidth: 2, stroke: '#fff'}} name="Diastolic BP" />
              <Line isAnimationActive={false} type="monotone" dataKey="heartRate" stroke="#fb923c" strokeWidth={3} dot={{r: 4, fill: '#fb923c', strokeWidth: 2, stroke: '#fff'}} name="Heart Rate" />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis 
                dataKey="dateLabel" 
                fontSize={11} 
                tickMargin={10} 
                stroke="#a1a1aa" 
                axisLine={false} 
                tickLine={false} 
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" fontSize={11} stroke="#3b82f6" axisLine={false} tickLine={false} label={{ value: 'mg/dL', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" fontSize={11} stroke="#14b8a6" axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} label={{ value: '°F', angle: 90, position: 'insideRight', fill: '#14b8a6', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
              <Line isAnimationActive={false} yAxisId="left" type="monotone" dataKey="glucose" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} name="Glucose" />
              <Line isAnimationActive={false} yAxisId="right" type="monotone" dataKey="temperature" stroke="#14b8a6" strokeWidth={3} dot={{r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff'}} name="Temperature" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};