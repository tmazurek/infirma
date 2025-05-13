const db = require('../config/database');

class Expense {
  // Get all expenses with optional filtering
  static getAllExpenses(filters, callback) {
    let sql = 'SELECT * FROM Expenses';
    const params = [];
    
    // Add WHERE clause if filters are provided
    if (filters) {
      const whereClauses = [];
      
      // Filter by date range
      if (filters.startDate) {
        whereClauses.push('expense_date >= ?');
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        whereClauses.push('expense_date <= ?');
        params.push(filters.endDate);
      }
      
      // Filter by category
      if (filters.category) {
        whereClauses.push('category = ?');
        params.push(filters.category);
      }
      
      // Add WHERE clause to SQL if any filters were applied
      if (whereClauses.length > 0) {
        sql += ' WHERE ' + whereClauses.join(' AND ');
      }
    }
    
    // Add ORDER BY clause
    sql += ' ORDER BY expense_date DESC, id DESC';
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }

  // Get a specific expense by ID
  static getExpenseById(id, callback) {
    const sql = 'SELECT * FROM Expenses WHERE id = ?';
    
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!row) {
        return callback(new Error('Expense not found'), null);
      }
      
      callback(null, row);
    });
  }

  // Create a new expense
  static createExpense(expenseData, callback) {
    // Validate required fields
    if (!expenseData.expense_date || !expenseData.description || !expenseData.amount_gross) {
      return callback(new Error('Expense date, description, and gross amount are required'), null);
    }
    
    const sql = `
      INSERT INTO Expenses (
        expense_date,
        vendor_name,
        description,
        amount_net,
        vat_amount_paid,
        amount_gross,
        category,
        invoice_scan_url_optional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      expenseData.expense_date,
      expenseData.vendor_name || null,
      expenseData.description,
      expenseData.amount_net || null,
      expenseData.vat_amount_paid || null,
      expenseData.amount_gross,
      expenseData.category || null,
      expenseData.invoice_scan_url_optional || null
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        return callback(err, null);
      }
      
      // Return the created expense with its ID
      callback(null, { id: this.lastID, ...expenseData });
    });
  }

  // Update an existing expense
  static updateExpense(id, expenseData, callback) {
    // First check if the expense exists
    this.getExpenseById(id, (err, existingExpense) => {
      if (err) {
        return callback(err, null);
      }
      
      // Validate required fields
      if (!expenseData.expense_date || !expenseData.description || !expenseData.amount_gross) {
        return callback(new Error('Expense date, description, and gross amount are required'), null);
      }
      
      const sql = `
        UPDATE Expenses 
        SET 
          expense_date = ?,
          vendor_name = ?,
          description = ?,
          amount_net = ?,
          vat_amount_paid = ?,
          amount_gross = ?,
          category = ?,
          invoice_scan_url_optional = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        expenseData.expense_date,
        expenseData.vendor_name || null,
        expenseData.description,
        expenseData.amount_net || null,
        expenseData.vat_amount_paid || null,
        expenseData.amount_gross,
        expenseData.category || null,
        expenseData.invoice_scan_url_optional || null,
        id
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          return callback(err, null);
        }
        
        // Return the updated expense
        callback(null, { id: parseInt(id), ...expenseData });
      });
    });
  }

  // Delete an expense
  static deleteExpense(id, callback) {
    // First check if the expense exists
    this.getExpenseById(id, (err, existingExpense) => {
      if (err) {
        return callback(err, null);
      }
      
      const sql = 'DELETE FROM Expenses WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          return callback(err, null);
        }
        
        // Check if any rows were affected
        if (this.changes === 0) {
          return callback(new Error('Expense not found or already deleted'), null);
        }
        
        callback(null, { id: parseInt(id), deleted: true });
      });
    });
  }

  // Get expense categories (distinct categories from existing expenses)
  static getCategories(callback) {
    const sql = 'SELECT DISTINCT category FROM Expenses WHERE category IS NOT NULL ORDER BY category';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      
      // Extract category values from rows
      const categories = rows.map(row => row.category);
      callback(null, categories);
    });
  }
}

module.exports = Expense;
