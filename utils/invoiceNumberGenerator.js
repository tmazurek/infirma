const db = require('../config/database');

/**
 * Generate a unique invoice number in the format YYYY/MM/NNNN
 * where YYYY is the year, MM is the month, and NNNN is a sequential number
 * @param {Function} callback - Callback function(err, invoiceNumber)
 */
function generateInvoiceNumber(callback) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}/${month}`;
  
  // Find the highest invoice number for the current year/month
  const sql = `
    SELECT invoice_number 
    FROM Invoices 
    WHERE invoice_number LIKE ? 
    ORDER BY invoice_number DESC 
    LIMIT 1
  `;
  
  db.get(sql, [`${yearMonth}/%`], (err, row) => {
    if (err) {
      return callback(err, null);
    }
    
    let sequentialNumber = 1;
    
    if (row) {
      // Extract the sequential number from the last invoice number
      const lastInvoiceNumber = row.invoice_number;
      const lastSequentialNumber = parseInt(lastInvoiceNumber.split('/')[2], 10);
      
      if (!isNaN(lastSequentialNumber)) {
        sequentialNumber = lastSequentialNumber + 1;
      }
    }
    
    // Format the sequential number with leading zeros
    const formattedSequentialNumber = String(sequentialNumber).padStart(4, '0');
    const invoiceNumber = `${yearMonth}/${formattedSequentialNumber}`;
    
    callback(null, invoiceNumber);
  });
}

module.exports = {
  generateInvoiceNumber
};
