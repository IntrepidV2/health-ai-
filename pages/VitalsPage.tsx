import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Patient } from '../types';
import { VitalsChart } from '../components/VitalsChart';
import { LabResultChart } from '../components/LabResultChart';

interface Props {
  patient: Patient;
}

export const VitalsPage: React.FC<Props> = ({ patient }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const input = document.getElementById('report-content');
    if (!input) return;
    
    setDownloading(true);
    try {
        // Capture the DOM element
        const canvas = await html2canvas(input, {
            scale: 2, // High resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let position = 0;
        
        // Add image to PDF (handling simple single page for now, usually fits)
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

        pdf.save(`Pulsera_Report_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
        console.error("PDF Generation failed", err);
        alert("Failed to generate report. Please try again.");
    } finally {
        setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">My Vitals Dashboard</h2>
            <button 
                onClick={handleDownload}
                disabled={downloading}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
                {downloading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Download Report
                    </>
                )}
            </button>
        </div>

        {/* This container is what gets captured for the PDF */}
        <div id="report-content" className="space-y-6 p-4 bg-slate-50/20">
            {/* Header visible primarily in Report mode but looks good on screen too */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
                            <path d="M2 12h3l2-5 4 10 4-10 2 5h5" />
                        </svg>
                        <h1 className="text-xl font-bold text-slate-900">Pulsera Health Report</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-slate-900 text-lg">{patient.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">ID: {patient.id}</p>
                    <p className="text-sm text-slate-600 mt-1">{patient.age} years • {patient.condition}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VitalsChart data={patient.vitalsHistory} mode="CARDIO" hideControls />
                <VitalsChart data={patient.vitalsHistory} mode="METABOLIC" hideControls />
                <LabResultChart data={patient.labHistory} fixedTest="HbA1c" hideControls />
                <LabResultChart data={patient.labHistory} fixedTest="Cholesterol (Total)" hideControls />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden break-inside-avoid">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">Detailed Clinical History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Source</th>
                                <th className="px-6 py-3 font-semibold">BP (mmHg)</th>
                                <th className="px-6 py-3 font-semibold">HR (bpm)</th>
                                <th className="px-6 py-3 font-semibold">Glucose</th>
                                <th className="px-6 py-3 font-semibold">Temp</th>
                                <th className="px-6 py-3 font-semibold">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...patient.vitalsHistory].reverse().map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 transition-colors bg-white">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {new Date(record.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${record.source === 'MANUAL' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'}`}>
                                            {record.source === 'MANUAL' ? 'Manual' : 'Upload'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{record.systolic}/{record.diastolic}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.heartRate}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.glucose || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{record.temperature || '-'}</td>
                                    <td className="px-6 py-4 text-slate-400 italic text-xs max-w-xs truncate">{record.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="text-center text-[10px] text-slate-400 py-4 uppercase tracking-widest">
                Automated Report • Pulsera AI Health Monitor
            </div>
        </div>
    </div>
  );
};