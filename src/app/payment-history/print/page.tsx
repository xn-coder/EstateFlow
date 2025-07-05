
'use client';

import * as React from 'react';
import { paymentHistory } from '@/lib/data';
import type { PaymentHistory } from '@/types';

export default function PrintPaymentHistoryPage() {
  React.useEffect(() => {
    // A timeout ensures the content is rendered before the print dialog appears.
    const timer = setTimeout(() => {
      window.print();
      window.onafterprint = () => window.close();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-10 font-sans">
      <style>
        {`
          @page {
            size: A4;
            margin: 1in;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            text-align: left;
          }
          thead {
            background-color: #f8fafc;
          }
          th {
            font-weight: 600;
          }
        `}
      </style>
      <h1 className="text-2xl font-bold mb-6">View Payment History and Statement</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {paymentHistory.map((item: PaymentHistory) => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.transactionId}</td>
              <td>{item.amount}</td>
              <td>{item.paymentMethod}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
