
import { type Customer, type Invoice, type Payment, InvoiceStatus } from '../types';

const today = new Date();
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

export const mockCustomers: Customer[] = [
  { id: 'cust_01', name: 'Innovate Corp', contactPerson: 'Alice Johnson', email: 'alice@innovate.com' },
  { id: 'cust_02', name: 'Quantum Solutions', contactPerson: 'Bob Williams', email: 'bob@quantum.com' },
  { id: 'cust_03', name: 'Apex Industries', contactPerson: 'Charlie Brown', email: 'charlie@apex.com' },
  { id: 'cust_04', name: 'Synergy Ltd', contactPerson: 'Diana Prince', email: 'diana@synergy.com' },
];

export const mockInvoices: Invoice[] = [
  // Innovate Corp - Good payer
  { id: 'inv_001', customerId: 'cust_01', invoiceNumber: 'INV-2024-001', value: 10000, deductions: 1000, netValue: 9000, issueDate: daysAgo(45), dueDate: daysAgo(15), status: InvoiceStatus.PAID },
  { id: 'inv_002', customerId: 'cust_01', invoiceNumber: 'INV-2024-002', value: 15000, deductions: 0, netValue: 15000, issueDate: daysAgo(20), dueDate: daysAgo(-10), status: InvoiceStatus.PENDING },

  // Quantum Solutions - Slow payer
  { id: 'inv_003', customerId: 'cust_02', invoiceNumber: 'INV-2024-003', value: 100000, deductions: 10000, netValue: 90000, issueDate: daysAgo(90), dueDate: daysAgo(60), status: InvoiceStatus.PAID },
  { id: 'inv_004', customerId: 'cust_02', invoiceNumber: 'INV-2024-004', value: 50000, deductions: 0, netValue: 50000, issueDate: daysAgo(45), dueDate: daysAgo(15), status: InvoiceStatus.OVERDUE },
  { id: 'inv_005', customerId: 'cust_02', invoiceNumber: 'INV-2024-005', value: 75000, deductions: 5000, netValue: 70000, issueDate: daysAgo(10), dueDate: daysAgo(-20), status: InvoiceStatus.PENDING },

  // Apex Industries - Very overdue
  { id: 'inv_006', customerId: 'cust_03', invoiceNumber: 'INV-2024-006', value: 1000000, deductions: 300000, netValue: 700000, issueDate: daysAgo(150), dueDate: daysAgo(120), status: InvoiceStatus.OVERDUE },
  { id: 'inv_007', customerId: 'cust_03', invoiceNumber: 'INV-2024-007', value: 250000, deductions: 0, netValue: 250000, issueDate: daysAgo(80), dueDate: daysAgo(50), status: InvoiceStatus.OVERDUE },
  
  // Synergy Ltd - All paid
  { id: 'inv_008', customerId: 'cust_04', invoiceNumber: 'INV-2024-008', value: 5000, deductions: 0, netValue: 5000, issueDate: daysAgo(60), dueDate: daysAgo(30), status: InvoiceStatus.PAID },
  { id: 'inv_009', customerId: 'cust_04', invoiceNumber: 'INV-2024-009', value: 8000, deductions: 200, netValue: 7800, issueDate: daysAgo(35), dueDate: daysAgo(5), status: InvoiceStatus.PAID },
];

export const mockPayments: Payment[] = [
  { id: 'pay_001', invoiceId: 'inv_001', amount: 9000, paymentDate: daysAgo(12) }, // Paid 3 days early
  { id: 'pay_003', invoiceId: 'inv_003', amount: 90000, paymentDate: daysAgo(20) }, // Paid 40 days late
  { id: 'pay_008', invoiceId: 'inv_008', amount: 5000, paymentDate: daysAgo(28) }, // Paid 2 days early
  { id: 'pay_009', invoiceId: 'inv_009', amount: 7800, paymentDate: daysAgo(4) }, // Paid 1 day early
];
