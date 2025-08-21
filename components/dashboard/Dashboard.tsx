
import React, { useMemo } from 'react';
import { type Customer, type Invoice } from '../../types';
import StatCard from './StatCard';
import CustomersChart from './CustomersChart';
import { InvoiceStatus } from '../../types';

interface DashboardProps {
    customers: Customer[];
    invoices: Invoice[];
    onSelectCustomer: (customerId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ customers, invoices, onSelectCustomer }) => {
    const today = new Date();

    const stats = useMemo(() => {
        const outstandingInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE);
        const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.netValue, 0);

        const overdueInvoices = invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE);
        const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.netValue, 0);
        
        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
        const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.netValue, 0);
        
        const avgCollectionDays = paidInvoices.length > 0 ? paidInvoices.reduce((sum, inv) => {
            const diffTime = Math.abs(inv.dueDate.getTime() - inv.issueDate.getTime());
            return sum + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length : 0;

        return { totalOutstanding, totalOverdue, totalCollected, avgCollectionDays, overdueCount: overdueInvoices.length };
    }, [invoices]);

    const recentOverdueInvoices = useMemo(() => {
        return invoices
            .filter(inv => inv.status === InvoiceStatus.OVERDUE)
            .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
            .slice(0, 5);
    }, [invoices]);

    const getCustomerName = (customerId: string) => {
        return customers.find(c => c.id === customerId)?.name || 'Unknown';
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Outstanding" value={`$${stats.totalOutstanding.toLocaleString()}`} change="+5.4%"/>
                <StatCard title="Total Overdue" value={`$${stats.totalOverdue.toLocaleString()}`} change="+12.1%" isNegative />
                <StatCard title="Overdue Invoices" value={stats.overdueCount.toString()} change="+3" isNegative/>
                <StatCard title="Avg. Collection Time" value={`${stats.avgCollectionDays.toFixed(1)} Days`} change="-2.5%"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">Outstanding Balances by Customer</h2>
                    <CustomersChart customers={customers} invoices={invoices} />
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">High-Priority Invoices</h2>
                    <ul className="space-y-4">
                        {recentOverdueInvoices.map(inv => (
                            <li key={inv.id} onClick={() => onSelectCustomer(inv.customerId)} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                <div>
                                    <p className="font-semibold text-white">{getCustomerName(inv.customerId)}</p>
                                    <p className="text-sm text-gray-400">Inv #{inv.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-400">${inv.netValue.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{Math.floor((today.getTime() - inv.dueDate.getTime())/(1000*60*60*24))} days overdue</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
