/**
 * Integration tests for VT Transaction Plus API
 *
 * To run these tests:
 * npm test app/api/vt-invoice/__tests__/route.test.ts
 *
 * Note: These tests mock the Python automation to avoid requiring VT Transaction Plus
 */

import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock child_process spawn
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

const { spawn } = require('child_process');

describe('VT Invoice API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.VT_REMOTE_SERVER_URL;
  });

  describe('POST /api/vt-invoice', () => {
    describe('Request validation', () => {
      it('should reject request without command or structured data', async () => {
        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({})
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('required');
      });

      it('should accept natural language command', async () => {
        // Mock successful Python execution
        mockPythonSuccess({
          success: true,
          message: 'Invoice created',
          details: {
            customer: 'Test Customer',
            amount: 100,
            vat_rate: 20,
            description: ''
          }
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test Customer for £100'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(spawn).toHaveBeenCalled();
      });

      it('should accept structured data', async () => {
        mockPythonSuccess({
          success: true,
          message: 'Invoice created',
          details: {
            customer: 'Test Customer',
            amount: 100,
            vat_rate: 20,
            description: 'Test'
          }
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            customer_name: 'Test Customer',
            amount: 100,
            description: 'Test description'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });

    describe('Local mode (direct Python execution)', () => {
      it('should execute Python script with command', async () => {
        mockPythonSuccess({
          success: true,
          message: 'Invoice created'
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to GT Bar Services for £100'
          })
        });

        await POST(request);

        expect(spawn).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([
            expect.stringContaining('vt_automation.py'),
            'create invoice to GT Bar Services for £100'
          ])
        );
      });

      it('should convert structured data to command format', async () => {
        mockPythonSuccess({
          success: true,
          message: 'Invoice created'
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            customer_name: 'GT Bar Services',
            amount: 100,
            description: 'Test services'
          })
        });

        await POST(request);

        const callArgs = spawn.mock.calls[0][1];
        const command = callArgs[1];

        expect(command).toContain('GT Bar Services');
        expect(command).toContain('£100');
      });

      it('should handle Python script errors', async () => {
        mockPythonError('VT Transaction Plus not found');

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test for £100'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBeTruthy();
      });

      it('should handle Python script timeout', async () => {
        mockPythonTimeout();

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test for £100'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });
    });

    describe('Remote mode (Windows server)', () => {
      beforeEach(() => {
        process.env.VT_REMOTE_SERVER_URL = 'http://localhost:5050';
        global.fetch = jest.fn();
      });

      afterEach(() => {
        delete process.env.VT_REMOTE_SERVER_URL;
      });

      it('should call remote server when VT_REMOTE_SERVER_URL is set', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            message: 'Invoice created remotely'
          })
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test for £100'
          })
        });

        await POST(request);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:5050/create-invoice',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });

      it('should handle remote server errors', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          statusText: 'Internal Server Error'
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test for £100'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });

      it('should handle remote server connection failure', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(
          new Error('Connection refused')
        );

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'POST',
          body: JSON.stringify({
            command: 'create invoice to Test for £100'
          })
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toContain('connect');
      });
    });
  });

  describe('GET /api/vt-invoice', () => {
    describe('Local mode', () => {
      it('should test local connection successfully', async () => {
        mockPythonSuccess(null, 0);

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'GET'
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.connected).toBe(true);
      });

      it('should report connection failure', async () => {
        mockPythonError('Connection failed', 1);

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'GET'
        });

        const response = await GET(request);
        const data = await response.json();

        expect(data.connected).toBe(false);
      });
    });

    describe('Remote mode', () => {
      beforeEach(() => {
        process.env.VT_REMOTE_SERVER_URL = 'http://localhost:5050';
        global.fetch = jest.fn();
      });

      it('should check remote server connection', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({
            connected: true,
            message: 'Connected'
          })
        });

        const request = new NextRequest('http://localhost:3000/api/vt-invoice', {
          method: 'GET'
        });

        await GET(request);

        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:5050/test-connection'
        );
      });
    });
  });
});

// Helper functions to mock Python execution

function mockPythonSuccess(jsonOutput: any = null, exitCode: number = 0) {
  const mockProcess = {
    stdout: {
      on: jest.fn((event, callback) => {
        if (event === 'data' && jsonOutput) {
          callback(Buffer.from(JSON.stringify(jsonOutput)));
        }
      })
    },
    stderr: {
      on: jest.fn()
    },
    on: jest.fn((event, callback) => {
      if (event === 'close') {
        callback(exitCode);
      }
    })
  };

  spawn.mockReturnValue(mockProcess);
}

function mockPythonError(errorMessage: string, exitCode: number = 1) {
  const mockProcess = {
    stdout: {
      on: jest.fn()
    },
    stderr: {
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from(errorMessage));
        }
      })
    },
    on: jest.fn((event, callback) => {
      if (event === 'close') {
        callback(exitCode);
      }
    })
  };

  spawn.mockReturnValue(mockProcess);
}

function mockPythonTimeout() {
  const mockProcess = {
    stdout: {
      on: jest.fn()
    },
    stderr: {
      on: jest.fn()
    },
    on: jest.fn((event, callback) => {
      if (event === 'error') {
        callback(new Error('Timeout'));
      }
    })
  };

  spawn.mockReturnValue(mockProcess);
}
