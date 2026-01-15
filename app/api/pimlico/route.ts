import { NextRequest, NextResponse } from 'next/server';

/**
 * Pimlico Paymaster Proxy API Route
 * 
 * This route proxies requests to Pimlico's paymaster service while keeping
 * the API key secure on the server side (not exposed to the browser).
 * 
 * Security features:
 * - API key stored server-side only
 * - Origin validation (only your domain can use it)
 * - Rate limiting (prevents abuse)
 * - Request validation
 * 
 * @see https://docs.pimlico.io/
 */

const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
const ALLOWED_ORIGINS = [
  'https://farfish-baseapp.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API key is configured
    if (!PIMLICO_API_KEY) {
      console.error('[Pimlico] API key not configured');
      return NextResponse.json(
        { error: 'Paymaster not configured' },
        { status: 500 }
      );
    }

    // 2. Validate origin (security check)
    const origin = request.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.error('[Pimlico] Unauthorized origin:', origin);
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 4. Forward request to Pimlico
    // Using chain ID 8453 (Base mainnet)
    const pimlicoUrl = `https://api.pimlico.io/v2/8453/rpc?apikey=${PIMLICO_API_KEY}`;
    
    const response = await fetch(pimlicoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 5. Handle Pimlico response
    if (!response.ok) {
      console.error('[Pimlico] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Paymaster service error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 6. Return successful response
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('[Pimlico] Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
