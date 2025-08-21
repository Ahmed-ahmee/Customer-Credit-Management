
import React from 'react';
import { type EnrichedCustomer, InvoiceStatus } from '../../types';
import CreditScore from './CreditScore';
import Badge from '../shared/Badge';

interface CustomerDetailProps {
  customer: EnrichedCustomer;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer }) => {
  const today = new Date();
  const totalOutstanding = customer.invoices.filter(i => i.status !== InvoiceStatus.PAID).reduce((sum, i) => sum + i.netValue, 0);
  const totalOverdue = customer.invoices.filter(i => i.status === InvoiceStatus.OVERDUE).reduce((sum, i) => sum + i.netValue, 0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">{customer.name}</h1>
        <p className="text-gray-400 mt-1">{customer.email} | Contact: {customer.contactPerson}</p>
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
           <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-white">Invoices</h2>
              <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Invoice #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Due Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Age</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {customer.invoices.map(inv => {
                          const age = inv.status === InvoiceStatus.PAID ? '-' : `${Math.floor((today.getTime() - inv.dueDate.getTime())/(1000*60*60*24))} days`;
                          const badgeColor = inv.status === InvoiceStatus.PAID ? 'green' : inv.status === InvoiceStatus.OVERDUE ? 'red' : 'yellow';
                          return (
                            <tr key={inv.id}>
                                <td className="px-4 py-3 text-sm text-gray-300">{inv.invoiceNumber}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-white">${inv.netValue.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-300">{inv.dueDate.toLocaleDateString()}</td>
                                <td className="px-4 py-3 text-sm">
                                    <Badge label={inv.status} color={badgeColor} />
                                </td>
                                <td className={`px-4 py-3 text-sm ${inv.status === InvoiceStatus.OVERDUE ? 'text-red-400' : 'text-gray-300'}`}>{age}</td>
                            </tr>
                          );
                      })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
        <div className="lg:col-span-1">
          <CreditScore customer={customer} />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
