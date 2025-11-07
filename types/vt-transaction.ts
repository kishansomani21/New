/**
 * VT Transaction Plus API Types
 *
 * Type definitions for the VT Transaction Plus automation API
 */

/**
 * Invoice request using natural language command
 */
export interface InvoiceCommandRequest {
  command: string;
}

/**
 * Invoice request using structured data
 */
export interface InvoiceStructuredRequest {
  customer_name: string;
  amount: number;
  description?: string;
  vat_rate?: number;
  invoice_date?: string;
}

/**
 * Combined invoice request type
 * Either command OR structured data must be provided
 */
export type InvoiceRequest =
  | InvoiceCommandRequest
  | InvoiceStructuredRequest;

/**
 * Invoice details returned on success
 */
export interface InvoiceDetails {
  customer: string;
  amount: number;
  vat_rate: number;
  description: string;
}

/**
 * Successful invoice creation response
 */
export interface InvoiceSuccessResponse {
  success: true;
  message: string;
  details: InvoiceDetails;
}

/**
 * Failed invoice creation response
 */
export interface InvoiceErrorResponse {
  success: false;
  message?: string;
  error: string;
}

/**
 * Invoice creation response (success or error)
 */
export type InvoiceResponse =
  | InvoiceSuccessResponse
  | InvoiceErrorResponse;

/**
 * VT connection status response
 */
export interface ConnectionStatusResponse {
  connected: boolean;
  message: string;
  error?: string;
}

/**
 * Health check response (for remote server)
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  version: string;
}

/**
 * Invoice data parsed from natural language command
 */
export interface ParsedInvoiceData {
  customer_name: string;
  amount: number;
  description?: string;
}

/**
 * VT automation configuration
 */
export interface VTConfig {
  window_title: string;
  sin_button_image: string | null;
  delays: {
    short: number;
    medium: number;
    long: number;
  };
  coordinates: {
    sin_button: [number, number] | null;
    customer_field: [number, number] | null;
    amount_field: [number, number] | null;
    description_field: [number, number] | null;
    save_button: [number, number] | null;
  };
  vat_rate?: number;
}

/**
 * Type guard to check if request uses command format
 */
export function isCommandRequest(
  request: InvoiceRequest
): request is InvoiceCommandRequest {
  return 'command' in request;
}

/**
 * Type guard to check if request uses structured format
 */
export function isStructuredRequest(
  request: InvoiceRequest
): request is InvoiceStructuredRequest {
  return 'customer_name' in request && 'amount' in request;
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse(
  response: InvoiceResponse
): response is InvoiceSuccessResponse {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: InvoiceResponse
): response is InvoiceErrorResponse {
  return response.success === false;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validates an invoice request
 */
export function validateInvoiceRequest(
  request: unknown
): ValidationResult {
  const errors: string[] = [];

  if (!request || typeof request !== 'object') {
    return {
      valid: false,
      errors: ['Request must be an object']
    };
  }

  const req = request as any;

  // Check if either command or structured data is provided
  const hasCommand = 'command' in req;
  const hasStructured = 'customer_name' in req && 'amount' in req;

  if (!hasCommand && !hasStructured) {
    errors.push('Either "command" or "customer_name" and "amount" are required');
  }

  // Validate command format
  if (hasCommand) {
    if (typeof req.command !== 'string' || req.command.trim().length === 0) {
      errors.push('Command must be a non-empty string');
    }
  }

  // Validate structured format
  if (hasStructured) {
    if (typeof req.customer_name !== 'string' || req.customer_name.trim().length === 0) {
      errors.push('Customer name must be a non-empty string');
    }

    if (typeof req.amount !== 'number' || req.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (req.description !== undefined && typeof req.description !== 'string') {
      errors.push('Description must be a string if provided');
    }

    if (req.vat_rate !== undefined) {
      if (typeof req.vat_rate !== 'number' || req.vat_rate < 0 || req.vat_rate > 100) {
        errors.push('VAT rate must be a number between 0 and 100');
      }
    }

    if (req.invoice_date !== undefined) {
      if (typeof req.invoice_date !== 'string') {
        errors.push('Invoice date must be a string in DD/MM/YYYY format');
      } else {
        // Validate date format (basic check)
        const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!datePattern.test(req.invoice_date)) {
          errors.push('Invoice date must be in DD/MM/YYYY format');
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Common error messages
 */
export const VTErrorMessages = {
  CONNECTION_FAILED: 'Failed to connect to VT Transaction Plus',
  VT_NOT_RUNNING: 'VT Transaction Plus is not running',
  BUTTON_CLICK_FAILED: 'Failed to click SIN button',
  CUSTOMER_SELECT_FAILED: 'Failed to select customer',
  INVOICE_DETAILS_FAILED: 'Failed to enter invoice details',
  SAVE_FAILED: 'Failed to save invoice',
  PARSE_FAILED: 'Could not parse invoice command',
  INVALID_COMMAND: 'Invalid command format',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  CALIBRATION_NEEDED: 'UI calibration needed - run: python vt_automation.py --calibrate',
  REMOTE_SERVER_UNAVAILABLE: 'Remote VT server is unavailable',
  PYTHON_NOT_FOUND: 'Python executable not found',
  UNKNOWN_ERROR: 'An unknown error occurred'
} as const;

/**
 * VT error type
 */
export type VTErrorMessage = typeof VTErrorMessages[keyof typeof VTErrorMessages];
