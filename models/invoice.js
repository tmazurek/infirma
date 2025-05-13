const db = require('../config/database');
const { generateInvoiceNumber } = require('../utils/invoiceNumberGenerator');
const CompanyProfile = require('./companyProfile');

class Invoice {
  // Get all invoices with basic information
  static getAllInvoices(callback) {
    const sql = `
      SELECT i.*, c.client_name 
      FROM Invoices i
      JOIN Clients c ON i.client_id = c.id
      ORDER BY i.issue_date DESC, i.id DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // Get a specific invoice with all its items
  static getInvoiceById(id, callback) {
    // First get the invoice
    const invoiceSql = `
      SELECT i.*, c.client_name, c.nip as client_nip, c.street_address as client_street_address, 
             c.city as client_city, c.postal_code as client_postal_code
      FROM Invoices i
      JOIN Clients c ON i.client_id = c.id
      WHERE i.id = ?
    `;
    
    db.get(invoiceSql, [id], (err, invoice) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!invoice) {
        return callback(new Error('Invoice not found'), null);
      }
      
      // Then get all items for this invoice
      const itemsSql = `
        SELECT * FROM InvoiceItems
        WHERE invoice_id = ?
        ORDER BY id
      `;
      
      db.all(itemsSql, [id], (err, items) => {
        if (err) {
          return callback(err, null);
        }
        
        // Add items to the invoice object
        invoice.items = items;
        
        // Parse the company profile snapshot from JSON
        if (invoice.company_profile_snapshot) {
          try {
            invoice.company_profile_snapshot = JSON.parse(invoice.company_profile_snapshot);
          } catch (e) {
            console.error('Error parsing company profile snapshot:', e);
          }
        }
        
        callback(null, invoice);
      });
    });
  }

  // Create a new invoice with its items
  static createInvoice(invoiceData, callback) {
    // Validate required fields
    if (!invoiceData.client_id || !invoiceData.issue_date || !invoiceData.items || invoiceData.items.length === 0) {
      return callback(new Error('Client, issue date, and at least one item are required'), null);
    }
    
    // Generate a unique invoice number
    generateInvoiceNumber((err, invoiceNumber) => {
      if (err) {
        return callback(err, null);
      }
      
      // Get the company profile to store as a snapshot
      CompanyProfile.getProfile((err, companyProfile) => {
        if (err) {
          return callback(err, null);
        }
        
        // Calculate totals
        let totalNet = 0;
        let totalVat = 0;
        let totalGross = 0;
        
        // Process each item to ensure calculations are correct
        const items = invoiceData.items.map(item => {
          const quantity = parseFloat(item.quantity);
          const unitPriceNet = parseFloat(item.unit_price_net);
          const vatRate = parseFloat(item.vat_rate);
          
          const itemTotalNet = quantity * unitPriceNet;
          const itemTotalVat = itemTotalNet * (vatRate / 100);
          const itemTotalGross = itemTotalNet + itemTotalVat;
          
          totalNet += itemTotalNet;
          totalVat += itemTotalVat;
          totalGross += itemTotalGross;
          
          return {
            ...item,
            item_total_net: itemTotalNet,
            item_total_vat: itemTotalVat,
            item_total_gross: itemTotalGross
          };
        });
        
        // Round totals to 2 decimal places
        totalNet = Math.round(totalNet * 100) / 100;
        totalVat = Math.round(totalVat * 100) / 100;
        totalGross = Math.round(totalGross * 100) / 100;
        
        // Begin a transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // Insert the invoice
          const invoiceSql = `
            INSERT INTO Invoices (
              invoice_number, 
              client_id, 
              issue_date, 
              due_date, 
              payment_terms, 
              company_profile_snapshot,
              total_net,
              total_vat,
              total_gross,
              status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          const invoiceParams = [
            invoiceNumber,
            invoiceData.client_id,
            invoiceData.issue_date,
            invoiceData.due_date || null,
            invoiceData.payment_terms || null,
            companyProfile ? JSON.stringify(companyProfile) : null,
            totalNet,
            totalVat,
            totalGross,
            invoiceData.status || 'Draft'
          ];
          
          db.run(invoiceSql, invoiceParams, function(err) {
            if (err) {
              db.run('ROLLBACK');
              return callback(err, null);
            }
            
            const invoiceId = this.lastID;
            
            // Insert all items
            const itemSql = `
              INSERT INTO InvoiceItems (
                invoice_id,
                description,
                quantity,
                unit_price_net,
                vat_rate,
                item_total_net,
                item_total_vat,
                item_total_gross
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            let itemsInserted = 0;
            let itemError = null;
            
            items.forEach(item => {
              const itemParams = [
                invoiceId,
                item.description,
                item.quantity,
                item.unit_price_net,
                item.vat_rate,
                item.item_total_net,
                item.item_total_vat,
                item.item_total_gross
              ];
              
              db.run(itemSql, itemParams, function(err) {
                if (err && !itemError) {
                  itemError = err;
                }
                
                itemsInserted++;
                
                // If all items have been processed
                if (itemsInserted === items.length) {
                  if (itemError) {
                    db.run('ROLLBACK');
                    return callback(itemError, null);
                  }
                  
                  db.run('COMMIT');
                  
                  // Return the created invoice with its ID and items
                  const createdInvoice = {
                    id: invoiceId,
                    invoice_number: invoiceNumber,
                    client_id: invoiceData.client_id,
                    issue_date: invoiceData.issue_date,
                    due_date: invoiceData.due_date,
                    payment_terms: invoiceData.payment_terms,
                    total_net: totalNet,
                    total_vat: totalVat,
                    total_gross: totalGross,
                    status: invoiceData.status || 'Draft',
                    items: items
                  };
                  
                  callback(null, createdInvoice);
                }
              });
            });
          });
        });
      });
    });
  }

  // Update an invoice's status
  static updateInvoiceStatus(id, status, callback) {
    const validStatuses = ['Draft', 'Issued', 'Paid'];
    
    if (!validStatuses.includes(status)) {
      return callback(new Error('Invalid status. Must be Draft, Issued, or Paid'), null);
    }
    
    const sql = `
      UPDATE Invoices
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    db.run(sql, [status, id], function(err) {
      if (err) {
        return callback(err, null);
      }
      
      if (this.changes === 0) {
        return callback(new Error('Invoice not found'), null);
      }
      
      callback(null, { id: parseInt(id), status: status });
    });
  }
}

module.exports = Invoice;
