Okay, I understand. You'd like a complete, fresh rewrite of the MVP Accounting App Blueprint, fully based on a JavaScript technology stack from the ground up, incorporating all the previous discussions.

Here is the complete, rewritten blueprint:

**Primary Guiding Models for This Project:**

1.  **Jobs-to-be-Done (JTBD):** The fundamental goal is to enable you to efficiently manage core financial administration for your Polish business (creating invoices to get paid, ensuring tax compliance, and tracking financial incomings/outgoings) without the cost or complexity of feature-rich commercial software.
2.  **YAGNI (You Ain't Gonna Need It) & Gall's Law:** We will prioritize building the simplest possible version that fulfills your explicitly stated core needs. Successful complex systems invariably evolve from simpler systems that worked. We will avoid adding features "just in case" or for future hypothetical needs at this initial MVP stage.
3.  **Occam's Razor:** The simplest, most straightforward technical solution that correctly implements invoicing, expense tracking, and the specified tax calculations will be favored.

**Confidence Score:** High (that I understand your core requirements for a simplified accounting tool based on a JavaScript stack).

**Key Assumptions:**

1.  You are operating as a sole proprietor or small business in Poland.
2.  The primary aim is to develop a custom application for personal/your business use.
3.  The main drivers are reducing costs associated with commercial software and gaining control over essential features.
4.  The application's scope is strictly limited to:
    *   Creating and downloading PDF invoices.
    *   Calculating monthly VAT, PIT, and ZUS payments.
    *   Keeping track of monthly invoices and expenses.
5.  Paramount importance is placed on the accuracy of tax calculations, and you acknowledge that tax legislation is subject to change and requires vigilance.
6.  The development will use a JavaScript-centric technology stack (Node.js for the backend).

<MARKDOWN_DOCUMENT title="MVP Accounting App Blueprint (JavaScript Stack - Full Rewrite)">

## MVP Accounting App Blueprint (JavaScript Stack - Full Rewrite)

This document outlines the blueprint for a Minimum Viable Product (MVP) accounting application tailored to your specified needs, utilizing a JavaScript-based technology stack.

**I. High-Level Architecture Suggestion:**

*   **Technology Stack:**
    *   **Backend Framework:** Node.js with Express.js (A widely-used, minimalist, and flexible web application framework for Node.js, excellent for building APIs and server-side logic).
    *   **Database:** SQLite (A lightweight, file-based SQL database, simple to set up and manage for an MVP. Accessed via Node.js libraries like `sqlite3` or through an Object-Relational Mapper (ORM)).
    *   **ORM (Optional but Recommended for larger MVPs):** Sequelize or Prisma (These libraries help abstract database interactions, making code cleaner and often easier to manage, especially as data models grow. For a very small MVP, direct `sqlite3` usage is also fine).
    *   **Frontend:**
        *   **Structure:** HTML5
        *   **Styling:** CSS3
        *   **Interactivity:** Vanilla JavaScript (for core dynamic behaviors like form enhancements and simple AJAX calls).
        *   **Templating (Server-Side, Optional):** EJS, Pug, or Handlebars (If you prefer rendering HTML on the server with Express.js. Alternatively, serve static HTML and have the frontend fetch data from API endpoints).
    *   **PDF Generation (Node.js):**
        *   `pdfkit`: A direct PDF generation library for Node.js, offering fine-grained control over document creation.
        *   `Puppeteer` or `Playwright`: Headless browser automation tools that can render an HTML page (your invoice styled with CSS) and then "print" it to a PDF. This approach can be easier if you're strong with HTML/CSS for layout.
*   **Development Environment:**
    *   Node.js and npm (or yarn) for package management.
    *   `nodemon` for automatic server restarts during development.
*   **Deployment (Initial Consideration):**
    *   Run locally on your machine.
    *   Deploy to a PaaS (Platform as a Service) like Heroku, Vercel (especially for static frontends with serverless functions), or DigitalOcean App Platform, which offer Node.js support.

**II. Core Modules & Functionality:**

1.  **User/Company Profile Management:**
    *   Securely store and manage your business details (Name, NIP, address, bank account information) used for populating invoices.

2.  **Client Management:**
    *   Store and manage details of your clients (Name, NIP, address) for quick selection during invoice creation.

3.  **Invoice Management:**
    *   **Creation:** Intuitive interface to input all necessary invoice details (client selection, line items with descriptions, quantities, unit prices, VAT rates).
    *   **Automatic Calculations:** Real-time and backend-verified calculation of subtotals, VAT per item, total VAT, and the grand total.
    *   **Numbering:** Robust, sequential, and unique invoice numbering system.
    *   **Storage:** Persistent storage of all invoice data in the database.
    *   **Viewing & Listing:** Ability to list all created invoices and view the detailed information for any specific invoice.
    *   **PDF Generation & Download:** On-demand generation of professional, compliant PDF invoices for download.

4.  **Expense Tracking:**
    *   **Entry:** Form to input details of business expenses (date, vendor, description, amount, VAT paid if applicable, categorization).
    *   **Storage:** Persistent storage of expense data.
    *   **Viewing & Listing:** Ability to list all recorded expenses, with filtering capabilities (e.g., by date, category).

5.  **Monthly Tax Calculation (VAT, PIT, ZUS):**
    *   **VAT:** Calculation of VAT payable or reclaimable based on VAT collected (from invoices) and VAT paid (on eligible expenses) for a given month.
    *   **PIT (Income Tax):** Estimation of monthly income tax based on net income (invoice revenue minus deductible expenses), applying relevant Polish tax rates and rules for your business type.
    *   **ZUS (Social Security):** Calculation of ZUS contributions based on applicable bases and rates.
    *   **Reporting:** A clear summary display of these calculated amounts for a selected month.
    *   **CRITICAL CAVEAT:** Tax laws (VAT, PIT) and ZUS contribution rules in Poland are dynamic and can change. This module requires meticulous implementation and a strategy for updating the underlying rates and logic. The application **must clearly state that these calculations are estimates** based on the data entered and configured rules, and are not a substitute for professional financial advice or official verification.

**III. Key Development Tasks (MVP Focus - JavaScript Stack):**

*   **Task ID07250101**
    *   **Title:** Initialize Node.js/Express.js Project and Basic Setup.
    *   **Goal:** To establish a foundational Node.js project structure with Express.js, ready for developing the application's modules.
    *   **Instruction:**
        1.  Ensure Node.js (latest LTS recommended) and npm (or yarn) are installed on your development machine.
        2.  Create a new root directory for your project (e.g., `mkdir my-js-accounting-app && cd my-js-accounting-app`).
        3.  Initialize a new Node.js project using npm: `npm init -y`. This creates a `package.json` file.
        4.  Install Express.js: `npm install express`.
        5.  Install a SQLite driver: `npm install sqlite3`.
        6.  (Optional, if using an ORM early) Install Sequelize and its CLI, plus the `sqlite3` dialect: `npm install sequelize sequelize-cli sqlite3` or `npm install prisma && npx prisma init --datasource-provider sqlite`.
        7.  Install `nodemon` as a development dependency for automatic server restarts: `npm install --save-dev nodemon`.
        8.  Create a main application file (e.g., `server.js` or `app.js`).
        9.  In `server.js`, set up a basic Express server:
            ```javascript
            const express = require('express');
            const app = express();
            const PORT = process.env.PORT || 3000;

            app.get('/', (req, res) => {
              res.send('Accounting App MVP - Coming Soon!');
            });

            app.listen(PORT, () => {
              console.log(`Server is running on http://localhost:${PORT}`);
            });
            ```
        10. Add a `start` script and a `dev` script (using nodemon) to your `package.json`:
            ```json
            "scripts": {
              "start": "node server.js",
              "dev": "nodemon server.js"
            }
            ```
        11. Create basic project directories: `public/` (for static assets like CSS, client-side JS), `views/` (if using server-side templating), `routes/`, `models/` (if using an ORM), `db/` (to store the SQLite file).
        12. Initialize the SQLite database (e.g., create an empty `database.db` file in `db/`). Configure its connection in your application, perhaps in a separate `config/database.js` file.
        13. Commit your changes: `git add . && git commit -m "Implement ID07250101: Initialize Node.js/Express.js project"`
    *   **Rationale:** This task creates the fundamental runnable skeleton of the web application, upon which all other features will be built.
    *   **Dependencies:** ID07250001 (Repository Setup).

*   **Task ID07250202**
    *   **Title:** Implement Company Profile Management Module.
    *   **Goal:** To enable storage and retrieval of the user's company details for consistent use, primarily in invoice generation.
    *   **Instruction:**
        1.  **Database Schema:** Define the `CompanyProfile` table (e.g., using SQL `CREATE TABLE` if using `sqlite3` directly, or by defining a model if using an ORM). Fields: `id` (PK), `company_name` (TEXT NOT NULL), `nip` (TEXT UNIQUE NOT NULL), `street_address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `bank_account_number` (TEXT), `default_vat_rate` (REAL).
        2.  **Backend API Routes (Express.js):**
            *   `POST /api/company-profile`: To create or update the company profile. Expects JSON data.
            *   `GET /api/company-profile`: To retrieve the current company profile.
        3.  **Backend Logic (Controller functions for routes):**
            *   Implement functions to handle database interactions (INSERT/UPDATE for POST, SELECT for GET).
            *   Include input validation (e.g., ensure NIP is present).
        4.  **Frontend Form (HTML & JavaScript):**
            *   Create an HTML page (`company-profile.html`) with a form for inputting all company details.
            *   Use client-side JavaScript to:
                *   Fetch and pre-fill the form if a profile already exists.
                *   Handle form submission: gather data, send it to the `POST /api/company-profile` endpoint using `fetch()`.
                *   Display success/error messages.
        5.  **Commit your changes:** `git add . && git commit -m "Implement ID07250202: Company Profile Management Module"`
    *   **Rationale:** Centralizes essential business information required for invoicing, ensuring accuracy and reducing repetitive data entry.
    *   **Dependencies:** ID07250101 (Project Setup)

