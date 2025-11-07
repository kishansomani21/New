/**
 * Claude AI Document Extraction Service
 *
 * Uses Anthropic's Claude API to extract transaction data from
 * bank statements and rental income documents with high accuracy.
 *
 * MTD ITSA compliant: Extracts date, amount, and category for each transaction.
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  Transaction,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  ExtractionResult,
} from './mtd-types';
import {
  getIncomeCategoryCodes,
  getExpenseCategoryCodes,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from './hmrc-categories';

// ============================================
// CLAUDE API CLIENT
// ============================================

let anthropic: Anthropic | null = null;

function getClaudeClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY not found in environment variables. Please add it to your .env file.'
      );
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

// ============================================
// EXTRACTION PROMPT
// ============================================

function buildExtractionPrompt(): string {
  const incomeCategories = getIncomeCategoryCodes()
    .map((code) => {
      const def = INCOME_CATEGORIES[code];
      return `- ${code}: ${def.description}`;
    })
    .join('\n');

  const expenseCategories = getExpenseCategoryCodes()
    .map((code) => {
      const def = EXPENSE_CATEGORIES[code];
      return `- ${code}: ${def.description}`;
    })
    .join('\n');

  return `You are a UK tax specialist AI assistant helping with MTD ITSA (Making Tax Digital for Income Tax Self Assessment) compliance.

Your task is to extract transaction data from bank statements, estate agent statements, or other financial documents with MAXIMUM ACCURACY.

For EACH transaction, you must extract:
1. **Date** (format: YYYY-MM-DD)
2. **Amount** (in GBP, as a positive number)
3. **Description** (the transaction description)
4. **Type** (INCOME or EXPENSE)
5. **Category** (HMRC-compliant category code - see below)
6. **Business Purpose** (brief explanation of why this is business income/expense)
7. **Confidence** (0.0 to 1.0, how confident you are about the categorization)

**INCOME CATEGORIES:**
${incomeCategories}

**EXPENSE CATEGORIES:**
${expenseCategories}

**IMPORTANT RULES:**
- Only extract transactions that appear to be business-related (self-employment or property rental)
- Ignore personal/non-business transactions
- For repairs vs improvements: Repairs = allowable, Improvements = NOT allowable
- Mortgage INTEREST is allowable (with restrictions), CAPITAL repayments are NOT
- Employee wages are allowable, but NOT your own drawings/salary
- Be conservative: If unsure whether something is business, set confidence < 0.6
- Dates MUST be in ISO format (YYYY-MM-DD)
- Amounts should be positive numbers (no currency symbols)
- Description should be the original transaction description from the document

**OUTPUT FORMAT:**
Return ONLY a valid JSON array of transactions. No markdown, no explanation, just the JSON array.

Example:
[
  {
    "date": "2025-04-15",
    "amount": 2500.00,
    "description": "Rental income - 123 High Street",
    "type": "INCOME",
    "category": "PROPERTY_RENTAL_INCOME",
    "businessPurpose": "Monthly rent from tenant at 123 High Street",
    "confidence": 0.95
  },
  {
    "date": "2025-04-20",
    "amount": 150.00,
    "description": "Plumber - boiler repair",
    "type": "EXPENSE",
    "category": "PROPERTY_MAINTENANCE",
    "businessPurpose": "Repair to rental property boiler (not improvement)",
    "confidence": 0.90
  }
]

Now, extract all business transactions from the provided document with maximum accuracy.`;
}

// ============================================
// DOCUMENT EXTRACTION
// ============================================

/**
 * Extract transactions from an image (base64 encoded)
 * @param imageBase64 - Base64 encoded image
 * @param mediaType - Image media type (e.g., 'image/jpeg', 'image/png', 'image/pdf')
 * @param sourceFileName - Original file name for reference
 * @returns Extraction result with transactions
 */
