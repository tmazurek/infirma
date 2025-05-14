const taxCalculator = require('../../utils/taxCalculator');

describe('Tax Calculator', () => {
  describe('calculateVAT', () => {
    test('should calculate VAT correctly for positive values', () => {
      const income = 10000;
      const expenses = 4000;
      const vatRate = 23;
      
      const result = taxCalculator.calculateVAT(income, expenses, vatRate);
      
      expect(result).toBeDefined();
      expect(result.vat_income).toBe(income * (vatRate / 100));
      expect(result.vat_expenses).toBe(expenses * (vatRate / 100));
      expect(result.vat_due).toBe((income - expenses) * (vatRate / 100));
    });
    
    test('should handle zero values', () => {
      const result = taxCalculator.calculateVAT(0, 0, 23);
      
      expect(result).toBeDefined();
      expect(result.vat_income).toBe(0);
      expect(result.vat_expenses).toBe(0);
      expect(result.vat_due).toBe(0);
    });
    
    test('should handle negative VAT due when expenses exceed income', () => {
      const income = 5000;
      const expenses = 8000;
      const vatRate = 23;
      
      const result = taxCalculator.calculateVAT(income, expenses, vatRate);
      
      expect(result).toBeDefined();
      expect(result.vat_income).toBe(income * (vatRate / 100));
      expect(result.vat_expenses).toBe(expenses * (vatRate / 100));
      expect(result.vat_due).toBe((income - expenses) * (vatRate / 100));
      expect(result.vat_due).toBeLessThan(0);
    });
  });
  
  describe('calculatePIT', () => {
    test('should calculate PIT correctly for ryczalt tax type', () => {
      const income = 10000;
      const expenses = 4000;
      const taxType = 'ryczalt';
      const taxRate = 12;
      
      const result = taxCalculator.calculatePIT(income, expenses, taxType, taxRate);
      
      expect(result).toBeDefined();
      expect(result.income).toBe(income);
      expect(result.expenses).toBe(expenses);
      expect(result.taxable_income).toBe(income);
      expect(result.income_tax).toBe(income * (taxRate / 100));
    });
    
    test('should calculate PIT correctly for liniowy tax type', () => {
      const income = 10000;
      const expenses = 4000;
      const taxType = 'liniowy';
      const taxRate = 19;
      
      const result = taxCalculator.calculatePIT(income, expenses, taxType, taxRate);
      
      expect(result).toBeDefined();
      expect(result.income).toBe(income);
      expect(result.expenses).toBe(expenses);
      expect(result.taxable_income).toBe(income - expenses);
      expect(result.income_tax).toBe((income - expenses) * (taxRate / 100));
    });
    
    test('should handle zero income', () => {
      const result = taxCalculator.calculatePIT(0, 0, 'ryczalt', 12);
      
      expect(result).toBeDefined();
      expect(result.income).toBe(0);
      expect(result.expenses).toBe(0);
      expect(result.taxable_income).toBe(0);
      expect(result.income_tax).toBe(0);
    });
    
    test('should handle negative taxable income for liniowy tax type', () => {
      const income = 5000;
      const expenses = 8000;
      const taxType = 'liniowy';
      const taxRate = 19;
      
      const result = taxCalculator.calculatePIT(income, expenses, taxType, taxRate);
      
      expect(result).toBeDefined();
      expect(result.taxable_income).toBe(income - expenses);
      expect(result.taxable_income).toBeLessThan(0);
      expect(result.income_tax).toBe(0); // Tax should be 0 when taxable income is negative
    });
  });
  
  describe('calculateZUS', () => {
    test('should calculate ZUS contributions correctly', () => {
      const baseAmount = 5203.80;
      const retirementRate = 19.52;
      const disabilityRate = 8.0;
      const accidentRate = 1.67;
      const sicknessRate = 2.45;
      const sicknessOptional = true;
      const laborFundRate = 2.45;
      const fepRate = 0.0;
      const healthInsurance = 461.66;
      
      const result = taxCalculator.calculateZUS(
        baseAmount,
        retirementRate,
        disabilityRate,
        accidentRate,
        sicknessRate,
        sicknessOptional,
        laborFundRate,
        fepRate,
        healthInsurance
      );
      
      expect(result).toBeDefined();
      expect(result.retirement).toBeCloseTo(baseAmount * (retirementRate / 100), 2);
      expect(result.disability).toBeCloseTo(baseAmount * (disabilityRate / 100), 2);
      expect(result.accident).toBeCloseTo(baseAmount * (accidentRate / 100), 2);
      expect(result.sickness).toBeCloseTo(baseAmount * (sicknessRate / 100), 2);
      expect(result.labor_fund).toBeCloseTo(baseAmount * (laborFundRate / 100), 2);
      expect(result.fep).toBeCloseTo(baseAmount * (fepRate / 100), 2);
      expect(result.health_insurance).toBe(healthInsurance);
      
      const socialInsuranceTotal = 
        result.retirement + 
        result.disability + 
        result.accident + 
        result.sickness + 
        result.labor_fund + 
        result.fep;
      
      expect(result.social_insurance_total).toBeCloseTo(socialInsuranceTotal, 2);
      expect(result.total).toBeCloseTo(socialInsuranceTotal + healthInsurance, 2);
    });
    
    test('should handle sickness insurance being optional', () => {
      const baseAmount = 5203.80;
      const sicknessRate = 2.45;
      const sicknessOptional = false;
      
      const result = taxCalculator.calculateZUS(
        baseAmount,
        19.52,
        8.0,
        1.67,
        sicknessRate,
        sicknessOptional,
        2.45,
        0.0,
        461.66
      );
      
      expect(result).toBeDefined();
      expect(result.sickness).toBe(0);
    });
  });
});