*   **Task ID07250303**
    *   **Title:** Implement Client Management Module.
    *   **Goal:** To allow the user to store, retrieve, and manage details of their clients for efficient invoice creation.
    *   **Instruction:**
        1.  **Database Schema:** Define the `Clients` table. Fields: `id` (PK), `client_name` (TEXT NOT NULL), `nip` (TEXT UNIQUE), `street_address` (TEXT), `city` (TEXT), `postal_code` (TEXT), `email` (TEXT), `contact_person` (TEXT).
        2.  **Backend API Routes (Express.js):**
            *   `POST /api/clients`: Create a new client.
            *   `GET /api/clients`: List all clients.
            *   `GET /api/clients/:id`: Get a specific client's details.
            *   `PUT /api/clients/:id`: Update a specific client.
            *   `DELETE /api/clients/:id`: Delete a client.
        3.  **Backend Logic (Controller functions):** Implement CRUD (Create, Read, Update, Delete) operations for clients, interacting with the database. Include validation.
        4.  **Frontend Interface (HTML & JavaScript):**
            *   Create an HTML page (`clients.html`) to:
                *   Display a list of existing clients (fetched from `GET /api/clients`).
                *   Provide a form to add new clients (submitting to `POST /api/clients`).
                *   Allow editing and deleting clients (linking to appropriate API calls).
        5.  **Commit your changes:** `git add . && git commit -m "Implement ID07250303: Client Management Module"`
    *   **Rationale:** Streamlines the invoicing process by providing a readily accessible list of client data, reducing manual entry and potential errors.
    *   **Dependencies:** ID07250101 (Project Setup)