export async function extractTransactionsFromImage(
  imageBase64: string,
  mediaType: string,
  sourceFileName: string
): Promise<ExtractionResult> {
  const client = getClaudeClient();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Latest Claude with vision
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: buildExtractionPrompt(),
            },
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    const jsonText = textContent.text.trim();

    // Remove markdown code blocks if present
    let cleanedJson = jsonText;
    if (jsonText.startsWith('```')) {
      cleanedJson = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
    }

    const extractedData = JSON.parse(cleanedJson);

    if (!Array.isArray(extractedData)) {
      throw new Error('Expected array of transactions from Claude');
    }

    // Validate and process transactions
    const transactions: Transaction[] = extractedData.map((item: any, index: number) => {
      // Generate unique ID
      const id = `txn_${Date.now()}_${index}`;

      // Validate required fields
      if (!item.date || !item.amount || !item.type || !item.category) {
        throw new Error(`Transaction ${index} missing required fields`);
      }

      // Validate type
      if (item.type !== 'INCOME' && item.type !== 'EXPENSE') {
        throw new Error(`Invalid transaction type: ${item.type}`);
      }

      // Validate category
      const validCategories = [
        ...getIncomeCategoryCodes(),
        ...getExpenseCategoryCodes(),
      ];
      if (!validCategories.includes(item.category)) {
        throw new Error(`Invalid category: ${item.category}`);
      }

      return {
        id,
        date: item.date,
        amount: parseFloat(item.amount),
        description: item.description || '',
        type: item.type as TransactionType,
        category: item.category as IncomeCategory | ExpenseCategory,
        businessPurpose: item.businessPurpose || '',
        confidence: parseFloat(item.confidence) || 0.5,
        extractedFrom: sourceFileName,
      };
    });

    // Calculate summary
    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const highConfidence = transactions.filter((t) => t.confidence > 0.8).length;
    const lowConfidence = transactions.filter((t) => t.confidence < 0.6).length;

    // Generate warnings
    const warnings: string[] = [];
    if (lowConfidence > 0) {
      warnings.push(
        `${lowConfidence} transaction(s) have low confidence (<0.6). Please review carefully.`
      );
    }
    if (totalTransactions === 0) {
      warnings.push('No transactions extracted. The document may not contain business transactions.');
    }

    return {
      transactions,
      summary: {
        totalTransactions,
        totalIncome,
        totalExpenses,
        highConfidence,
        lowConfidence,
      },
      warnings,
    };
  } catch (error: any) {
    console.error('Claude extraction error:', error);
    throw new Error(`Failed to extract transactions: ${error.message}`);
  }
}

/**
 * Extract transactions from a PDF document
 * @param pdfBuffer - PDF file buffer
 * @param sourceFileName - Original file name for reference
 * @returns Extraction result with transactions
 */
export async function extractTransactionsFromPDF(
  pdfBuffer: Buffer,
  sourceFileName: string
): Promise<ExtractionResult> {
  // Convert PDF to base64
  const base64 = pdfBuffer.toString('base64');

  // Use Claude with PDF support
  return extractTransactionsFromImage(base64, 'application/pdf', sourceFileName);
}

/**
 * Extract transactions from text (for testing or pre-extracted text)
 * @param text - Text content
 * @param sourceFileName - Original file name for reference
 * @returns Extraction result with transactions
 */
export async function extractTransactionsFromText(
  text: string,
  sourceFileName: string
): Promise<ExtractionResult> {
  const client = getClaudeClient();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${buildExtractionPrompt()}\n\n**DOCUMENT TEXT:**\n${text}`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const jsonText = textContent.text.trim();
    let cleanedJson = jsonText;
    if (jsonText.startsWith('```')) {
      cleanedJson = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '').trim();
    }

    const extractedData = JSON.parse(cleanedJson);

    if (!Array.isArray(extractedData)) {
      throw new Error('Expected array of transactions from Claude');
    }

    const transactions: Transaction[] = extractedData.map((item: any, index: number) => {
      const id = `txn_${Date.now()}_${index}`;

      return {
        id,
        date: item.date,
        amount: parseFloat(item.amount),
        description: item.description || '',
        type: item.type as TransactionType,
        category: item.category as IncomeCategory | ExpenseCategory,
        businessPurpose: item.businessPurpose || '',
        confidence: parseFloat(item.confidence) || 0.5,
        extractedFrom: sourceFileName,
      };
    });

    const totalTransactions = transactions.length;
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const highConfidence = transactions.filter((t) => t.confidence > 0.8).length;
    const lowConfidence = transactions.filter((t) => t.confidence < 0.6).length;

    const warnings: string[] = [];
    if (lowConfidence > 0) {
      warnings.push(
        `${lowConfidence} transaction(s) have low confidence (<0.6). Please review.`
      );
    }

    return {
      transactions,
      summary: {
        totalTransactions,
        totalIncome,
        totalExpenses,
        highConfidence,
        lowConfidence,
      },
      warnings,
    };
  } catch (error: any) {
    console.error('Claude extraction error:', error);
    throw new Error(`Failed to extract transactions: ${error.message}`);
  }
}

/**
 * Validate extracted transactions
 * @param transactions - Transactions to validate
 * @returns Validation errors (empty array if valid)
 */
export function validateTransactions(transactions: Transaction[]): string[] {
  const errors: string[] = [];

  transactions.forEach((txn, index) => {
    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(txn.date)) {
      errors.push(`Transaction ${index + 1}: Invalid date format (${txn.date})`);
    }

    // Check amount is positive
    if (txn.amount <= 0) {
      errors.push(`Transaction ${index + 1}: Amount must be positive (${txn.amount})`);
    }

    // Check type
    if (txn.type !== 'INCOME' && txn.type !== 'EXPENSE') {
      errors.push(`Transaction ${index + 1}: Invalid type (${txn.type})`);
    }

    // Check category is valid
    const validCategories = [
      ...getIncomeCategoryCodes(),
      ...getExpenseCategoryCodes(),
    ];
    if (!validCategories.includes(txn.category as any)) {
      errors.push(`Transaction ${index + 1}: Invalid category (${txn.category})`);
    }

    // Check confidence range
    if (txn.confidence < 0 || txn.confidence > 1) {
      errors.push(
        `Transaction ${index + 1}: Confidence must be 0-1 (${txn.confidence})`
      );
    }
  });

  return errors;
}
