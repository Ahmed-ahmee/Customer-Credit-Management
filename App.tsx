import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerDetail from './components/customers/CustomerDetail';
import WeeklyFocus from './components/tasks/WeeklyFocus';
import ChatAssistant from './components/assistant/ChatAssistant';
import DataHub from './components/data/DataHub';
import { type Customer, type Invoice, type Payment, Page } from './types';

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>(Page.DATA_HUB);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleDataUpload = (data: { customers: Customer[]; invoices: Invoice[]; payments: Payment[] }) => {
    setCustomers(data.customers);
    setInvoices(data.invoices);
    setPayments(data.payments);
    setIsDataLoaded(true);
    setCurrentPage(Page.DASHBOARD);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentPage(Page.CUSTOMER_DETAIL);
  };

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId || !isDataLoaded) return null;
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return null;

    const customerInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId);
    const invoiceIds = customerInvoices.map(inv => inv.id);
    const customerPayments = payments.filter(p => invoiceIds.includes(p.invoiceId));

    return { ...customer, invoices: customerInvoices, payments: customerPayments };
  }, [selectedCustomerId, customers, invoices, payments, isDataLoaded]);

  const renderContent = () => {
    switch (currentPage) {
      case Page.DATA_HUB:
        return <DataHub onDataUpload={handleDataUpload} />;
      case Page.DASHBOARD:
        return <Dashboard customers={customers} invoices={invoices} onSelectCustomer={handleSelectCustomer} />;
      case Page.CUSTOMERS:
        return <CustomerList customers={customers} invoices={invoices} onSelectCustomer={handleSelectCustomer} />;
      case Page.CUSTOMER_DETAIL:
        return selectedCustomer ? <CustomerDetail customer={selectedCustomer} /> : <CustomerList customers={customers} invoices={invoices} onSelectCustomer={handleSelectCustomer} />;
      case Page.WEEKLY_FOCUS:
        return <WeeklyFocus customers={customers} invoices={invoices} />;
      case Page.AI_ASSISTANT:
        return <ChatAssistant customers={customers} invoices={invoices} />;
      default:
        // Redirect to Data Hub if data isn't loaded
        return isDataLoaded ? <Dashboard customers={customers} invoices={invoices} onSelectCustomer={handleSelectCustomer} /> : <DataHub onDataUpload={handleDataUpload} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isDataLoaded={isDataLoaded} />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-800/50">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;