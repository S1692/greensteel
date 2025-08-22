import { NextRequest, NextResponse } from 'next/server';

// 피드백 제출 API
export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();
    
    // Gateway를 통해 DataGather 서비스로 요청 전달
    const gatewayUrl = 'http://localhost:8080';
    const feedbackUrl = `${gatewayUrl}/feedback`;
    
    console.log('💬 피드백 제출 요청:', feedbackData);
    console.log('📍 Gateway URL:', feedbackUrl);
    
    const response = await fetch(feedbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ 피드백 제출 오류:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: '피드백 제출 오류', 
          details: errorData,
          status: response.status 
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    console.log('✅ 피드백 제출 성공:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ 피드백 제출 API 오류:', error);
    
    return NextResponse.json(
      { 
        error: '내부 서버 오류', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
