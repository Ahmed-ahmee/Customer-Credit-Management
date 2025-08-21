import React, { useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import CustomerList from './components/customers/CustomerList';
import CustomerDetail from './components/customers/CustomerDetail';
import WeeklyFocus from './components/tasks/WeeklyFocus';
import ChatAssistant from './components/assistant/ChatAssistant';
import DataHub from './components/data/DataHub';
import { type CustomerSummary, type InvoiceSummary, type AgeSummary, Page, type EnrichedCustomerData } from './types';

const App: React.FC = () => {
  const [customerSummaries, setCustomerSummaries] = useState<CustomerSummary[]>([]);
  const [invoiceSummaries, setInvoiceSummaries] = useState<InvoiceSummary[]>([]);
  const [ageSummaries, setAgeSummaries] = useState<AgeSummary[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState<Page>(Page.DATA_HUB);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  const handleDataUpload = (data: { customerSummaries: CustomerSummary[]; invoiceSummaries: InvoiceSummary[]; ageSummaries: AgeSummary[] }) => {
    setCustomerSummaries(data.customerSummaries);
    setInvoiceSummaries(data.invoiceSummaries);
    setAgeSummaries(data.ageSummaries);
    setIsDataLoaded(true);
    setCurrentPage(Page.DASHBOARD);
  };

  const handleSelectCustomer = (customerName: string) => {
    setSelectedCustomerName(customerName);
    setCurrentPage(Page.CUSTOMER_DETAIL);
  };

  const selectedCustomerData = useMemo((): EnrichedCustomerData | null => {
    if (!selectedCustomerName || !isDataLoaded) return null;
    const summary = customerSummaries.find(c => c.customerName === selectedCustomerName);
    if (!summary) return null;

    return {
      summary,
      invoiceSummaries: invoiceSummaries.filter(inv => inv.customerName === selectedCustomerName),
      ageSummaries: ageSummaries.filter(age => age.customerName === selectedCustomerName),
    };
  }, [selectedCustomerName, customerSummaries, invoiceSummaries, ageSummaries, isDataLoaded]);

  const renderContent = () => {
    switch (currentPage) {
      case Page.DATA_HUB:
        return <DataHub onDataUpload={handleDataUpload} />;
      case Page.DASHBOARD:
        return <Dashboard customerSummaries={customerSummaries} ageSummaries={ageSummaries} onSelectCustomer={handleSelectCustomer} />;
      case Page.CUSTOMERS:
        return <CustomerList customerSummaries={customerSummaries} ageSummaries={ageSummaries} onSelectCustomer={handleSelectCustomer} />;
      case Page.CUSTOMER_DETAIL:
        return selectedCustomerData ? <CustomerDetail customerData={selectedCustomerData} /> : <CustomerList customerSummaries={customerSummaries} ageSummaries={ageSummaries} onSelectCustomer={handleSelectCustomer} />;
      case Page.WEEKLY_FOCUS:
        return <WeeklyFocus customerSummaries={customerSummaries} ageSummaries={ageSummaries} />;
      case Page.AI_ASSISTANT:
        return <ChatAssistant customerSummaries={customerSummaries} invoiceSummaries={invoiceSummaries} ageSummaries={ageSummaries} />;
      default:
        return isDataLoaded ? <Dashboard customerSummaries={customerSummaries} ageSummaries={ageSummaries} onSelectCustomer={handleSelectCustomer} /> : <DataHub onDataUpload={handleDataUpload} />;
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