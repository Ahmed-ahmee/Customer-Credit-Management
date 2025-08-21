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

// Types for mock data, to fix compilation errors
export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
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

// Data model based on user's CSV files
export interface CustomerSummary {
  customerName: string; // From 'Customer'
  weightedAverageCollection: number; // From 'W.average collection'
  weightedBcDueDays: number; // From 'W.bc due days'
  finalWeightedDays: number; // From 'Final wighted Days'
}

export interface InvoiceSummary {
  customerName: string; // From 'Customer'
  invoiceNumber: string; // From 'Invoice Number'
  invoiceValue: number; // From 'Invoice_Value'
  deductions: number; // From 'Deductions'
  netInvoice: number; // From 'Net_invoice'
  ipValue: number; // From 'Ip_Value'
  bcDue: number; // From 'Bc_due'
  wAverageReceiptDays: number; // From 'W.average receipt days for receipt collection'
  percentOfCollection: number; // From '% of collection'
  averageReceiptDays100: number; // From 'average receipt days for 100%'
  bcAgeDays: number; // From 'bc age days'
  bcPercent: number; // From 'Bc %'
}

export interface AgeSummary {
  customerName: string; // From 'Customer'
  invoiceNumber: string; // From 'invoce number'
  invoiceDate: Date; // From 'invoice date'
  outstanding: number; // From 'outstanding'
  ageDays: number; // From 'age days'
}

// For Customer Detail page
export interface EnrichedCustomerData {
  summary: CustomerSummary;
  invoiceSummaries: InvoiceSummary[];
  ageSummaries: AgeSummary[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}