*   **Task ID07250404**
    *   **Title:** Implement Core Invoice Creation, Storage, and Viewing.
    *   **Goal:** To enable users to create detailed invoices, calculate totals accurately, save them persistently, and view them.
    *   **Instruction:**
        1.  **Database Schemas:**
            *   `Invoices` table: `id` (PK), `invoice_number` (TEXT UNIQUE NOT NULL), `client_id` (FK referencing `Clients.id`), `issue_date` (DATE NOT NULL), `due_date` (DATE), `payment_terms` (TEXT), `company_profile_snapshot` (JSON - store a copy of company details at time of invoice creation for historical accuracy), `total_net` (REAL), `total_vat` (REAL), `total_gross` (REAL), `status` (TEXT - e.g., 'Draft', 'Issued', 'Paid').
            *   `InvoiceItems` table: `id` (PK), `invoice_id` (FK referencing `Invoices.id`), `description` (TEXT NOT NULL), `quantity` (REAL NOT NULL), `unit_price_net` (REAL NOT NULL), `vat_rate` (REAL NOT NULL), `item_total_net` (REAL), `item_total_vat` (REAL), `item_total_gross` (REAL).
        2.  **Backend API Routes (Express.js):**
            *   `POST /api/invoices`: Create a new invoice (expects client ID, items, dates etc.).
            *   `GET /api/invoices`: List all invoices.
            *   `GET /api/invoices/:id`: Get a specific invoice with its items.
        3.  **Backend Logic:**
            *   Generate unique, sequential invoice numbers (e.g., "YYYY/MM/NNNN").
            *   Validate all input data thoroughly.
            *   For `POST /api/invoices`:
                *   Calculate totals for each item and the overall invoice on the backend to ensure accuracy.
                *   Store the invoice and its associated items in a transaction to ensure data integrity.
                *   Capture a snapshot of the current company profile.
        4.  **Frontend Invoice Creation Form (`create-invoice.html`):**
            *   Dropdown to select a client (populated from `GET /api/clients`).
            *   Fields for issue date, due date, payment terms.
            *   Dynamic section for adding/removing invoice line items (description, qty, unit price, VAT rate). Client-side JS will calculate line totals and grand totals in real-time for user feedback.
            *   Submit button to send data to `POST /api/invoices`.
        5.  **Frontend Invoice Listing/Viewing Pages:**
            *   `invoices.html`: Display a table of all invoices with key details (number, client, date, total, status), linking to a detail view.
            *   `view-invoice.html?id=X`: Display full details of a single invoice (fetched from `GET /api/invoices/:id`).
        6.  **Commit your changes:** `git add . && git commit -m "Implement ID07250404: Core Invoice Creation, Storage, and Viewing"`
    *   **Rationale:** This is a central feature, directly enabling the user to bill their clients and record income. Accurate calculations and persistent storage are critical.
    *   **Dependencies:** ID07250101 (Project Setup), ID07250202 (Company Profile Management), ID07250303 (Client Management)

