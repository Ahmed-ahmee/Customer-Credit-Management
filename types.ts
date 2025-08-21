export enum Page {
  DASHBOARD = 'DASHBOARD',
  CUSTOMERS = 'CUSTOMERS',
  CUSTOMER_DETAIL = 'CUSTOMER_DETAIL',
  WEEKLY_FOCUS = 'WEEKLY_FOCUS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  DATA_HUB = 'DATA_HUB'
}

export enum InvoiceStatus {
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  PENDING = 'Pending'
}

export interface Invoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  value: number;
  deductions: number;
  netValue: number;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
}

export interface EnrichedCustomer extends Customer {
  invoices: Invoice[];
  payments: Payment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}