import React, { useMemo } from 'react';
import { type CustomerSummary, type AgeSummary } from '../../types';
import Badge from '../shared/Badge';

interface CustomerListProps {
  customerSummaries: CustomerSummary[];
  ageSummaries: AgeSummary[];
  onSelectCustomer: (customerName: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customerSummaries, ageSummaries, onSelectCustomer }) => {
  const customerData = useMemo(() => {
    return customerSummaries.map(customer => {
      const customerAgeItems = ageSummaries.filter(item => item.customerName === customer.customerName);
      
      const outstanding = customerAgeItems.reduce((sum, item) => sum + item.outstanding, 0);
      
      const overdueCount = customerAgeItems.filter(item => item.ageDays > 0 && item.outstanding > 0).length;
      
      let risk = 'Low';
      if (customer.finalWeightedDays > 60 || (overdueCount > 2 && outstanding > 50000)) {
          risk = 'High';
      } else if (customer.finalWeightedDays > 30 || overdueCount > 0) {
          risk = 'Medium';
      }

      return {
        ...customer,
        outstanding,
        overdueCount,
        risk,
      };
    }).sort((a,b) => b.outstanding - a.outstanding);
  }, [customerSummaries, ageSummaries]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-white">Customers</h1>
      <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700/50">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Outstanding Balance</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Overdue Invoices</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risk Level</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {customerData.map((customer) => (
              <tr key={customer.customerName} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{customer.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-300">${customer.outstanding.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.overdueCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    label={customer.risk} 
                    color={customer.risk === 'High' ? 'red' : customer.risk === 'Medium' ? 'yellow' : 'green'} 
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onSelectCustomer(customer.customerName)} className="text-blue-400 hover:text-blue-300">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;