
import { GoogleGenAI, Type } from "@google/genai";
import { type Customer, type Invoice, type EnrichedCustomer, type ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateContent = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateCreditSuggestion = async (customer: EnrichedCustomer): Promise<string> => {
  const today = new Date();
  const outstandingInvoices = customer.invoices.filter(inv => inv.status !== 'Paid');
  const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.netValue, 0);
  const overdueInvoices = outstandingInvoices.filter(inv => inv.dueDate < today);
  const avgPaymentDays = customer.invoices
    .filter(inv => inv.status === 'Paid')
    .map(inv => {
      const payment = customer.payments.find(p => p.invoiceId === inv.id);
      if (payment) {
        const diffTime = Math.abs(payment.paymentDate.getTime() - inv.issueDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return 0;
    })
    .reduce((acc, days, index, arr) => acc + days / arr.length, 0);

  const prompt = `
    Analyze the creditworthiness of the following customer based on their financial data.
    Provide a concise creditability suggestion (e.g., Low Risk, Medium Risk, High Risk) and a brief justification in bullet points.

    Customer Name: ${customer.name}
    Total Invoices: ${customer.invoices.length}
    Total Outstanding Balance: $${totalOutstanding.toFixed(2)}
    Number of Overdue Invoices: ${overdueInvoices.length}
    Average Payment Time (for paid invoices): ${avgPaymentDays.toFixed(0)} days

    Analysis:
  `;

  return generateContent(prompt);
};


export const getChatResponse = async (history: ChatMessage[], customers: Customer[], invoices: Invoice[]): Promise<string> => {
    const context = `
    You are an AI assistant for a debtor management application. Use the following data to answer the user's questions. 
    If you don't have the information, say so.

    DATA:
    Customers: ${JSON.stringify(customers.map(c => ({id: c.id, name: c.name})))}
    Invoices: ${JSON.stringify(invoices.map(i => ({...i, issueDate: i.issueDate.toISOString().split('T')[0], dueDate: i.dueDate.toISOString().split('T')[0]})))}
    ---
    Current Date: ${new Date().toISOString().split('T')[0]}
    ---
    Chat History:
    ${history.map(msg => `${msg.role}: ${msg.text}`).join('\n')}
    ---
    User's latest question: ${history[history.length - 1].text}

    Your Answer:
    `;

    return generateContent(context);
};


export const generateWeeklyFocus = async (customers: Customer[], invoices: Invoice[]): Promise<string> => {
  const today = new Date();
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue' && inv.dueDate < today);

  if (overdueInvoices.length === 0) {
    return "Great news! There are no overdue invoices to focus on this week.";
  }

  const overdueData = overdueInvoices.map(inv => {
    const customer = customers.find(c => c.id === inv.customerId);
    const daysOverdue = Math.floor((today.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return {
      customerName: customer?.name || 'Unknown',
      customerEmail: customer?.email || 'N/A',
      invoiceNumber: inv.invoiceNumber,
      amount: inv.netValue,
      daysOverdue: daysOverdue,
    };
  }).sort((a, b) => b.daysOverdue - a.daysOverdue);

  const prompt = `
    Act as a senior collections manager. Based on the following list of overdue invoices, create a prioritized "Weekly Focus Report" for the collections team for this Monday morning.
    The report should be in markdown format. 
    It should start with a brief, motivating summary.
    Then, list the top 3-5 priority customers to contact. For each customer, provide a concise summary including their name, total overdue amount, the most overdue invoice, and suggest a clear, actionable next step.

    Overdue Invoices Data:
    ${JSON.stringify(overdueData)}

    Generate the report:
  `;
  return generateContent(prompt);
};
