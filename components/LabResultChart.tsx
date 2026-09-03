import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LabResult } from '../types';

interface LabResultChartProps {
  data: LabResult[];
  fixedTest?: string;
  hideControls?: boolean;
}

export const LabResultChart: React.FC<LabResultChartProps> = ({ data, fixedTest, hideControls = false }) => {
  // Get unique test names available in the history
  const availableTests = useMemo(() => {
    const tests = new Set(data.map(d => d.testName));
    return Array.from(tests);
  }, [data]);

  const [selectedTest, setSelectedTest] = useState<string>(availableTests[0] || '');

  // Effect to handle fixedTest prop changes
  useEffect(() => {
    if (fixedTest) {
      setSelectedTest(fixedTest);
    } else if (availableTests.length > 0 && !selectedTest) {
      setSelectedTest(availableTests[0]);
    }
  }, [fixedTest, availableTests, selectedTest]);

  const currentTest = fixedTest || selectedTest;

  // Filter and format data for the chart
  const chartData = useMemo(() => {
    return data
      .filter(d => d.testName === currentTest)
      .map(r => ({
        date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
        fullDate: new Date(r.timestamp).toLocaleDateString(),
        value: parseFloat(r.value),
        unit: r.unit,
        range: r.range
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data, currentTest]);

  if (availableTests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h3 className="text-base font-bold text-slate-800">{currentTest} Trends</h3>
        </div>
        
        {!hideControls && (
            <div className="relative">
                <select 
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                    {availableTests.map(test => (
                        <option key={test} value={test}>{test}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 min-h-[250px] w-full">
        {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" fontSize={11} tickMargin={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                formatter={(value: number) => [`${value} ${chartData[0].unit}`, currentTest]}
                labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} 
                    activeDot={{ r: 6 }}
                    name={currentTest} 
                    animationDuration={1000} 
                />
            </LineChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available for {currentTest}.
            </div>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-800">
                Standard Range: <span className="font-bold">{chartData[0].range} {chartData[0].unit}</span>.
            </p>
        </div>
      )}
    </div>
  );
};