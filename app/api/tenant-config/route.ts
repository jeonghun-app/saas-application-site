import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    console.log('🌐 Proxy API Request for tenantId:', tenantId);
    
    // AWS API Gateway URL
    const controlPlaneUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL || 'https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/';
    const apiUrl = `${controlPlaneUrl}tenant-config?tenantId=${encodeURIComponent(tenantId)}`;
    
    console.log('🌐 Forwarding to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🌐 AWS API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌐 AWS API Error:', errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🌐 AWS API Success:', data);
    
    // CORS 헤더 추가
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('🌐 Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 