
import React, { useState, useEffect } from 'react';
import { type EnrichedCustomer } from '../../types';
import { generateCreditSuggestion } from '../../services/geminiService';

interface CreditScoreProps {
  customer: EnrichedCustomer;
}

const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
);

const CreditScore: React.FC<CreditScoreProps> = ({ customer }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsLoading(true);
      const result = await generateCreditSuggestion(customer);
      setSuggestion(result);
      setIsLoading(false);
    };

    fetchSuggestion();
  }, [customer]);

  const riskLevel = suggestion.match(/Low Risk|Medium Risk|High Risk/i)?.[0] || 'Analyzing...';
  const riskColor = riskLevel.includes('Low') ? 'text-green-400' : riskLevel.includes('Medium') ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 h-full">
      <h2 className="text-xl font-semibold text-white mb-4">AI Credit Assessment</h2>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner/>
            <p className="mt-4 text-gray-400">Analyzing payment patterns...</p>
        </div>
      ) : (
        <div className="space-y-4">
            <div>
                <p className="text-sm text-gray-400">Suggested Risk Level</p>
                <p className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</p>
            </div>
            <div>
                <h3 className="font-semibold text-gray-200 mb-2">Justification:</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                    {suggestion.split('\n').filter(line => line.startsWith('* ') || line.startsWith('- ')).map((line, index) => (
                        <li key={index}>{line.substring(2)}</li>
                    ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};

export default CreditScore;
