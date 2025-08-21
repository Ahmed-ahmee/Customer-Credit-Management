import React from 'react';
import { type EnrichedCustomerData } from '../../types';
import CreditScore from './CreditScore';
import Badge from '../shared/Badge';

interface CustomerDetailProps {
  customerData: EnrichedCustomerData;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerData }) => {
  const { summary, invoiceSummaries, ageSummaries } = customerData;
  const totalOutstanding = ageSummaries.reduce((sum, i) => sum + i.outstanding, 0);
  const totalOverdue = ageSummaries.filter(i => i.ageDays > 0).reduce((sum, i) => sum + i.outstanding, 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">{summary.customerName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total Outstanding</p>
                  <p className="text-3xl font-bold text-white mt-1">${totalOutstanding.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50">
                  <p className="text-sm text-gray-400">Total Overdue</p>
                  <p className="text-3xl font-bold text-red-400 mt-1">${totalOverdue.toLocaleString()}</p>
              </div>
           </div>
           
           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-white p-6">Aging Details</h2>
              <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Outstanding</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Invoice Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Age (Days)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {ageSummaries.filter(a => a.outstanding > 0).map(age => (
                            <tr key={age.invoiceNumber}>
                                <td className="px-6 py-4 text-sm text-gray-300">{age.invoiceNumber}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-white">${age.outstanding.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{age.invoiceDate.toLocaleDateString()}</td>
                                <td className={`px-6 py-4 text-sm font-bold ${age.ageDays > 0 ? 'text-red-400' : 'text-green-400'}`}>{age.ageDays}</td>
                            </tr>
                          ))}
                    </tbody>
                 </table>
              </div>
           </div>
           <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-white p-6">Invoice Summary</h2>
              <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Net Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">Collection %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">BC Age Days</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {invoiceSummaries.map(inv => (
                            <tr key={inv.invoiceNumber}>
                                <td className="px-6 py-4 text-sm text-gray-300">{inv.invoiceNumber}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-white">${inv.netInvoice.toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{inv.percentOfCollection}%</td>
                                <td className="px-6 py-4 text-sm text-gray-300">{inv.bcAgeDays}</td>
                            </tr>
                          ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
        <div className="lg:col-span-1">
          <CreditScore customerData={customerData} />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;