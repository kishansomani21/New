import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

/**
 * API endpoint to create invoices in VT Transaction Plus
 * POST /api/vt-invoice
 *
 * Body:
 * {
 *   "command": "create invoice to GT Bar Services for £100"
 * }
 *
 * OR
 *
 * {
 *   "customer_name": "GT Bar Services",
 *   "amount": 100,
 *   "description": "Services rendered",
 *   "vat_rate": 20
 * }
 */

interface InvoiceRequest {
  command?: string;
  customer_name?: string;
  amount?: number;
  description?: string;
  vat_rate?: number;
  invoice_date?: string;
}

interface InvoiceResult {
  success: boolean;
  message: string;
  details?: {
    customer: string;
    amount: number;
    vat_rate: number;
    description: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceRequest = await request.json();

    // Validate request
    if (!body.command && (!body.customer_name || !body.amount)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either "command" or "customer_name" and "amount" are required'
        },
        { status: 400 }
      );
    }

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'automation', 'vt_automation.py');
    const pythonPath = process.env.PYTHON_PATH || 'python';

    // Build command
    let args: string[];
    if (body.command) {
      // Natural language command
      args = [scriptPath, body.command];
    } else {
      // Structured data - convert to command format
      const command = `create invoice to ${body.customer_name} for £${body.amount}${
        body.description ? ` description: ${body.description}` : ''
      }`;
      args = [scriptPath, command];
    }

    console.log('Executing Python script:', pythonPath, args);

    // Execute Python script
    const result = await executePythonScript(pythonPath, args);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in VT invoice API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Execute Python automation script
 */
function executePythonScript(
  pythonPath: string,
  args: string[]
): Promise<InvoiceResult> {
  return new Promise((resolve, reject) => {
    const python = spawn(pythonPath, args);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        try {
          // Parse JSON output from Python script
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          resolve({
            success: true,
            message: stdout.trim() || 'Invoice created successfully',
          });
        }
      } else {
        reject(new Error(stderr || `Python script exited with code ${code}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to execute Python script: ${error.message}`));
    });
  });
}

/**
 * GET endpoint to check VT connection status
 */
export async function GET(request: NextRequest) {
  try {
    const scriptPath = path.join(process.cwd(), 'automation', 'vt_automation.py');
    const pythonPath = process.env.PYTHON_PATH || 'python';

    const python = spawn(pythonPath, [scriptPath, '--test-connection']);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    return new Promise((resolve) => {
      python.on('close', (code) => {
        resolve(
          NextResponse.json({
            connected: code === 0,
            message: stdout.trim() || stderr.trim() || 'Connection test completed',
          })
        );
      });
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
