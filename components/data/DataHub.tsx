import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { type Customer, type Invoice, type Payment, InvoiceStatus } from '../../types';

interface DataHubProps {
  onDataUpload: (data: { customers: Customer[]; invoices: Invoice[]; payments: Payment[] }) => void;
}

const createCSVDownloader = (headers: string[], filename: string) => () => {
  const csvContent = "data:text/csv;charset=utf-8," + headers.join(',');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const FileUploader: React.FC<{
    title: string;
    description: string;
    file: File | null;
    onFileChange: (file: File | null) => void;
    onDownloadTemplate: () => void;
}> = ({ title, description, file, onFileChange, onDownloadTemplate }) => (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all hover:border-blue-500">
      <div className="flex justify-between items-start">
          <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
          {file && (
              <div className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>File selected</span>
              </div>
          )}
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
        <button onClick={onDownloadTemplate} className="w-full sm:w-auto text-center px-4 py-2 text-sm font-semibold text-blue-300 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
          Download Template
        </button>
        <label className="w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
          {file ? 'Change File' : 'Choose File'}
          <input type="file" accept=".csv" onChange={e => onFileChange(e.target.files ? e.target.files[0] : null)} className="hidden"/>
        </label>
        {file && <span className="text-gray-400 text-sm truncate pt-1 sm:pt-0">{file.name}</span>}
      </div>
    </div>
);

const DataHub: React.FC<DataHubProps> = ({ onDataUpload }) => {
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const downloadCustomerTemplate = createCSVDownloader(['id', 'name', 'contactPerson', 'email'], 'customers_template.csv');
  const downloadInvoiceTemplate = createCSVDownloader(['id', 'customerId', 'invoiceNumber', 'value', 'deductions', 'issueDate', 'dueDate', 'status'], 'invoices_template.csv');
  const downloadPaymentTemplate = createCSVDownloader(['id', 'invoiceId', 'amount', 'paymentDate'], 'payments_template.csv');

  const parseFile = <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            reject(new Error(`Error in ${file.name}: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data as T[]);
          }
        },
        error: (error: Error) => reject(new Error(`Failed to parse ${file.name}: ${error.message}`)),
      });
    });
  };

  const handleProcessData = useCallback(async () => {
    if (!customerFile || !invoiceFile || !paymentFile) {
      setErrors(['Please upload all three required files.']);
      return;
    }
    setIsLoading(true);
    setErrors([]);

    try {
      const [rawCustomers, rawInvoices, rawPayments] = await Promise.all([
        parseFile<any>(customerFile),
        parseFile<any>(invoiceFile),
        parseFile<any>(paymentFile),
      ]);

      const customers: Customer[] = rawCustomers.map((row, i) => {
        if (!row.id || !row.name) throw new Error(`Customer row ${i + 2}: Missing required 'id' or 'name'.`);
        return { id: row.id, name: row.name, contactPerson: row.contactPerson || '', email: row.email || '' };
      });
      const customerIds = new Set(customers.map(c => c.id));

      const invoices: Invoice[] = rawInvoices.map((row, i) => {
        if (!row.id || !row.customerId || !row.invoiceNumber || !row.issueDate || !row.dueDate) throw new Error(`Invoice row ${i + 2}: Missing required fields (id, customerId, invoiceNumber, issueDate, dueDate).`);
        if (!customerIds.has(row.customerId)) throw new Error(`Invoice row ${i + 2}: customerId "${row.customerId}" does not exist in customers file.`);
        const status = row.status as InvoiceStatus;
        if (!Object.values(InvoiceStatus).includes(status)) throw new Error(`Invoice row ${i + 2}: Invalid status "${row.status}". Must be 'Paid', 'Overdue', or 'Pending'.`);
        const value = parseFloat(row.value) || 0;
        const deductions = parseFloat(row.deductions) || 0;
        return { id: row.id, customerId: row.customerId, invoiceNumber: row.invoiceNumber, value, deductions, netValue: value - deductions, issueDate: new Date(row.issueDate), dueDate: new Date(row.dueDate), status };
      });
      const invoiceIds = new Set(invoices.map(i => i.id));

      const payments: Payment[] = rawPayments.map((row, i) => {
        if (!row.id || !row.invoiceId || !row.paymentDate) throw new Error(`Payment row ${i + 2}: Missing required fields (id, invoiceId, paymentDate).`);
        if (!invoiceIds.has(row.invoiceId)) throw new Error(`Payment row ${i + 2}: invoiceId "${row.invoiceId}" does not exist in invoices file.`);
        return { id: row.id, invoiceId: row.invoiceId, amount: parseFloat(row.amount) || 0, paymentDate: new Date(row.paymentDate) };
      });

      onDataUpload({ customers, invoices, payments });

    } catch (e: any) {
      setErrors([e.message]);
    } finally {
      setIsLoading(false);
    }
  }, [customerFile, invoiceFile, paymentFile, onDataUpload]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white">Data Hub</h1>
        <p className="text-gray-400 mt-2">Upload your data to power the application. Please use the provided templates to ensure compatibility.</p>
      </div>
      
      <div className="space-y-6">
        <FileUploader title="1. Customer Data" description="Upload a CSV file with your customer details." file={customerFile} onFileChange={setCustomerFile} onDownloadTemplate={downloadCustomerTemplate} />
        <FileUploader title="2. Invoice Data" description="Upload a CSV with invoice records. Dates must be YYYY-MM-DD format." file={invoiceFile} onFileChange={setInvoiceFile} onDownloadTemplate={downloadInvoiceTemplate} />
        <FileUploader title="3. Payment Data" description="Upload a CSV with payment records. Dates must be YYYY-MM-DD format." file={paymentFile} onFileChange={setPaymentFile} onDownloadTemplate={downloadPaymentTemplate} />
      </div>

      <div className="pt-4">
        {errors.length > 0 && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg mb-4 text-sm">
            <h3 className="font-bold mb-2">Please correct the following errors:</h3>
            <ul className="list-disc list-inside space-y-1">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <button
          onClick={handleProcessData}
          disabled={!customerFile || !invoiceFile || !paymentFile || isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {isLoading ? 'Processing...' : 'Load and Analyze Data'}
        </button>
      </div>
    </div>
  );
};

export default DataHub;