import type { Request, Response } from 'express';

/**
 * GET /api/health
 * Returns server health status.
 */
export function healthHandler(req: Request, res: Response): void {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'production',
  });
}
