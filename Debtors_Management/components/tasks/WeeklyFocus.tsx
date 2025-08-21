
import React, { useState } from 'react';
import { type Customer, type Invoice } from '../../types';
import { generateWeeklyFocus } from '../../services/geminiService';

interface WeeklyFocusProps {
  customers: Customer[];
  invoices: Invoice[];
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
);

const WeeklyFocus: React.FC<WeeklyFocusProps> = ({ customers, invoices }) => {
  const [report, setReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    const result = await generateWeeklyFocus(customers, invoices);
    setReport(result);
    setIsLoading(false);
  };

  const renderMarkdown = (markdown: string) => {
    return markdown
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-4 text-blue-300">{line.substring(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 text-white">{line.substring(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mb-4 text-white">{line.substring(2)}</h1>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        if (line.trim() === '') return <br key={index} />;
        return <p key={index} className="text-gray-300 my-2">{line}</p>;
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Weekly Focus Report</h1>
        <button
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? 'Generating...' : "Generate This Week's Report"}
        </button>
      </div>

      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700/50 min-h-[60vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-gray-300">Our AI is analyzing overdue accounts...</p>
            <p className="text-sm text-gray-500">This might take a moment.</p>
          </div>
        ) : report ? (
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(report)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h2 className="mt-4 text-xl font-semibold text-white">Ready for your weekly priorities?</h2>
            <p className="mt-1 text-gray-400">Click the "Generate" button to get your AI-curated focus list for the week.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyFocus;
