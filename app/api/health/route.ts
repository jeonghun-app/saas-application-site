import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/lib/utils/error-handler';

export async function GET() {
  try {
    const healthCheck = await performHealthCheck();
    
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        checks: {
          environment: false,
          database: false,
          externalApi: false,
        },
        errors: ['Health check system failure'],
      },
      { status: 503 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
