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

  // ZUS (Social Security) monthly contributions for 2024
  // Full ZUS contributions based on https://www.zus.pl/baza-wiedzy/skladki-wskazniki-odsetki/skladki/wysokosc-skladek-na-ubezpieczenia-spoleczne
  ZUS: {
    // Social insurance (ubezpieczenie społeczne)
    SOCIAL_INSURANCE: {
      RETIREMENT: 916.35, // Emerytalne (19.52% of 4694.94 PLN)
      DISABILITY: 375.60, // Rentowe (8% of 4694.94 PLN)
      SICKNESS: 114.99, // Chorobowe (2.45% of 4694.94 PLN)
      ACCIDENT: 78.20, // Wypadkowe (1.67% of 4694.94 PLN)
      LABOR_FUND: 115.02, // Fundusz Pracy (2.45% of 4694.94 PLN)
      FEP: 4.69, // Fundusz Emerytur Pomostowych (0.1% of 4694.94 PLN)
    },

    // Health insurance (ubezpieczenie zdrowotne) for business activity taxed at lump sum (ryczałt)
    // For income tax at 12%, health insurance is 9% of 75% of average monthly salary
    HEALTH_INSURANCE: 419.46, // 9% of 4694.94 PLN * 0.75 = 9% of 3521.21 PLN

    // Total ZUS monthly payment
    get TOTAL() {
      return this.SOCIAL_INSURANCE.RETIREMENT +
             this.SOCIAL_INSURANCE.DISABILITY +
             this.SOCIAL_INSURANCE.SICKNESS +
             this.SOCIAL_INSURANCE.ACCIDENT +
             this.SOCIAL_INSURANCE.LABOR_FUND +
             this.SOCIAL_INSURANCE.FEP +
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
  // Get company profile to use custom ZUS rates if available
  const sql = 'SELECT * FROM CompanyProfile LIMIT 1';

  db.get(sql, [], (err, profile) => {
    if (err) {
      return callback(err, null);
    }

    let zusContributions;

    if (profile) {
      // Calculate ZUS using custom rates from company profile
      const baseAmount = profile.zus_base_amount || 5203.80;
      const retirementRate = profile.zus_retirement_rate || 19.52;
      const disabilityRate = profile.zus_disability_rate || 8.0;
      const accidentRate = profile.zus_accident_rate || 1.67;
      const sicknessRate = profile.zus_sickness_rate || 2.45;
      const laborFundRate = profile.zus_labor_fund_rate || 2.45;
      const fepRate = profile.zus_fep_rate || 0.1;

      // Calculate contributions
      const retirement = (baseAmount * retirementRate / 100).toFixed(2) * 1;
      const disability = (baseAmount * disabilityRate / 100).toFixed(2) * 1;
      const accident = (baseAmount * accidentRate / 100).toFixed(2) * 1;
      const sickness = (baseAmount * sicknessRate / 100).toFixed(2) * 1;
      const laborFund = (baseAmount * laborFundRate / 100).toFixed(2) * 1;
      const fep = (baseAmount * fepRate / 100).toFixed(2) * 1;

      // Use custom health insurance amount if provided, otherwise use default
      const healthInsurance = profile.zus_health_insurance_amount > 0
        ? profile.zus_health_insurance_amount
        : TAX_RATES.ZUS.HEALTH_INSURANCE;

      // Calculate total
      const total = retirement + disability + accident + sickness + laborFund + fep + healthInsurance;

      zusContributions = {
        social_insurance: {
          retirement,
          disability,
          sickness,
          accident,
          labor_fund: laborFund,
          fep
        },
        health_insurance: healthInsurance,
        total,
        base_amount: baseAmount
      };
    } else {
      // Use default rates
      zusContributions = {
        social_insurance: {
          retirement: TAX_RATES.ZUS.SOCIAL_INSURANCE.RETIREMENT,
          disability: TAX_RATES.ZUS.SOCIAL_INSURANCE.DISABILITY,
          sickness: TAX_RATES.ZUS.SOCIAL_INSURANCE.SICKNESS,
          accident: TAX_RATES.ZUS.SOCIAL_INSURANCE.ACCIDENT,
          labor_fund: TAX_RATES.ZUS.SOCIAL_INSURANCE.LABOR_FUND,
          fep: TAX_RATES.ZUS.SOCIAL_INSURANCE.FEP
        },
        health_insurance: TAX_RATES.ZUS.HEALTH_INSURANCE,
        total: TAX_RATES.ZUS.TOTAL,
        base_amount: 4694.94
      };
    }

    callback(null, zusContributions);
  });
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