*   **Task ID07250505**
    *   **Title:** Implement PDF Invoice Generation and Download (Node.js).
    *   **Goal:** To generate professional, downloadable PDF versions of created invoices.
    *   **Instruction:**
        1.  **Choose and Install PDF Library:**
            *   `npm install pdfkit` (for direct generation) OR
            *   `npm install puppeteer` (for HTML to PDF).
        2.  **Backend API Route:**
            *   `GET /api/invoices/:id/pdf`: Triggers PDF generation for the specified invoice.
        3.  **Backend Logic (PDF Generation):**
            *   Fetch the full invoice data (including client and company details, and line items) for the given `invoice_id`.
            *   **If using `pdfkit`:**
                *   Write Node.js code using `pdfkit`'s API to construct the PDF document. This involves manually placing text, drawing lines/tables, and formatting content to match Polish invoice requirements.
            *   **If using `Puppeteer`:**
                1.  Create an HTML template (`invoice-template.html` or use a templating engine like EJS to render HTML string) specifically for the PDF. Style it with CSS to look like a Polish "Faktura VAT".
                2.  Populate this HTML template with the fetched invoice data.
                3.  Use Puppeteer: launch a headless browser instance, navigate to the (server-rendered or data-URL) HTML content, and use `page.pdf()` to generate the PDF buffer.
            *   Set appropriate HTTP headers in the Express.js response:
                *   `Content-Type: application/pdf`
                *   `Content-Disposition: attachment; filename="Faktura-${invoice_number}.pdf"`
            *   Send the generated PDF buffer/stream as the response.
        4.  **Frontend Link:** On the `view-invoice.html` page, add a "Download PDF" button/link that points to the `GET /api/invoices/:id/pdf` route for the current invoice.
        5.  **Commit your changes:** `git add . && git commit -m "Implement ID07250505: PDF Invoice Generation and Download"`
    *   **Rationale:** Provides invoices in a standard, professional, and legally acceptable format for sending to clients and for record-keeping.
    *   **Dependencies:** ID07250404 (Core Invoice Creation)

*   **Task ID07250606**
    *   **Title:** Implement Expense Tracking Module.
    *   **Goal:** To allow users to record, view, and manage their business expenses.
    *   **Instruction:**
        1.  **Database Schema:** Define the `Expenses` table. Fields: `id` (PK), `expense_date` (DATE NOT NULL), `vendor_name` (TEXT), `description` (TEXT NOT NULL), `amount_net` (REAL), `vat_amount_paid` (REAL), `amount_gross` (REAL NOT NULL), `category` (TEXT), `invoice_scan_url_optional` (TEXT - for future linking to scanned receipts).
        2.  **Backend API Routes (Express.js):**
            *   `POST /api/expenses`: Create a new expense.
            *   `GET /api/expenses`: List all expenses (allow filtering by date range, category via query params).
            *   `PUT /api/expenses/:id`: Update an expense.
            *   `DELETE /api/expenses/:id`: Delete an expense.
        3.  **Backend Logic:** Implement CRUD operations for expenses. Include validation.
        4.  **Frontend Interface (`expenses.html`):**
            *   Form to add new expenses.
            *   Display a list/table of expenses with filtering options.
            *   Allow editing/deleting expenses.
        5.  **Commit your changes:** `git add . && git commit -m "Implement ID07250606: Expense Tracking Module"`
    *   **Rationale:** Crucial for accurate profit calculation, providing data for income tax (PIT) deductions, and VAT reclaim calculations.
    *   **Dependencies:** ID07250101 (Project Setup)

