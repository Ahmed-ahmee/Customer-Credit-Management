
import React, { useMemo } from 'react';
import { type Customer, type Invoice, InvoiceStatus } from '../../types';
import Badge from '../shared/Badge';

interface CustomerListProps {
  customers: Customer[];
  invoices: Invoice[];
  onSelectCustomer: (customerId: string) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, invoices, onSelectCustomer }) => {
  const customerData = useMemo(() => {
    return customers.map(customer => {
      const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
      const outstanding = customerInvoices
        .filter(inv => inv.status !== InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.netValue, 0);
      
      const overdueCount = customerInvoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length;
      
      let risk = 'Low';
      if (overdueCount > 0 && outstanding > 50000) {
        risk = 'High';
      } else if (overdueCount > 0 || outstanding > 10000) {
        risk = 'Medium';
      }

      return {
        ...customer,
        outstanding,
        overdueCount,
        risk,
      };
    }).sort((a,b) => b.outstanding - a.outstanding);
  }, [customers, invoices]);

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
              <tr key={customer.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{customer.name}</div>
                  <div className="text-sm text-gray-400">{customer.email}</div>
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
                  <button onClick={() => onSelectCustomer(customer.id)} className="text-blue-400 hover:text-blue-300">
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
