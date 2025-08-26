import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from app.common.settings import settings
from app.common.logger import chatbot_logger
from app.domain.schemas.chatbot import ChatMessage, ChatSession

class ChatbotService:
    """챗봇 서비스 - OpenAI와 LangChain을 활용한 ESG 플랫폼 지원"""
    
    def __init__(self):
        self.llm: Optional[ChatOpenAI] = None
        self.memory: Optional[ConversationBufferMemory] = None
        self.chat_chain: Optional[LLMChain] = None
        self.sessions: Dict[str, ChatSession] = {}
        self.system_prompt = self._get_system_prompt()
        
    async def initialize(self):
        """LangChain과 OpenAI 초기화"""
        try:
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API 키가 설정되지 않았습니다.")
            
            # OpenAI LLM 초기화
            self.llm = ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_MODEL,
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            # 대화 메모리 초기화
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # 프롬프트 템플릿 생성
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", self.system_prompt),
                ("human", "{input}"),
                ("ai", "{output}")
            ])
            
            # LLM 체인 생성
            self.chat_chain = LLMChain(
                llm=self.llm,
                prompt=prompt_template,
                memory=self.memory
            )
            
            chatbot_logger.info("ChatbotService 초기화 완료")
            
        except Exception as e:
            chatbot_logger.error(f"ChatbotService 초기화 실패: {str(e)}")
            raise
    
    def _get_system_prompt(self) -> str:
        """GreenSteel ESG 플랫폼을 위한 시스템 프롬프트"""
        return """
당신은 GreenSteel ESG 플랫폼의 AI 어시스턴트입니다. 

**중요: 당신이 가진 정보는 오직 아래에 나열된 내용뿐입니다. 이 정보를 벗어나는 질문에 대해서는 "죄송합니다. 해당 정보는 제공할 수 없습니다."라고 답변하고, 유사한 기능이 있는지 안내해주세요.**

**GreenSteel ESG 플랫폼 정보 (당신이 가진 모든 정보):**

**1. 데이터 입력 및 관리:**
- 데이터 업로드 페이지에서 5개 탭으로 데이터 관리: 기준정보, 실적정보, 데이터분류, 운송정보, 공정정보
- 각 탭에서 템플릿 다운로드 및 CSV 파일 업로드 가능
- 데이터분류 탭은 입력 없이 보여주기만 함
- 템플릿 다운로드 URL: /api/templates?type=standard, /api/templates?type=actual, /api/templates?type=classification, /api/templates?type=transport, /api/templates?type=process

**2. LCA (Life Cycle Assessment):**
- 생명주기 평가를 통한 환경영향 분석
- 단계: 목적 및 범위 → LCI 데이터 수집 → LCIA 환경영향 평가 → 해석 → 보고서
- 환경영향 범주: 기후변화, 산성화, 부영양화, 오존층 파괴, 광화학적 오존 생성, 인간독성, 생태독성
- 프로젝트 관리, 결과 해석, 보고서 생성 기능

**3. CBAM (Carbon Border Adjustment Mechanism):**
- EU 탄소국경조정메커니즘 대응
- 제품 정보 입력, 공정 관리, 탄소배출량 계산, 보고서 생성
- EU 수출 시 CBAM 신고를 위한 보고서 작성

**4. 사용자 및 회사 관리:**
- 사용자 ID: 개인 계정 식별자, 개인별 설정/권한/작업 이력
- 회사 ID: 조직/기업 식별자, 회사별 데이터 분리 및 관리
- 한 회사에 여러 사용자 가능

**5. 시스템 기능:**
- 설정: 계정, 알림, 보안, 환경설정
- 데이터 품질 평가: 정확성, 완전성, 일관성, 시의성, 신뢰성
- 데이터 백업 및 복원, 사용자 권한 관리
- API 연동: ERP, MES, SCM 시스템과의 연동

**6. 환경 인증:**
- ISO 14040/14044 (LCA 국제표준)
- EPD (환경제품선언서), Carbon Footprint, Green Building, REACH

**응답 가이드라인:**
- 위 정보에 없는 질문에 대해서는 "해당 정보는 제공할 수 없습니다"라고 답변
- 유사한 기능이 있다면 그것을 안내
- HTML 링크는 실제로 렌더링되어야 하므로 올바른 형식으로 작성
- 한국어로 답변하며, 전문 용어는 쉽게 설명

**HTML 링크 예시:**
- 데이터 업로드: <a href="/data-upload" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">📊 데이터 업로드 페이지로 이동</a>
- LCA 분석: <a href="/lca" class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">🌱 LCA 분석 페이지로 이동</a>
- CBAM 관리: <a href="/cbam" class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">🌍 CBAM 관리 페이지로 이동</a>
- 설정: <a href="/settings" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700">⚙️ 설정 페이지로 이동</a>
- 홈: <a href="/" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">🏠 홈으로 이동</a>
"""

    async def process_message(self, message: str, context: str = "general", 
                           session_id: Optional[str] = None, 
                           user_id: Optional[str] = None) -> Dict[str, Any]:
        """사용자 메시지 처리 및 AI 응답 생성"""
        try:
            if not self.llm:
                raise RuntimeError("ChatbotService가 초기화되지 않았습니다.")
            
            # 세션 관리
            if not session_id:
                session_id = str(uuid.uuid4())
            
            if session_id not in self.sessions:
                self.sessions[session_id] = ChatSession(
                    session_id=session_id,
                    user_id=user_id,
                    created_at=datetime.utcnow(),
                    last_activity=datetime.utcnow(),
                    context=context
                )
            
            session = self.sessions[session_id]
            session.last_activity = datetime.utcnow()
            
            # 사용자 메시지 저장
            user_message = ChatMessage(
                id=str(uuid.uuid4()),
                role="user",
                content=message,
                timestamp=datetime.utcnow()
            )
            session.messages.append(user_message)
            
            # AI 응답 생성
            response = await self._generate_ai_response(message, context, session)
            
            # AI 응답 저장
            ai_message = ChatMessage(
                id=str(uuid.uuid4()),
                role="assistant",
                content=response["response"],
                timestamp=datetime.utcnow(),
                metadata={
                    "model_used": settings.OPENAI_MODEL,
                    "tokens_used": response.get("tokens_used", 0)
                }
            )
            session.messages.append(ai_message)
            
            return {
                "success": True,
                "message": "응답이 성공적으로 생성되었습니다.",
                "data": {
                    "response": response["response"],
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "model_used": settings.OPENAI_MODEL,
                    "tokens_used": response.get("tokens_used", 0),
                    "context": context
                }
            }
            
        except Exception as e:
            chatbot_logger.error(f"메시지 처리 실패: {str(e)}")
            return {
                "success": False,
                "message": f"메시지 처리 중 오류가 발생했습니다: {str(e)}",
                "data": {}
            }
    
    async def _generate_ai_response(self, message: str, context: str, 
                                  session: ChatSession) -> Dict[str, Any]:
        """AI 응답 생성"""
        try:
            # 컨텍스트별 프롬프트 조정
            context_prompt = self._get_context_prompt(context)
            
            # 대화 히스토리 구성
            messages = [
                SystemMessage(content=context_prompt),
            ]
            
            # 최근 대화 히스토리 추가 (최대 10개)
            recent_messages = session.messages[-10:] if len(session.messages) > 10 else session.messages
            for msg in recent_messages:
                if msg.role == "user":
                    messages.append(HumanMessage(content=msg.content))
                elif msg.role == "assistant":
                    messages.append(AIMessage(content=msg.content))
            
            # 현재 사용자 메시지 추가
            messages.append(HumanMessage(content=message))
            
            # AI 응답 생성
            response = await self.llm.agenerate([messages])
            
            ai_response = response.generations[0][0].text.strip()
            
            return {
                "response": ai_response,
                "tokens_used": response.llm_output.get("token_usage", {}).get("total_tokens", 0)
            }
            
        except Exception as e:
            chatbot_logger.error(f"AI 응답 생성 실패: {str(e)}")
            return {
                "response": "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                "tokens_used": 0
            }
    
    def _get_context_prompt(self, context: str) -> str:
        """컨텍스트별 프롬프트 조정"""
        base_prompt = self.system_prompt
        
        context_specific = {
            "lca": "\n\n현재 LCA(생명주기 평가) 관련 질문에 답변하고 있습니다. 위에서 제공된 LCA 정보를 기반으로 답변해주세요.",
            "cbam": "\n\n현재 CBAM(탄소국경조정메커니즘) 관련 질문에 답변하고 있습니다. 위에서 제공된 CBAM 정보를 기반으로 답변해주세요.",
            "data": "\n\n현재 데이터 관리 관련 질문에 답변하고 있습니다. 위에서 제공된 데이터 입력 및 관리 정보를 기반으로 답변해주세요.",
            "esg": "\n\n현재 ESG(환경, 사회, 지배구조) 관련 질문에 답변하고 있습니다. 위에서 제공된 시스템 기능 정보를 기반으로 답변해주세요.",
            "dashboard": "\n\n현재 대시보드 관련 질문에 답변하고 있습니다. 위에서 제공된 시스템 기능 정보를 기반으로 답변해주세요."
        }
        
        return base_prompt + context_specific.get(context, "")
    
    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """채팅 히스토리 조회"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            return session.messages[-limit:] if len(session.messages) > limit else session.messages
        return []
    
    async def clear_session(self, session_id: str) -> bool:
        """세션 초기화"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    async def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """세션 정보 조회"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            return {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat(),
                "last_activity": session.last_activity.isoformat(),
                "message_count": len(session.messages),
                "context": session.context
            }
        return None
