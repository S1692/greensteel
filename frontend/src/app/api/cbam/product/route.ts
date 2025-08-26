import { NextRequest, NextResponse } from 'next/server';

// CBAM 제품 생성 API
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    
    // Gateway를 통해 CBAM 서비스로 요청 전달
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080';
    const cbamServiceUrl = `${gatewayUrl}/cbam/product`;
    
    console.log('🚀 CBAM 제품 생성 요청:', productData);
    console.log('📍 Gateway URL:', cbamServiceUrl);
    
    const response = await fetch(cbamServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ CBAM 서비스 오류:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: 'CBAM 서비스 오류', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('✅ CBAM 제품 생성 성공:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ CBAM 제품 생성 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '내부 서버 오류', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// CBAM 제품 목록 조회 API
export async function GET() {
  try {
    const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:8080';
    const cbamServiceUrl = `${gatewayUrl}/cbam/products`;
    
    console.log('📋 CBAM 제품 목록 조회 요청');
    console.log('📍 Gateway URL:', cbamServiceUrl);
    
    const response = await fetch(cbamServiceUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ CBAM 서비스 오류:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: 'CBAM 서비스 오류', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('✅ CBAM 제품 목록 조회 성공:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ CBAM 제품 목록 조회 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '내부 서버 오류', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
