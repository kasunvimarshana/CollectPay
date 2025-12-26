import { Collection } from '../api/collection';
import { Payment } from '../api/payment';
import { Supplier } from '../api/supplier';
import { formatDate, formatAmount } from './formatters';

/**
 * PrintTemplates - Generate HTML templates for printing
 * Various report types for collections, payments, and suppliers
 */

/**
 * Generate a print template for a single collection receipt
 */
export const generateCollectionReceipt = (collection: Collection): string => {
  const supplierName = collection.supplier?.name || 'Unknown Supplier';
  const productName = collection.product?.name || 'Unknown Product';
  const collectorName = collection.user?.name || 'System';
  const appliedRate = collection.rate_applied || 0;

  return `
    <div class="header">
      <h1>TrackVault - Collection Receipt</h1>
      <p>Data Collection Management System</p>
    </div>
    
    <div class="section">
      <div class="section-title">Collection Details</div>
      <div class="info-row">
        <span class="info-label">Receipt No:</span>
        <span class="info-value">#COL-${collection.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Collection Date:</span>
        <span class="info-value">${formatDate(collection.collection_date)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Recorded On:</span>
        <span class="info-value">${formatDate(collection.created_at)}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Supplier Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${supplierName}</span>
      </div>
      ${collection.supplier?.code ? `
        <div class="info-row">
          <span class="info-label">Code:</span>
          <span class="info-value">${collection.supplier.code}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="section">
      <div class="section-title">Product Information</div>
      <div class="info-row">
        <span class="info-label">Product:</span>
        <span class="info-value">${productName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Quantity:</span>
        <span class="info-value">${collection.quantity} ${collection.unit}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Applied Rate:</span>
        <span class="info-value">${formatAmount(appliedRate)} per ${collection.unit}</span>
      </div>
    </div>
    
    <div class="summary-box">
      <div class="summary-item">
        <span>Total Amount:</span>
        <span class="positive">${formatAmount(collection.total_amount)}</span>
      </div>
    </div>
    
    ${collection.notes ? `
      <div class="section">
        <div class="section-title">Notes</div>
        <p>${collection.notes}</p>
      </div>
    ` : ''}
    
    <div class="section">
      <div class="info-row">
        <span class="info-label">Recorded By:</span>
        <span class="info-value">${collectorName}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated receipt</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};

/**
 * Generate a print template for collections list/report
 */
export const generateCollectionsReport = (
  collections: Collection[],
  filters?: { startDate?: string; endDate?: string; supplierName?: string; productName?: string }
): string => {
  const totalAmount = collections.reduce((sum, col) => sum + (col.total_amount || 0), 0);
  const totalQuantity = collections.reduce((sum, col) => sum + (col.quantity || 0), 0);
  
  let filterInfo = '';
  if (filters) {
    filterInfo = '<div class="section"><div class="section-title">Filter Criteria</div>';
    if (filters.startDate && filters.endDate) {
      filterInfo += `<p>Date Range: ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}</p>`;
    }
    if (filters.supplierName) {
      filterInfo += `<p>Supplier: ${filters.supplierName}</p>`;
    }
    if (filters.productName) {
      filterInfo += `<p>Product: ${filters.productName}</p>`;
    }
    filterInfo += '</div>';
  }

  const rows = collections.map(col => `
    <tr>
      <td>${formatDate(col.collection_date)}</td>
      <td>${col.supplier?.name || 'N/A'}</td>
      <td>${col.product?.name || 'N/A'}</td>
      <td>${col.quantity} ${col.unit}</td>
      <td>${formatAmount(col.rate_applied || 0)}</td>
      <td>${formatAmount(col.total_amount)}</td>
    </tr>
  `).join('');

  return `
    <div class="header">
      <h1>TrackVault - Collections Report</h1>
      <p>Data Collection Management System</p>
      <p>Total Records: ${collections.length}</p>
    </div>
    
    ${filterInfo}
    
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    
    <div class="summary-box">
      <div class="summary-item">
        <span>Total Quantity:</span>
        <span>${totalQuantity.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span>Total Amount:</span>
        <span class="positive">${formatAmount(totalAmount)}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated report</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};

/**
 * Generate a print template for a single payment receipt
 */
export const generatePaymentReceipt = (payment: Payment): string => {
  const supplierName = payment.supplier?.name || 'Unknown Supplier';
  const processorName = payment.user?.name || 'System';
  
  return `
    <div class="header">
      <h1>TrackVault - Payment Receipt</h1>
      <p>Data Collection Management System</p>
    </div>
    
    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="info-row">
        <span class="info-label">Receipt No:</span>
        <span class="info-value">#PAY-${payment.id}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date:</span>
        <span class="info-value">${formatDate(payment.payment_date)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Recorded On:</span>
        <span class="info-value">${formatDate(payment.created_at)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Type:</span>
        <span class="info-value">${payment.payment_type.toUpperCase()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method:</span>
        <span class="info-value">${payment.payment_method?.toUpperCase() || 'N/A'}</span>
      </div>
      ${payment.reference_number ? `
        <div class="info-row">
          <span class="info-label">Reference Number:</span>
          <span class="info-value">${payment.reference_number}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="section">
      <div class="section-title">Supplier Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${supplierName}</span>
      </div>
      ${payment.supplier?.code ? `
        <div class="info-row">
          <span class="info-label">Code:</span>
          <span class="info-value">${payment.supplier.code}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="summary-box">
      <div class="summary-item">
        <span>Amount Paid:</span>
        <span class="positive">${formatAmount(payment.amount)}</span>
      </div>
    </div>
    
    ${payment.notes ? `
      <div class="section">
        <div class="section-title">Notes</div>
        <p>${payment.notes}</p>
      </div>
    ` : ''}
    
    <div class="section">
      <div class="info-row">
        <span class="info-label">Processed By:</span>
        <span class="info-value">${processorName}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated receipt</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};

/**
 * Generate a print template for payments list/report
 */
export const generatePaymentsReport = (
  payments: Payment[],
  filters?: { startDate?: string; endDate?: string; supplierName?: string; paymentType?: string }
): string => {
  const totalAmount = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
  const paymentsByType = payments.reduce((acc, pay) => {
    acc[pay.payment_type] = (acc[pay.payment_type] || 0) + pay.amount;
    return acc;
  }, {} as Record<string, number>);
  
  let filterInfo = '';
  if (filters) {
    filterInfo = '<div class="section"><div class="section-title">Filter Criteria</div>';
    if (filters.startDate && filters.endDate) {
      filterInfo += `<p>Date Range: ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}</p>`;
    }
    if (filters.supplierName) {
      filterInfo += `<p>Supplier: ${filters.supplierName}</p>`;
    }
    if (filters.paymentType && filters.paymentType !== 'all') {
      filterInfo += `<p>Payment Type: ${filters.paymentType.toUpperCase()}</p>`;
    }
    filterInfo += '</div>';
  }

  const rows = payments.map(pay => `
    <tr>
      <td>${formatDate(pay.payment_date)}</td>
      <td>${pay.supplier?.name || 'N/A'}</td>
      <td>${pay.payment_type.toUpperCase()}</td>
      <td>${pay.payment_method?.toUpperCase() || 'N/A'}</td>
      <td>${pay.reference_number || '-'}</td>
      <td>${formatAmount(pay.amount)}</td>
    </tr>
  `).join('');

  return `
    <div class="header">
      <h1>TrackVault - Payments Report</h1>
      <p>Data Collection Management System</p>
      <p>Total Records: ${payments.length}</p>
    </div>
    
    ${filterInfo}
    
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Supplier</th>
            <th>Type</th>
            <th>Method</th>
            <th>Reference</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    
    <div class="summary-box">
      ${Object.entries(paymentsByType).map(([type, amount]) => `
        <div class="summary-item">
          <span>${type.toUpperCase()} Payments:</span>
          <span>${formatAmount(amount)}</span>
        </div>
      `).join('')}
      <div class="summary-item">
        <span>Total Payments:</span>
        <span class="positive">${formatAmount(totalAmount)}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated report</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};

/**
 * Generate a print template for supplier balance report
 */
export const generateSupplierBalanceReport = (supplier: Supplier): string => {
  const totalCollections = supplier.total_collections || 0;
  const totalPayments = supplier.total_payments || 0;
  const balance = supplier.balance || 0;
  const balanceClass = balance >= 0 ? 'positive' : 'negative';
  
  return `
    <div class="header">
      <h1>TrackVault - Supplier Balance Report</h1>
      <p>Data Collection Management System</p>
    </div>
    
    <div class="section">
      <div class="section-title">Supplier Information</div>
      <div class="info-row">
        <span class="info-label">Name:</span>
        <span class="info-value">${supplier.name}</span>
      </div>
      ${supplier.code ? `
        <div class="info-row">
          <span class="info-label">Code:</span>
          <span class="info-value">${supplier.code}</span>
        </div>
      ` : ''}
      ${supplier.phone ? `
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${supplier.phone}</span>
        </div>
      ` : ''}
      ${supplier.email ? `
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${supplier.email}</span>
        </div>
      ` : ''}
      ${supplier.address ? `
        <div class="info-row">
          <span class="info-label">Address:</span>
          <span class="info-value">${supplier.address}</span>
        </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value">${supplier.is_active ? 'Active' : 'Inactive'}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Financial Summary</div>
      <div class="summary-box">
        <div class="summary-item">
          <span>Total Collections:</span>
          <span>${formatAmount(totalCollections)}</span>
        </div>
        <div class="summary-item">
          <span>Total Payments:</span>
          <span>${formatAmount(totalPayments)}</span>
        </div>
        <div class="summary-item">
          <span>Current Balance:</span>
          <span class="${balanceClass}">${formatAmount(balance)}</span>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Balance Interpretation</div>
      <p>
        ${balance > 0 
          ? `The supplier is owed ${formatAmount(balance)} for collections that exceed payments.`
          : balance < 0
            ? `The supplier has received ${formatAmount(Math.abs(balance))} more in payments than collections recorded.`
            : 'The supplier account is balanced with no outstanding amount.'}
      </p>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated report</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};

/**
 * Generate a print template for all suppliers balance report
 */
export const generateSuppliersBalanceReport = (suppliers: Supplier[]): string => {
  const totalCollections = suppliers.reduce((sum, sup) => sum + (sup.total_collections || 0), 0);
  const totalPayments = suppliers.reduce((sum, sup) => sum + (sup.total_payments || 0), 0);
  const totalBalance = suppliers.reduce((sum, sup) => sum + (sup.balance || 0), 0);
  
  const rows = suppliers.map(sup => {
    const balance = sup.balance || 0;
    const balanceClass = balance >= 0 ? 'positive' : 'negative';
    return `
      <tr>
        <td>${sup.name}</td>
        <td>${sup.code || '-'}</td>
        <td>${formatAmount(sup.total_collections || 0)}</td>
        <td>${formatAmount(sup.total_payments || 0)}</td>
        <td class="${balanceClass}">${formatAmount(balance)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="header">
      <h1>TrackVault - All Suppliers Balance Report</h1>
      <p>Data Collection Management System</p>
      <p>Total Suppliers: ${suppliers.length}</p>
    </div>
    
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Code</th>
            <th>Collections</th>
            <th>Payments</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
    
    <div class="summary-box">
      <div class="summary-item">
        <span>Total Collections:</span>
        <span>${formatAmount(totalCollections)}</span>
      </div>
      <div class="summary-item">
        <span>Total Payments:</span>
        <span>${formatAmount(totalPayments)}</span>
      </div>
      <div class="summary-item">
        <span>Overall Balance:</span>
        <span class="${totalBalance >= 0 ? 'positive' : 'negative'}">${formatAmount(totalBalance)}</span>
      </div>
    </div>
    
    <div class="footer">
      <p>TrackVault - This is a computer-generated report</p>
      <p>Generated on ${formatDate(new Date().toISOString())}</p>
    </div>
  `;
};
