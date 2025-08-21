
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type Customer, type Invoice, InvoiceStatus } from '../../types';

interface CustomersChartProps {
    customers: Customer[];
    invoices: Invoice[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="font-bold text-white">{label}</p>
          <p className="text-blue-400">{`Outstanding: $${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
  
    return null;
  };

const CustomersChart: React.FC<CustomersChartProps> = ({ customers, invoices }) => {
    const chartData = useMemo(() => {
        return customers.map(customer => {
            const outstandingAmount = invoices
                .filter(inv => inv.customerId === customer.id && (inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE))
                .reduce((sum, inv) => sum + inv.netValue, 0);
            return {
                name: customer.name,
                outstanding: outstandingAmount
            };
        }).filter(d => d.outstanding > 0)
          .sort((a,b) => b.outstanding - a.outstanding);
    }, [customers, invoices]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                    <XAxis dataKey="name" stroke="#a0aec0" tick={{ fill: '#a0aec0' }} />
                    <YAxis stroke="#a0aec0" tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tick={{ fill: '#a0aec0' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}/>
                    <Bar dataKey="outstanding" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomersChart;
