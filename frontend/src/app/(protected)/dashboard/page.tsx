'use client';

import React, { useState, useEffect } from 'react';
import CommonShell from '@/components/common/CommonShell';
import { MessageCircle, Bot, Send, Loader2, Sparkles, Zap, Target, TrendingUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DashboardPage: React.FC = () => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  // Gateway 연결 상태 확인
  useEffect(() => {
    checkGatewayStatus();
  }, []);

  const checkGatewayStatus = async () => {
    try {
      setGatewayStatus('connecting');
      // Gateway를 통해 연결 상태 확인
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE;
      if (!gatewayUrl) {
        console.error('Gateway URL 환경변수가 설정되지 않았습니다.');
        setGatewayStatus('disconnected');
        return;
      }
      const response = await fetch(`${gatewayUrl}/chatbot/health`);
      if (response.ok) {
        setGatewayStatus('connected');
      } else {
        setGatewayStatus('disconnected');
      }
    } catch (error) {
      console.error('Gateway 연결 확인 실패:', error);
      setGatewayStatus('disconnected');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && gatewayStatus === 'connected') {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: chatInput,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setChatInput('');
      setIsLoading(true);

      try {
        // Gateway를 통해 챗봇 서비스 호출
        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE;
        if (!gatewayUrl) {
          console.error('Gateway URL 환경변수가 설정되지 않았습니다.');
          return;
        }
        
        console.log('=== FRONTEND CHATBOT REQUEST DEBUG ===');
        console.log('챗봇 API 호출 URL:', `${gatewayUrl}/chatbot/chat`);
        console.log('Gateway URL 환경변수:', process.env.NEXT_PUBLIC_GATEWAY_URL);
        console.log('API Base 환경변수:', process.env.NEXT_PUBLIC_API_BASE);
        console.log('최종 사용 Gateway URL:', gatewayUrl);
        
        // 요청 데이터 로깅
        const requestData = {
          message: userMessage.content,
          context: 'dashboard',
          session_id: 'dashboard_session',
          user_id: 'dashboard_user'
        };
        console.log('요청 데이터:', requestData);
        console.log('요청 메서드: POST');
        console.log('요청 헤더: Content-Type: application/json');
        console.log('=== END FRONTEND DEBUG ===');
        
        const response = await fetch(`${gatewayUrl}/chatbot/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('=== FRONTEND RESPONSE DEBUG ===');
          console.log('Gateway 응답 상태:', response.status, response.statusText);
          console.log('Gateway 응답 헤더:', Object.fromEntries(response.headers.entries()));
          console.log('Gateway 응답 데이터 (raw):', data);
          console.log('응답 데이터 타입:', typeof data);
          console.log('응답 데이터 키들:', Object.keys(data));
          
          // 챗봇 응답 구조: data.data.response 또는 data.response
          const responseContent = data.data?.response || data.response || '죄송합니다. 응답을 생성할 수 없습니다.';
          
          console.log('추출된 응답 내용:', responseContent);
          console.log('응답 내용 타입:', typeof responseContent);
          console.log('=== END FRONTEND RESPONSE DEBUG ===');
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: responseContent,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          console.log('=== FRONTEND ERROR RESPONSE DEBUG ===');
          console.log('에러 응답 상태:', response.status, response.statusText);
          console.log('에러 응답 헤더:', Object.fromEntries(response.headers.entries()));
          
          const errorData = await response.json().catch(() => ({}));
          console.log('에러 응답 데이터:', errorData);
          console.log('=== END FRONTEND ERROR DEBUG ===');
          
          throw new Error(`API 응답 오류: ${response.status}`);
        }
      } catch (error) {
        console.error('챗봇 API 호출 실패:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <CommonShell>
      <div className='w-full h-full p-4 lg:p-6 xl:p-8 space-y-4 lg:space-y-6 xl:space-y-8'>
        {/* 페이지 헤더 */}
        <div className='flex flex-col gap-2 lg:gap-3'>
          <h1 className='text-xl lg:text-2xl xl:text-3xl font-bold text-white'>GreenSteel AI Assistant</h1>
          <p className='text-white/60 text-xs lg:text-sm'>
            ESG 플랫폼의 모든 기능을 AI와 함께 활용하세요
          </p>
        </div>

        {/* 환영 메시지 */}
        <div className='bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl p-4 lg:p-6 xl:p-8 backdrop-blur-sm'>
          <div className='flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4'>
            <div className='p-2 lg:p-3 bg-blue-500/20 rounded-lg'>
              <Sparkles className='w-5 h-5 lg:w-6 lg:h-6 text-blue-400' />
            </div>
            <h2 className='text-lg lg:text-xl xl:text-2xl font-semibold text-white'>
              AI 어시스턴트와 대화하세요
            </h2>
          </div>
          <p className='text-white/80 text-xs lg:text-sm leading-relaxed'>
            GreenSteel ESG 플랫폼의 모든 기능에 대해 질문하고, 데이터 분석부터 CBAM 계산까지 
            AI가 도와드립니다. 자연어로 원하는 기능을 말씀해주세요.
          </p>
        </div>

        {/* AI 기능 소개 */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 xl:gap-6'>
          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 lg:p-4 xl:p-6 hover:bg-white/10 transition-all duration-200'>
            <div className='flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3'>
              <div className='p-2 lg:p-3 bg-blue-500/20 rounded-lg'>
                <Target className='w-4 h-4 lg:w-5 lg:h-5 text-blue-400' />
              </div>
              <h3 className='font-semibold text-white text-xs lg:text-sm'>정확한 답변</h3>
            </div>
            <p className='text-white/60 text-xs'>플랫폼 정보 기반 정확한 답변 제공</p>
          </div>

          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 lg:p-4 xl:p-6 hover:bg-white/10 transition-all duration-200'>
            <div className='flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3'>
              <div className='p-2 lg:p-3 bg-green-500/20 rounded-lg'>
                <Zap className='w-4 h-4 lg:w-5 lg:h-5 text-green-400' />
              </div>
              <h3 className='font-semibold text-white text-xs lg:text-sm'>빠른 응답</h3>
            </div>
            <p className='text-white/60 text-xs'>실시간 AI 응답으로 즉시 문제 해결</p>
          </div>

          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 lg:p-4 xl:p-6 hover:bg-white/10 transition-all duration-200'>
            <div className='flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3'>
              <div className='p-2 lg:p-3 bg-purple-500/20 rounded-lg'>
                <TrendingUp className='w-4 h-4 lg:w-5 lg:h-5 text-purple-400' />
              </div>
              <h3 className='font-semibold text-white text-xs lg:text-sm'>지능형 가이드</h3>
            </div>
            <p className='text-white/60 text-xs'>맞춤형 기능 추천 및 사용법 안내</p>
          </div>
        </div>

        {/* Gateway 상태 */}
        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 xl:p-8'>
          <h3 className='text-base lg:text-lg xl:text-xl font-semibold text-white mb-3 lg:mb-4 xl:mb-6 flex items-center gap-2'>
            <Bot className='w-5 h-5 lg:w-6 lg:h-6 text-blue-400' />
            챗봇 서비스 상태
          </h3>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className={`w-3 h-3 rounded-full ${
                gatewayStatus === 'connected' ? 'bg-green-400' : 
                gatewayStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className={`text-xs lg:text-sm font-medium ${
                gatewayStatus === 'connected' ? 'text-green-400' : 
                gatewayStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {gatewayStatus === 'connected' ? '챗봇 서비스 연결됨' : 
                 gatewayStatus === 'connecting' ? '연결 중...' : '챗봇 서비스 연결 안됨'}
              </span>
            </div>
            <button
              onClick={checkGatewayStatus}
              className='px-2 py-1 lg:px-3 lg:py-2 bg-white/10 text-white text-xs lg:text-sm rounded-md hover:bg-white/20 transition-colors border border-white/20'
            >
              상태 확인
            </button>
          </div>
          <div className='mt-2 text-xs text-white/50'>
            Gateway 주소: {process.env.NEXT_PUBLIC_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE || '환경변수 미설정'}
          </div>
        </div>

        {/* 메인 챗봇 인터페이스 */}
        <div className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded-xl p-4 lg:p-6 xl:p-8 backdrop-blur-sm'>
          <div className='text-center mb-4 lg:mb-6 xl:mb-8'>
            <div className='flex items-center justify-center gap-2 lg:gap-3 mb-2 lg:mb-3'>
              <MessageCircle className='w-6 h-6 lg:w-8 lg:h-8 text-blue-400' />
              <h3 className='text-xl lg:text-2xl xl:text-3xl font-bold text-white'>
                어떤 기능이 필요하신가요?
              </h3>
            </div>
            <p className='text-white/70 text-xs lg:text-sm'>
              LCA 분석, CBAM 계산, 데이터 업로드 등 원하는 기능을 자연어로 질문해보세요
            </p>
          </div>

          {/* 대화 히스토리 */}
          {messages.length > 0 && (
            <div className='max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto mb-4 lg:mb-6 text-left'>
              <div className='bg-white/5 backdrop-blur-sm rounded-lg p-3 lg:p-4 max-h-64 lg:max-h-72 xl:max-h-80 overflow-y-auto border border-white/10'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 lg:mb-4 p-3 lg:p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500/20 text-white ml-4 lg:ml-6 xl:ml-8 border border-blue-400/30'
                        : 'bg-white/10 text-white mr-4 lg:mr-6 xl:mr-8 border border-white/20'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      {message.type === 'user' ? (
                        <>
                          <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                            <span className='text-xs font-bold'>U</span>
                          </div>
                          <span className='text-xs lg:text-sm font-medium text-blue-300'>사용자</span>
                        </>
                      ) : (
                        <>
                          <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                            <Bot className='w-3 h-3 text-white' />
                          </div>
                          <span className='text-xs lg:text-sm font-medium text-green-300'>GreenSteel AI</span>
                        </>
                      )}
                    </div>
                    <div className='text-xs lg:text-sm leading-relaxed'>
                      {message.type === 'user' ? (
                        <span>{message.content}</span>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: message.content }} />
                      )}
                    </div>
                    <div className='text-xs text-white/50 mt-2'>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className='flex items-center space-x-2 text-white/70 p-3 lg:p-4'>
                    <Loader2 className='w-4 h-5 lg:w-5 lg:h-6 animate-spin' />
                    <span className='text-xs lg:text-sm'>AI가 응답을 생성하고 있습니다...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 챗봇 입력 폼 */}
          <form onSubmit={handleChatSubmit} className='max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto'>
            <div className='flex space-x-2 lg:space-x-3'>
              <input
                type='text'
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='예: LCA 분석을 어떻게 시작하나요? CBAM 계산은 어디서 하나요?'
                className='flex-1 px-3 py-2 lg:px-4 lg:py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs lg:text-sm text-white placeholder-white/50 backdrop-blur-sm'
                disabled={gatewayStatus !== 'connected' || isLoading}
              />
              <button
                type='submit'
                disabled={!chatInput.trim() || gatewayStatus !== 'connected' || isLoading}
                className='px-4 py-2 lg:px-5 lg:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs lg:text-sm font-medium transition-colors flex items-center gap-2'
              >
                <Send className='w-3 h-3 lg:w-4 lg:h-4' />
                전송
              </button>
            </div>
          </form>

          {gatewayStatus !== 'connected' && (
            <div className='mt-3 lg:mt-4 text-center'>
              <div className='inline-flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-lg'>
                <div className='w-2 h-2 bg-red-400 rounded-full'></div>
                <span className='text-xs lg:text-sm text-red-400'>
                  AI 서비스가 연결되지 않았습니다. 챗봇 기능을 사용할 수 없습니다.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 빠른 액세스 링크 */}
        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 lg:p-6 xl:p-8'>
          <h3 className='text-base lg:text-lg xl:text-xl font-semibold text-white mb-3 lg:mb-4 xl:mb-6 flex items-center gap-2'>
            <Zap className='w-5 h-5 lg:w-6 lg:h-6 text-blue-400' />
            주요 기능 바로가기
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4'>
            <a href='/lca' className='flex items-center space-x-2 p-3 lg:p-4 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30'>
              <div className='w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center'>
                <span className='text-blue-300 text-sm font-bold'>L</span>
              </div>
              <span className='text-xs lg:text-sm font-medium text-blue-300'>LCA 분석</span>
            </a>
            <a href='/cbam' className='flex items-center space-x-2 p-3 lg:p-4 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/30'>
              <div className='w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center'>
                <span className='text-green-300 text-sm font-bold'>C</span>
              </div>
              <span className='text-xs lg:text-sm font-medium text-green-300'>CBAM 관리</span>
            </a>
            <a href='/data-upload' className='flex items-center space-x-2 p-3 lg:p-4 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/30'>
              <div className='w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center'>
                <span className='text-purple-300 text-sm font-bold'>D</span>
              </div>
              <span className='text-xs lg:text-sm font-medium text-purple-300'>데이터 업로드</span>
            </a>
            <a href='/settings' className='flex items-center space-x-2 p-3 lg:p-4 bg-orange-500/20 rounded-lg hover:bg-orange-500/30 transition-colors border border-orange-400/30'>
              <div className='w-8 h-8 bg-orange-500/30 rounded-lg flex items-center justify-center'>
                <span className='text-orange-300 text-sm font-bold'>S</span>
              </div>
              <span className='text-xs lg:text-sm font-medium text-orange-300'>설정</span>
            </a>
          </div>
        </div>
      </div>
    </CommonShell>
  );
};

export default DashboardPage;
