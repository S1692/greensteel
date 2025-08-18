import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId } = await request.json();

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 여기서 실제로는 데이터베이스에 구독 정보를 저장합니다
    // 현재는 로그만 출력
    console.log('Push notification subscription received:', {
      userId,
      subscription: subscription.endpoint,
      keys: subscription.keys,
    });

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: 'Push notification subscription successful',
      subscriptionId: `sub_${Date.now()}`,
    });

  } catch (error) {
    console.error('Error processing push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // 여기서 실제로는 데이터베이스에서 구독 정보를 삭제합니다
    console.log('Push notification unsubscription requested for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Push notification unsubscription successful',
    });

  } catch (error) {
    console.error('Error processing push unsubscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
