const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generate a PDF invoice
 * @param {Object} invoice - The invoice data
 * @param {Stream} outputStream - The output stream to write the PDF to
 */
function generateInvoicePDF(invoice, outputStream) {
  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Invoice ${invoice.invoice_number}`,
      Author: 'Infirma Accounting App',
    }
  });
  
  // Pipe the PDF to the output stream
  doc.pipe(outputStream);
  
  // Get company profile from snapshot
  const company = invoice.company_profile_snapshot || {};
  
  // Format dates
  const issueDate = new Date(invoice.issue_date).toLocaleDateString();
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-';
  
  // Set some initial styles
  doc.font('Helvetica-Bold');
  doc.fontSize(20);
  
  // Add invoice header
  doc.text('INVOICE', { align: 'left' });
  doc.moveDown(0.5);
  
  doc.fontSize(12);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, { align: 'left' });
  doc.text(`Status: ${invoice.status}`, { align: 'left' });
  doc.moveDown();
  
  // Add company and client information
  doc.fontSize(10);
  
  // Company info (left side)
  const companyY = doc.y;
  doc.text('From:', { continued: true }).font('Helvetica-Bold');
  doc.font('Helvetica').text(` ${company.company_name || ''}`);
  doc.text(`NIP: ${company.nip || ''}`);
  doc.text(`${company.street_address || ''}`);
  doc.text(`${company.city || ''} ${company.postal_code || ''}`);
  doc.text(`Bank Account: ${company.bank_account_number || ''}`);
  
  // Client info (right side)
  doc.font('Helvetica-Bold');
  doc.text('To:', 300, companyY, { continued: true });
  doc.font('Helvetica').text(` ${invoice.client_name}`);
  doc.text(`NIP: ${invoice.client_nip || ''}`, 300);
  doc.text(`${invoice.client_street_address || ''}`, 300);
  doc.text(`${invoice.client_city || ''} ${invoice.client_postal_code || ''}`, 300);
  
  doc.moveDown(2);
  
  // Add dates
  doc.font('Helvetica-Bold');
  doc.text('Issue Date:', 50, doc.y, { continued: true }).font('Helvetica').text(` ${issueDate}`);
  doc.font('Helvetica-Bold').text('Due Date:', 300, doc.y - 12, { continued: true }).font('Helvetica').text(` ${dueDate}`);
  doc.font('Helvetica-Bold').text('Payment Terms:', 50, doc.y + 12, { continued: true }).font('Helvetica').text(` ${invoice.payment_terms || '-'}`);
  
  doc.moveDown(2);
  
  // Add items table
  const tableTop = doc.y;
  const tableHeaders = ['Description', 'Quantity', 'Unit Price (Net)', 'VAT Rate', 'Total (Net)', 'VAT', 'Total (Gross)'];
  const tableWidths = [180, 50, 70, 50, 70, 50, 70];
  
  // Draw table headers
  doc.font('Helvetica-Bold');
  doc.fontSize(8);
  
  let xPosition = 50;
  tableHeaders.forEach((header, i) => {
    doc.text(header, xPosition, tableTop, { width: tableWidths[i], align: 'left' });
    xPosition += tableWidths[i];
  });
  
  // Draw a line below headers
  doc.moveTo(50, tableTop + 12).lineTo(550, tableTop + 12).stroke();
  
  // Draw table rows
  doc.font('Helvetica');
  let yPosition = tableTop + 20;
  
  invoice.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
      
      // Redraw headers on new page
      xPosition = 50;
      doc.font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPosition, yPosition, { width: tableWidths[i], align: 'left' });
        xPosition += tableWidths[i];
      });
      
      // Draw a line below headers
      doc.moveTo(50, yPosition + 12).lineTo(550, yPosition + 12).stroke();
      
      doc.font('Helvetica');
      yPosition += 20;
    }
    
    // Draw item row
    xPosition = 50;
    doc.text(item.description, xPosition, yPosition, { width: tableWidths[0], align: 'left' });
    xPosition += tableWidths[0];
    
    doc.text(item.quantity.toString(), xPosition, yPosition, { width: tableWidths[1], align: 'left' });
    xPosition += tableWidths[1];
    
    doc.text(`${item.unit_price_net.toFixed(2)} PLN`, xPosition, yPosition, { width: tableWidths[2], align: 'left' });
    xPosition += tableWidths[2];
    
    doc.text(`${item.vat_rate}%`, xPosition, yPosition, { width: tableWidths[3], align: 'left' });
    xPosition += tableWidths[3];
    
    doc.text(`${item.item_total_net.toFixed(2)} PLN`, xPosition, yPosition, { width: tableWidths[4], align: 'left' });
    xPosition += tableWidths[4];
    
    doc.text(`${item.item_total_vat.toFixed(2)} PLN`, xPosition, yPosition, { width: tableWidths[5], align: 'left' });
    xPosition += tableWidths[5];
    
    doc.text(`${item.item_total_gross.toFixed(2)} PLN`, xPosition, yPosition, { width: tableWidths[6], align: 'left' });
    
    // Draw a light line below the row
    if (index < invoice.items.length - 1) {
      doc.moveTo(50, yPosition + 12).lineTo(550, yPosition + 12).stroke('#dddddd');
    }
    
    yPosition += 20;
  });
  
  // Draw a line below items
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  
  // Add totals
  yPosition += 20;
  
  // Check if we need a new page for totals
  if (yPosition > 700) {
    doc.addPage();
    yPosition = 50;
  }
  
  // Draw totals
  doc.font('Helvetica-Bold');
  doc.text('Total Net:', 380, yPosition, { width: 100, align: 'right' });
  doc.font('Helvetica').text(`${invoice.total_net.toFixed(2)} PLN`, 480, yPosition, { width: 70, align: 'left' });
  
  yPosition += 20;
  doc.font('Helvetica-Bold').text('Total VAT:', 380, yPosition, { width: 100, align: 'right' });
  doc.font('Helvetica').text(`${invoice.total_vat.toFixed(2)} PLN`, 480, yPosition, { width: 70, align: 'left' });
  
  yPosition += 20;
  doc.font('Helvetica-Bold').text('Total Gross:', 380, yPosition, { width: 100, align: 'right' });
  doc.font('Helvetica').text(`${invoice.total_gross.toFixed(2)} PLN`, 480, yPosition, { width: 70, align: 'left' });
  
  // Add footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Add page number
    doc.fontSize(8);
    doc.font('Helvetica');
    doc.text(
      `Page ${i + 1} of ${pageCount}`,
      50,
      doc.page.height - 50,
      { align: 'center', width: doc.page.width - 100 }
    );
    
    // Add footer text
    doc.fontSize(8);
    doc.font('Helvetica');
    doc.text(
      'Generated by Infirma Accounting App',
      50,
      doc.page.height - 35,
      { align: 'center', width: doc.page.width - 100 }
    );
  }
  
  // Finalize the PDF
  doc.end();
}

module.exports = {
  generateInvoicePDF
};
