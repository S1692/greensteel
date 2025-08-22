import { NextRequest, NextResponse } from 'next/server';

// AI 처리 요청 API
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Gateway를 통해 DataGather 서비스로 요청 전달
    const gatewayUrl = 'http://localhost:8080';
    const aiProcessUrl = `${gatewayUrl}/ai-process`;
    
    console.log('🤖 AI 처리 요청:', data);
    console.log('📍 Gateway URL:', aiProcessUrl);
    
    const response = await fetch(aiProcessUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ AI 처리 오류:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: 'AI 처리 오류', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('✅ AI 처리 성공:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ AI 처리 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '내부 서버 오류', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
