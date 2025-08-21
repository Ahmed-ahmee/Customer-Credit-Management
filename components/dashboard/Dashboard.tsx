import React, { useMemo } from 'react';
import { type CustomerSummary, type AgeSummary } from '../../types';
import StatCard from './StatCard';
import CustomersChart from './CustomersChart';

interface DashboardProps {
    customerSummaries: CustomerSummary[];
    ageSummaries: AgeSummary[];
    onSelectCustomer: (customerName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ customerSummaries, ageSummaries, onSelectCustomer }) => {

    const stats = useMemo(() => {
        const totalOutstanding = ageSummaries.reduce((sum, item) => sum + item.outstanding, 0);
        const overdueItems = ageSummaries.filter(item => item.ageDays > 0 && item.outstanding > 0);
        const totalOverdue = overdueItems.reduce((sum, item) => sum + item.outstanding, 0);
        
        const avgCollectionDays = customerSummaries.length > 0
            ? customerSummaries.reduce((sum, cust) => sum + cust.weightedAverageCollection, 0) / customerSummaries.length
            : 0;

        return { totalOutstanding, totalOverdue, avgCollectionDays, overdueCount: overdueItems.length };
    }, [customerSummaries, ageSummaries]);

    const highPriorityInvoices = useMemo(() => {
        return ageSummaries
            .filter(item => item.ageDays > 0 && item.outstanding > 0)
            .sort((a, b) => b.ageDays - a.ageDays)
            .slice(0, 5);
    }, [ageSummaries]);


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
                    <CustomersChart ageSummaries={ageSummaries} />
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-white">High-Priority Invoices</h2>
                    <ul className="space-y-4">
                        {highPriorityInvoices.map(inv => (
                            <li key={inv.invoiceNumber} onClick={() => onSelectCustomer(inv.customerName)} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                <div>
                                    <p className="font-semibold text-white">{inv.customerName}</p>
                                    <p className="text-sm text-gray-400">Inv #{inv.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-400">${inv.outstanding.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{inv.ageDays} days overdue</p>
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