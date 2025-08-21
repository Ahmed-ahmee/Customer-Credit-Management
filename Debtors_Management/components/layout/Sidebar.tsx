
import React from 'react';
import { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 1.002m-3-1.002A4.008 4.008 0 0012 15a4.008 4.008 0 00-3-1.998m0 0A5.975 5.975 0 013 15a5.975 5.975 0 013-1.002m0 0V9a3 3 0 013-3m0 0v3m0-3a3 3 0 116 0v3m-6 0a3 3 0 00-3 3v3" /></svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 4.293m2 7.414a1 1 0 01-1.414-1.414L12 8.586l2.293 2.293a1 1 0 01-1.414 1.414L12 11.414m-5 8a1 1 0 011.414 1.414L10 19.707l-2.293 2.293a1 1 0 01-1.414-1.414L7 19.707m12-5.414a1 1 0 01-1.414 1.414L16 12.586l2.293 2.293a1 1 0 01-1.414 1.414L15 13.414m-4 8a1 1 0 011.414 1.414L14 19.707l-2.293 2.293a1 1 0 01-1.414-1.414L12 19.707" /></svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}> = ({ icon, label, page, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  return (
    <li
      onClick={() => setCurrentPage(page)}
      className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700/50 p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <div className="bg-blue-500 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-2m0 2v.01m0-2.01V16m0-2.01V14m0-2v-1m-3.599-1.401A2 2 0 0112 14m0 0c1.657 0 3-.895 3-2s-1.343-2-3-2m0 0-2.599-1M12 12V7m-3 5h6M4.5 12H3m1.5 0H6m13.5 0h-1.5m1.5 0H18m0 0h1.5m-16.5 0a9 9 0 1118 0 9 9 0 01-18 0z"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white ml-3">Debtor AI</h1>
      </div>
      <nav>
        <ul>
          <NavItem icon={<ChartBarIcon />} label="Dashboard" page={Page.DASHBOARD} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavItem icon={<UsersIcon />} label="Customers" page={Page.CUSTOMERS} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavItem icon={<CalendarIcon />} label="Weekly Focus" page={Page.WEEKLY_FOCUS} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <NavItem icon={<SparklesIcon />} label="AI Assistant" page={Page.AI_ASSISTANT} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </ul>
      </nav>
      <div className="mt-auto p-4 bg-gray-800 rounded-lg text-center">
        <h3 className="font-semibold text-white">Need Help?</h3>
        <p className="text-sm text-gray-400 mt-1">
            Our AI Assistant is here to answer your questions.
        </p>
        <button 
            onClick={() => setCurrentPage(Page.AI_ASSISTANT)}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Ask AI
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
