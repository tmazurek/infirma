const db = require('../config/database');

/**
 * Tax rates and constants for Polish tax system
 * Based on 2023/2024 rates
 */
const TAX_RATES = {
  // Ryczałt (lump sum) tax rate for IT industry
  PIT_RATE: 0.12, // 12%
  
  // VAT rate
  VAT_RATE: 0.23, // 23%
  
  // ZUS (Social Security) monthly contributions for 2023/2024
  // Full ZUS contributions
  ZUS: {
    // Social insurance (ubezpieczenie społeczne)
    SOCIAL_INSURANCE: {
      RETIREMENT: 812.23, // Emerytalne
      DISABILITY: 333.60, // Rentowe
      SICKNESS: 102.48, // Chorobowe
      ACCIDENT: 58.57, // Wypadkowe (average rate)
      LABOR_FUND: 98.91, // Fundusz Pracy
    },
    
    // Health insurance (ubezpieczenie zdrowotne)
    HEALTH_INSURANCE: 559.89,
    
    // Total ZUS monthly payment
    get TOTAL() {
      return this.SOCIAL_INSURANCE.RETIREMENT +
             this.SOCIAL_INSURANCE.DISABILITY +
             this.SOCIAL_INSURANCE.SICKNESS +
             this.SOCIAL_INSURANCE.ACCIDENT +
             this.SOCIAL_INSURANCE.LABOR_FUND +
             this.HEALTH_INSURANCE;
    }
  }
};

/**
 * Calculate VAT due for a given month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @param {Function} callback - Callback function(err, result)
 */
function calculateVAT(month, year, callback) {
  // Format month and year for SQL date comparison
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // Get last day of the month
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  // Get VAT collected from invoices
  const invoicesSql = `
    SELECT SUM(total_vat) as vat_collected
    FROM Invoices
    WHERE issue_date BETWEEN ? AND ?
  `;
  
  // Get VAT paid from expenses
  const expensesSql = `
    SELECT SUM(vat_amount_paid) as vat_paid
    FROM Expenses
    WHERE expense_date BETWEEN ? AND ?
  `;
  
  db.get(invoicesSql, [startDate, endDate], (err, invoicesResult) => {
    if (err) {
      return callback(err, null);
    }
    
    db.get(expensesSql, [startDate, endDate], (err, expensesResult) => {
      if (err) {
        return callback(err, null);
      }
      
      const vatCollected = invoicesResult.vat_collected || 0;
      const vatPaid = expensesResult.vat_paid || 0;
      const vatDue = vatCollected - vatPaid;
      
      callback(null, {
        vat_collected: vatCollected,
        vat_paid: vatPaid,
        vat_due: vatDue
      });
    });
  });
}

/**
 * Calculate PIT (income tax) for a given month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @param {Function} callback - Callback function(err, result)
 */
function calculatePIT(month, year, callback) {
  // Format month and year for SQL date comparison
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate(); // Get last day of the month
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  
  // Get income from invoices
  const invoicesSql = `
    SELECT SUM(total_net) as income
    FROM Invoices
    WHERE issue_date BETWEEN ? AND ?
  `;
  
  // Get deductible expenses
  const expensesSql = `
    SELECT SUM(amount_net) as expenses
    FROM Expenses
    WHERE expense_date BETWEEN ? AND ?
  `;
  
  db.get(invoicesSql, [startDate, endDate], (err, invoicesResult) => {
    if (err) {
      return callback(err, null);
    }
    
    db.get(expensesSql, [startDate, endDate], (err, expensesResult) => {
      if (err) {
        return callback(err, null);
      }
      
      const income = invoicesResult.income || 0;
      
      // For "ryczałt" (lump sum tax), expenses are not deductible
      // We still calculate them for informational purposes
      const expenses = expensesResult.expenses || 0;
      
      // For "ryczałt", tax is calculated on total income
      const taxableIncome = income;
      const incomeTax = taxableIncome * TAX_RATES.PIT_RATE;
      
      callback(null, {
        income: income,
        expenses: expenses,
        taxable_income: taxableIncome,
        income_tax_rate: TAX_RATES.PIT_RATE,
        income_tax: incomeTax
      });
    });
  });
}

/**
 * Calculate ZUS (social security) contributions
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @param {Function} callback - Callback function(err, result)
 */
function calculateZUS(month, year, callback) {
  // ZUS contributions are fixed monthly amounts
  const zusContributions = {
    social_insurance: {
      retirement: TAX_RATES.ZUS.SOCIAL_INSURANCE.RETIREMENT,
      disability: TAX_RATES.ZUS.SOCIAL_INSURANCE.DISABILITY,
      sickness: TAX_RATES.ZUS.SOCIAL_INSURANCE.SICKNESS,
      accident: TAX_RATES.ZUS.SOCIAL_INSURANCE.ACCIDENT,
      labor_fund: TAX_RATES.ZUS.SOCIAL_INSURANCE.LABOR_FUND
    },
    health_insurance: TAX_RATES.ZUS.HEALTH_INSURANCE,
    total: TAX_RATES.ZUS.TOTAL
  };
  
  callback(null, zusContributions);
}

/**
 * Calculate financial summary for a given month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2023)
 * @param {Function} callback - Callback function(err, result)
 */
function calculateFinancialSummary(month, year, callback) {
  // Calculate VAT
  calculateVAT(month, year, (err, vatResult) => {
    if (err) {
      return callback(err, null);
    }
    
    // Calculate PIT
    calculatePIT(month, year, (err, pitResult) => {
      if (err) {
        return callback(err, null);
      }
      
      // Calculate ZUS
      calculateZUS(month, year, (err, zusResult) => {
        if (err) {
          return callback(err, null);
        }
        
        // Combine all results
        const summary = {
          month: month,
          year: year,
          vat: vatResult,
          pit: pitResult,
          zus: zusResult,
          // Calculate total tax burden
          total_tax_burden: vatResult.vat_due + pitResult.income_tax + zusResult.total
        };
        
        callback(null, summary);
      });
    });
  });
}

module.exports = {
  TAX_RATES,
  calculateVAT,
  calculatePIT,
  calculateZUS,
  calculateFinancialSummary
};