*   **Task ID07250707**
    *   **Title:** Implement Monthly Tax Calculation Logic & Display (VAT, PIT, ZUS).
    *   **Goal:** To provide users with estimated monthly tax and social security obligations based on their recorded financial data.
    *   **Instruction:**
        1.  **Backend API Route:**
            *   `GET /api/financial-summary?month=MM&year=YYYY`: Fetches the calculated summary for the given month/year.
        2.  **Backend Logic (JavaScript functions within a service/controller):**
            *   **VAT Calculation Function:**
                1.  Accept month/year as input.
                2.  Fetch all `Invoices` for that month: sum `total_vat` (VAT collected).
                3.  Fetch all `Expenses` for that month: sum `vat_amount_paid` (VAT paid on eligible expenses).
                4.  Return `VAT Due = VAT Collected - VAT Paid`.
            *   **PIT Calculation Function (Simplified Example - **MUST BE VERIFIED AGAINST CURRENT POLISH LAW**):**
                1.  Accept month/year.
                2.  Fetch `Invoices`: sum `total_net` (income).
                3.  Fetch `Expenses`: sum `amount_net` (or `amount_gross` if non-VAT deductible, depending on business type/rules) for deductible expenses.
                4.  `Taxable Income = Income - Deductible Expenses`.
                5.  Apply PIT rate (e.g., 12% for "ryczałt" or a specific band of progressive tax). **This rate/logic MUST be easily updatable or clearly documented as needing user verification.**
                6.  Return `Estimated PIT Due`.
            *   **ZUS Calculation Function (Simplified Example - **MUST BE VERIFIED AGAINST CURRENT POLISH LAW**):**
                1.  ZUS contributions often involve fixed amounts or amounts based on a declared basis which can change.
                2.  These base amounts and rates (health, social, labor fund, etc.) need to be configurable or hardcoded with clear comments about needing regular updates.
                3.  Return `Estimated ZUS Due`.
            *   The main API handler for `GET /api/financial-summary` will call these functions and assemble the results.
        3.  **Frontend Display (`summary.html`):**
            *   Allow user to select month and year.
            *   On selection, fetch data from `GET /api/financial-summary`.
            *   Display: Total Income, Total Expenses, Calculated VAT Due, Calculated PIT Due, Calculated ZUS Due.
            *   **VERY IMPORTANT: Include a prominent, unambiguous disclaimer that these figures are estimates based on entered data and pre-set rules, and the user is solely responsible for verifying accuracy with official sources or an accountant before making any payments or submissions.**
        4.  **Commit your changes:** `git add . && git commit -m "Implement ID07250707: Monthly Tax Calculation Logic & Display"`
    *   **Rationale:** Aids in financial planning and provides a snapshot of key tax liabilities, but with a strong emphasis on its estimative nature due to the complexity and variability of tax laws.
    *   **Dependencies:** ID07250404 (Core Invoice Creation), ID07250606 (Expense Tracking)

**IV. Important Considerations (Second-Order Thinking & Risk Management):**

*   **Tax Law Accuracy & Updates (Multiplying by Zero, Precautionary Principle):**
    *   This is the **highest risk area**. Polish tax laws (VAT rates, eligible deductions, PIT thresholds/rates, ZUS contribution bases/rates) are complex and change.
    *   **Mitigation Strategy:**
        *   For the MVP, consider making tax rates and ZUS bases configurable by the user in a settings area.
        *   Alternatively, implement very simple calculations and strongly advise users to use the app's aggregated data (total income, total expenses, total VAT collected/paid) as input for official government calculators or an accountant's review.
        *   Document all calculation logic and assumptions clearly.
        *   Emphasize that the app is a tool for organization and estimation, not a certified accounting solution.
