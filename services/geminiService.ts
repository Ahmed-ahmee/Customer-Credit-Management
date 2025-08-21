import { GoogleGenAI } from "@google/genai";
import { type CustomerSummary, type InvoiceSummary, type AgeSummary, type EnrichedCustomerData, type ChatMessage } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  if (!apiKey) {
    console.error("API Key is missing for Gemini initialization.");
    ai = null;
    return;
  }
  ai = new GoogleGenAI({ apiKey });
};


const generateContent = async (prompt: string) => {
  if (!ai) {
    return "Error: Gemini AI not initialized. Please enter your API Key in the application.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        return "Authentication Error: The provided API key is not valid. Please check your key and refresh the page.";
    }
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateCreditSuggestion = async (customerData: EnrichedCustomerData): Promise<string> => {
  const { summary, invoiceSummaries, ageSummaries } = customerData;
  
  const totalOutstanding = ageSummaries.reduce((sum, item) => sum + item.outstanding, 0);
  const overdueSummaries = ageSummaries.filter(item => item.ageDays > 0 && item.outstanding > 0);
  const totalOverdue = overdueSummaries.reduce((sum, item) => sum + item.outstanding, 0);

  const prompt = `
    Analyze the creditworthiness of the following customer based on their financial data.
    Provide a concise creditability suggestion (e.g., Low Risk, Medium Risk, High Risk) and a brief justification in bullet points.

    Customer Name: ${summary.customerName}
    
    Key Metrics from Customer Summary:
    - Weighted Average Collection Period: ${summary.weightedAverageCollection.toFixed(2)} days
    - Final Weighted Days (risk indicator): ${summary.finalWeightedDays.toFixed(2)} days

    Current Aging Status:
    - Total Outstanding Balance: $${totalOutstanding.toFixed(2)}
    - Total Overdue Balance: $${totalOverdue.toFixed(2)}
    - Number of Overdue Invoices: ${overdueSummaries.length}

    Recent Invoice Performance (sample of up to 5):
    ${invoiceSummaries.slice(0, 5).map(inv => `- Invoice ${inv.invoiceNumber}: Net value $${inv.netInvoice}, Collection % ${inv.percentOfCollection}, BC Age Days ${inv.bcAgeDays}`).join('\n')}

    Based on this data, provide your analysis:
  `;

  return generateContent(prompt);
};


export const getChatResponse = async (history: ChatMessage[], customerSummaries: CustomerSummary[], invoiceSummaries: InvoiceSummary[], ageSummaries: AgeSummary[]): Promise<string> => {
    const context = `
    You are an AI assistant for a debtor management application. Use the following data to answer the user's questions. 
    If you don't have the information, say so.

    DATA:
    Customer Summaries: ${JSON.stringify(customerSummaries)}
    Invoice Summaries: ${JSON.stringify(invoiceSummaries)}
    Age Summaries: ${JSON.stringify(ageSummaries.map(a => ({...a, invoiceDate: a.invoiceDate.toISOString().split('T')[0]})))}
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


export const generateWeeklyFocus = async (customerSummaries: CustomerSummary[], ageSummaries: AgeSummary[]): Promise<string> => {
  const overdueItems = ageSummaries.filter(item => item.ageDays > 0 && item.outstanding > 0);

  if (overdueItems.length === 0) {
    return "Great news! There are no overdue invoices to focus on this week.";
  }

  const overdueData = overdueItems.map(item => {
    const customer = customerSummaries.find(c => c.customerName === item.customerName);
    return {
      customerName: item.customerName,
      finalWeightedDays: customer?.finalWeightedDays || 'N/A',
      invoiceNumber: item.invoiceNumber,
      amount: item.outstanding,
      daysOverdue: item.ageDays,
    };
  }).sort((a, b) => b.daysOverdue - a.daysOverdue);

  const prompt = `
    Act as a senior collections manager. Based on the following list of overdue items, create a prioritized "Weekly Focus Report" for the collections team for this Monday morning.
    The report should be in markdown format. 
    It should start with a brief, motivating summary.
    Then, list the top 3-5 priority customers to contact. For each customer, provide a concise summary including their name, total overdue amount, the most overdue invoice, and suggest a clear, actionable next step. Consider both the days overdue and the customer's "finalWeightedDays" as a risk indicator.

    Overdue Items Data:
    ${JSON.stringify(overdueData)}

    Generate the report:
  `;
  return generateContent(prompt);
};
