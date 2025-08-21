import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { type CustomerSummary, type InvoiceSummary, type AgeSummary } from '../../types';

interface DataHubProps {
  onDataUpload: (data: { customerSummaries: CustomerSummary[]; invoiceSummaries: InvoiceSummary[]; ageSummaries: AgeSummary[] }) => void;
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

const headerMapping: { [key: string]: string } = {
  'Customer': 'customerName',
  'W.average collection': 'weightedAverageCollection',
  'W.bc due days': 'weightedBcDueDays',
  'Final wighted Days': 'finalWeightedDays',
  'Invoice Number': 'invoiceNumber',
  'Invoice_Value': 'invoiceValue',
  'Deductions': 'deductions',
  'Net_invoice': 'netInvoice',
  'Ip_Value': 'ipValue',
  'Bc_due': 'bcDue',
  'W.average receipt days for receipt collection': 'wAverageReceiptDays',
  '% of collection': 'percentOfCollection',
  'average receipt days for 100%': 'averageReceiptDays100',
  'bc age days': 'bcAgeDays',
  'Bc %': 'bcPercent',
  'invoce number': 'invoiceNumber', // Typo handling
  'invoice number': 'invoiceNumber',
  'invoice date': 'invoiceDate',
  'outstanding': 'outstanding',
  'age days': 'ageDays',
};
const transformHeader = (header: string) => headerMapping[header.trim()] || header.trim();


const DataHub: React.FC<DataHubProps> = ({ onDataUpload }) => {
  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [ageFile, setAgeFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const downloadCustomerTemplate = createCSVDownloader(['Customer', 'W.average collection', 'W.bc due days', 'Final wighted Days'], 'customer_summary_template.csv');
  const downloadInvoiceTemplate = createCSVDownloader(['Customer', 'Invoice Number', 'Invoice_Value', 'Deductions', 'Net_invoice', 'Ip_Value', 'Bc_due', 'W.average receipt days for receipt collection', '% of collection', 'average receipt days for 100%', 'bc age days', 'Bc %'], 'invoice_summary_template.csv');
  const downloadAgeTemplate = createCSVDownloader(['Customer', 'invoce number', 'invoice date', 'outstanding', 'age days'], 'age_summary_template.csv');

  const parseFile = <T,>(file: File): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader,
        dynamicTyping: true,
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
    if (!customerFile || !invoiceFile || !ageFile) {
      setErrors(['Please upload all three required files.']);
      return;
    }
    setIsLoading(true);
    setErrors([]);

    try {
      const [rawCustomers, rawInvoices, rawAges] = await Promise.all([
        parseFile<any>(customerFile),
        parseFile<any>(invoiceFile),
        parseFile<any>(ageFile),
      ]);

      const customerSummaries: CustomerSummary[] = rawCustomers.map((row, i) => {
        if (!row.customerName) throw new Error(`Customer Summary row ${i + 2}: Missing required 'Customer' name.`);
        return {
          customerName: row.customerName,
          weightedAverageCollection: Number(row.weightedAverageCollection) || 0,
          weightedBcDueDays: Number(row.weightedBcDueDays) || 0,
          finalWeightedDays: Number(row.finalWeightedDays) || 0,
        };
      });
      const customerNames = new Set(customerSummaries.map(c => c.customerName));

      const invoiceSummaries: InvoiceSummary[] = rawInvoices.map((row, i) => {
        if (!row.customerName || !row.invoiceNumber) throw new Error(`Invoice Summary row ${i + 2}: Missing 'Customer' or 'Invoice Number'.`);
        if (!customerNames.has(row.customerName)) throw new Error(`Invoice Summary row ${i + 2}: Customer "${row.customerName}" does not exist in the Customer Summary file.`);
        return {
            customerName: row.customerName,
            invoiceNumber: String(row.invoiceNumber),
            invoiceValue: Number(row.invoiceValue) || 0,
            deductions: Number(row.deductions) || 0,
            netInvoice: Number(row.netInvoice) || 0,
            ipValue: Number(row.ipValue) || 0,
            bcDue: Number(row.bcDue) || 0,
            wAverageReceiptDays: Number(row.wAverageReceiptDays) || 0,
            percentOfCollection: Number(row.percentOfCollection) || 0,
            averageReceiptDays100: Number(row.averageReceiptDays100) || 0,
            bcAgeDays: Number(row.bcAgeDays) || 0,
            bcPercent: Number(row.bcPercent) || 0,
        }
      });
      const invoiceKeys = new Set(invoiceSummaries.map(i => `${i.customerName}|${i.invoiceNumber}`));

      const ageSummaries: AgeSummary[] = rawAges.map((row, i) => {
        if (!row.customerName || !row.invoiceNumber || !row.invoiceDate) throw new Error(`Age Summary row ${i + 2}: Missing 'Customer', 'invoce number', or 'invoice date'.`);
        if (!customerNames.has(row.customerName)) throw new Error(`Age Summary row ${i + 2}: Customer "${row.customerName}" does not exist in the Customer Summary file.`);
        const invoiceKey = `${row.customerName}|${String(row.invoiceNumber)}`;
        if (!invoiceKeys.has(invoiceKey)) throw new Error(`Age Summary row ${i + 2}: Invoice "${row.invoiceNumber}" for customer "${row.customerName}" does not exist in the Invoice Summary file.`);
        return {
            customerName: row.customerName,
            invoiceNumber: String(row.invoiceNumber),
            invoiceDate: new Date(row.invoiceDate),
            outstanding: Number(row.outstanding) || 0,
            ageDays: Number(row.ageDays) || 0,
        }
      });

      onDataUpload({ customerSummaries, invoiceSummaries, ageSummaries });

    } catch (e: any) {
      setErrors([e.message]);
    } finally {
      setIsLoading(false);
    }
  }, [customerFile, invoiceFile, ageFile, onDataUpload]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-white">Data Hub</h1>
        <p className="text-gray-400 mt-2">Upload your data to power the application. Please use the provided templates to ensure compatibility.</p>
      </div>
      
      <div className="space-y-6">
        <FileUploader title="1. Customer Summary" description="W.average collection, W.bc due days, etc." file={customerFile} onFileChange={setCustomerFile} onDownloadTemplate={downloadCustomerTemplate} />
        <FileUploader title="2. Invoice Summary" description="Invoice_Value, Deductions, Net_invoice, etc." file={invoiceFile} onFileChange={setInvoiceFile} onDownloadTemplate={downloadInvoiceTemplate} />
        <FileUploader title="3. Age Summary" description="Outstanding, age days, invoice date (YYYY-MM-DD)." file={ageFile} onFileChange={setAgeFile} onDownloadTemplate={downloadAgeTemplate} />
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
          disabled={!customerFile || !invoiceFile || !ageFile || isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          {isLoading ? 'Processing...' : 'Load and Analyze Data'}
        </button>
      </div>
    </div>
  );
};

export default DataHub;