*   **Data Security & Privacy (Precautionary Principle):**
    *   You are handling sensitive financial data.
    *   If deployed online: Use HTTPS, implement robust input validation to prevent XSS/SQLi, consider secure password handling if user accounts are ever added (YAGNI for now if it's just for you locally).
    *   If run locally: Ensure the computer itself is secure. Consider encrypting the SQLite database file if an extra layer of security is desired (though may be overkill for a personal local app if the device is secure).
*   **Data Backup & Integrity (Margin of Safety):**
    *   Regularly back up the SQLite database file (`database.db`). This is critical.
    *   Use database transactions for operations that involve multiple related writes (e.g., saving an invoice and its items) to maintain data integrity.
*   **Usability (Nielsen's Usability Heuristics):**
    *   Keep the user interface clean, simple, and intuitive. Focus on making the core tasks (creating invoices, logging expenses, viewing summaries) as straightforward as possible.
    *   Provide clear feedback to the user (e.g., success/error messages).
*   **Invoice Compliance:**
    *   Thoroughly research and ensure your generated PDF invoices contain all mandatory elements required by Polish law ("elementy faktury VAT"). This includes specific wording, NIP numbers for both parties, correct VAT breakdowns, etc.
*   **Scalability & Maintainability (YAGNI for MVP, but be mindful):**
    *   While the MVP prioritizes simplicity, writing clean, well-organized JavaScript code from the start will make future enhancements or troubleshooting easier.
    *   Using an ORM can help with database migrations if your schema evolves.
    *   For a single-user app, SQLite is fine. If you ever envision multiple users or significantly more data, you might later consider a more robust database like PostgreSQL.

**V. Version Control & Development Workflow:**

1. **Repository Setup (Task ID07250001):**
   * **Title:** Initialize Git Repository
   * **Goal:** Set up version control for the project to track changes and maintain a history of development.
   * **Instruction:**
     1. Initialize a new Git repository in the project root directory: `git init`
     2. Create a `.gitignore` file to exclude unnecessary files (e.g., `node_modules/`, `.env`, database files)
     3. Make an initial commit with the project blueprint: `git add MVP\ Accounting\ App\ Blueprint.md && git commit -m "Initial commit: Project blueprint"`
   * **Rationale:** Version control is essential for tracking changes, collaborating, and maintaining a history of the project's development.
   * **Dependencies:** None.

2. **Commit Strategy:**
   * After completing each task, commit your changes with a descriptive message:
     * `git add [changed files]`
     * `git commit -m "Implement [Task ID]: [Brief description of changes]"`
   * This creates a clear history of implementation steps and provides restore points if needed.

**VI. Next Steps:**

1.  **Tooling & Familiarization:** Ensure you are comfortable with Node.js, Express.js, HTML, CSS, and basic client-side JavaScript. If you choose an ORM or a specific PDF library, spend some time with its documentation.
2.  **Iterative Development:** Start with **Task ID07250001** (Repository Setup), then proceed to **Task ID07250101** (Project Setup) and continue through the tasks sequentially or by focusing on one module at a time. Get a basic version of each feature working before refining it or adding complexity.
3.  **Tax Module Diligence:** For **Task ID07250707** (Tax Calculations), dedicate significant time to researching current Polish tax regulations relevant to your business type. Decide on the level of automation versus manual verification/configuration you are comfortable with for the MVP. **It is perfectly acceptable for an MVP to only aggregate the necessary figures, requiring you to perform the final tax calculations externally using official tools.**
4.  **Test Thoroughly:** Especially test calculations and data saving/retrieval.

Building this application will provide you with a tailored solution and a valuable learning experience. Remember the principle of starting simple and iterating based on your actual needs. Good luck!

</MARKDOWN_DOCUMENT>

---
**Self-Critique & Refinements (Internal):**

*   **Security Auditor Perspective:** The rewrite maintains advice on HTTPS, input validation. Added a note about SQLite encryption as an option for local security if desired.
*   **End-User (Usability/JTBD/Accessibility):** JTBD is well addressed. Usability is mentioned in "Important Considerations." Accessibility is still not a prime focus for a personal tool MVP but would be important if the app's scope expanded. The task breakdown gives clear steps.
*   **Operations Engineer (Reliability/Observability):** Backup and data integrity (transactions) are highlighted. Observability (logging, metrics) is minimal for an MVP personal tool, which is appropriate. Reliability hinges significantly on the "Tax Law Accuracy" point, which is heavily emphasized.
*   **Maintainer (Complexity/Clarity):** The YAGNI and Occam's Razor principles are applied. The task breakdown and JavaScript-specific instructions enhance clarity for implementation. The advice on ORMs and clean code addresses maintainability. The critical complexity of the tax module is repeatedly flagged.

The rewrite is comprehensive and aligns with the user's request for a JavaScript-centric version. The task IDs are new and unique. The instructions within each task are detailed. The critical caveats regarding tax law remain prominent. The overall structure is logical and should provide a solid foundation for development.