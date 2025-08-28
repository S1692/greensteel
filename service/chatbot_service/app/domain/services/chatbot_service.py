import asyncio
import uuid
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from app.common.settings import settings
from app.common.logger import chatbot_logger
from app.domain.schemas.chatbot import ChatMessage, ChatSession

class ChatbotService:
    """챗봇 서비스 - RAG 기반으로 chatbot_training_data.jsonl만을 지식 베이스로 사용"""
    
    def __init__(self):
        self.llm: Optional[ChatOpenAI] = None
        self.embeddings: Optional[OpenAIEmbeddings] = None
        self.vectorstore: Optional[Chroma] = None
        self.memory: Optional[ConversationBufferMemory] = None
        self.chat_chain: Optional[LLMChain] = None
        self.sessions: Dict[str, ChatSession] = {}
        self.knowledge_base_loaded = False
        
    async def initialize(self):
        """LangChain과 OpenAI 초기화 및 지식 베이스 로드"""
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
            
            # OpenAI Embeddings 초기화
            self.embeddings = OpenAIEmbeddings(
                api_key=settings.OPENAI_API_KEY,
                model="text-embedding-3-small"
            )
            
            # 대화 메모리 초기화
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # 지식 베이스 로드
            await self._load_knowledge_base()
            
            chatbot_logger.info("ChatbotService 초기화 완료")
            
        except Exception as e:
            chatbot_logger.error(f"ChatbotService 초기화 실패: {str(e)}")
            raise
    
    async def _load_knowledge_base(self):
        """chatbot_training_data.jsonl 파일을 벡터 데이터베이스로 로드"""
        try:
            # chatbot_training_data.jsonl 파일 경로 (Docker 컨테이너 내부 경로)
            # 여러 가능한 경로 시도
            possible_paths = [
                os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "chatbot_training_data.jsonl"),
                os.path.join("/app", "chatbot_training_data.jsonl"),
                os.path.join(os.getcwd(), "chatbot_training_data.jsonl"),
                "chatbot_training_data.jsonl"
            ]
            
            training_data_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    training_data_path = path
                    break
            
            if not training_data_path:
                chatbot_logger.error(f"지식 베이스 파일을 찾을 수 없습니다. 시도한 경로들: {possible_paths}")
                return
            
            # JSONL 파일 읽기
            documents = []
            with open(training_data_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        data = json.loads(line)
                        if "messages" in data and len(data["messages"]) >= 2:
                            # 사용자 질문과 AI 답변 추출
                            user_msg = data["messages"][0]["content"]
                            ai_msg = data["messages"][1]["content"]
                            
                            # 문서 생성 (질문과 답변을 결합)
                            combined_content = f"질문: {user_msg}\n\n답변: {ai_msg}"
                            
                            doc = Document(
                                page_content=combined_content,
                                metadata={
                                    "user_question": user_msg,
                                    "ai_answer": ai_msg,
                                    "line_number": line_num,
                                    "source": "chatbot_training_data.jsonl"
                                }
                            )
                            documents.append(doc)
                            
                    except json.JSONDecodeError as e:
                        chatbot_logger.warning(f"JSON 파싱 오류 (라인 {line_num}): {e}")
                        continue
            
            if not documents:
                chatbot_logger.warning("로드할 문서가 없습니다.")
                return
            
            # 텍스트 분할
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            
            split_docs = text_splitter.split_documents(documents)
            
            # 벡터 데이터베이스 생성
            self.vectorstore = Chroma.from_documents(
                documents=split_docs,
                embedding=self.embeddings,
                persist_directory=settings.CHROMA_PERSIST_DIRECTORY,
                collection_name=settings.CHROMA_COLLECTION_NAME
            )
            
            self.knowledge_base_loaded = True
            chatbot_logger.info(f"지식 베이스 로드 완료: {len(documents)}개 문서, {len(split_docs)}개 청크")
            
        except Exception as e:
            chatbot_logger.error(f"지식 베이스 로드 실패: {str(e)}")
            raise
    
    async def _search_knowledge_base(self, query: str, top_k: int = 3) -> List[Document]:
        """지식 베이스에서 관련 정보 검색"""
        try:
            if not self.vectorstore or not self.knowledge_base_loaded:
                # 자동 초기화 시도
                try:
                    await self.initialize()
                except Exception as e:
                    chatbot_logger.error(f"자동 초기화 실패: {str(e)}")
                    return []
            
            # 벡터스토어가 여전히 없으면 빈 리스트 반환
            if not self.vectorstore:
                chatbot_logger.warning("벡터스토어가 초기화되지 않았습니다.")
                return []
            
            # 유사도 검색
            docs = self.vectorstore.similarity_search(query, k=top_k)
            return docs
            
        except Exception as e:
            chatbot_logger.error(f"지식 베이스 검색 실패: {str(e)}")
            return []
    
    def _get_system_prompt(self) -> str:
        """RAG 기반 시스템 프롬프트"""
        return """
당신은 GreenSteel ESG 플랫폼의 AI 어시스턴트입니다.

**중요한 규칙:**
1. **오직 제공된 지식 베이스의 정보만을 사용하여 답변하세요.**
2. **지식 베이스에 없는 정보에 대해서는 "죄송합니다. 해당 정보는 제공할 수 없습니다."라고 답변하고, 유사한 기능이 있는지 안내해주세요.**
3. **절대로 지식 베이스 외부의 정보를 추가하지 마세요.**
4. **한국어로 답변하며, 전문 용어는 쉽게 설명하세요.**

**답변 형식:**
- 질문에 대한 명확하고 정확한 답변
- HTML 링크는 실제로 렌더링되어야 하므로 올바른 형식으로 작성
- 지식 베이스에 없는 내용은 절대 포함하지 않음

**HTML 링크 예시:**
- 데이터 업로드: <a href="/data-upload" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">📊 데이터 업로드 페이지로 이동</a>
- LCA 분석: <a href="/lca" class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">🌱 LCA 분석 페이지로 이동</a>
- CBAM 관리: <a href="/cbam" class="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700">🌍 CBAM 관리 페이지로 이동</a>
- 설정: <a href="/settings" class="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700">⚙️ 설정 페이지로 이동</a>
- 홈: <a href="/" class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">🏠 홈으로 이동</a>
"""

    async def process_message(self, message: str, context: str = "general", 
                           session_id: Optional[str] = None, 
                           user_id: Optional[str] = None) -> Dict[str, Any]:
        """사용자 메시지 처리 및 RAG 기반 AI 응답 생성"""
        try:
            # 자동 초기화 (아직 초기화되지 않은 경우)
            if not self.llm or not self.knowledge_base_loaded:
                await self.initialize()
            
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
            
            # RAG 기반 AI 응답 생성
            response = await self._generate_rag_response(message, context, session)
            
            # AI 응답 저장
            ai_message = ChatMessage(
                id=str(uuid.uuid4()),
                role="assistant",
                content=response["response"],
                timestamp=datetime.utcnow(),
                metadata={
                    "model_used": settings.OPENAI_MODEL,
                    "tokens_used": response.get("tokens_used", 0),
                    "rag_used": True,
                    "sources": response.get("sources", [])
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
                    "context": context,
                    "rag_used": True,
                    "sources": response.get("sources", [])
                }
            }
            
        except Exception as e:
            chatbot_logger.error(f"메시지 처리 실패: {str(e)}")
            return {
                "success": False,
                "message": f"메시지 처리 중 오류가 발생했습니다: {str(e)}",
                "data": {}
            }
    
    async def _generate_rag_response(self, message: str, context: str, 
                                   session: ChatSession) -> Dict[str, Any]:
        """RAG 기반 AI 응답 생성"""
        try:
            # 지식 베이스에서 관련 정보 검색
            relevant_docs = await self._search_knowledge_base(message, top_k=3)
            
            if not relevant_docs:
                # 지식 베이스가 로드되지 않았을 때 간단한 키워드 기반 응답
                return await self._generate_fallback_response(message)
            
            # 검색된 문서들을 프롬프트에 포함
            context_docs = "\n\n".join([
                f"**관련 정보 {i+1}:**\n{doc.page_content}"
                for i, doc in enumerate(relevant_docs)
            ])
            
            # RAG 프롬프트 구성
            rag_prompt = f"""
{self._get_system_prompt()}

**참고할 지식 베이스 정보:**
{context_docs}

**사용자 질문:** {message}

**지침:** 위의 지식 베이스 정보만을 사용하여 답변하세요. 지식 베이스에 없는 내용은 절대 추가하지 마세요. 만약 정보가 부족하다면 "해당 정보는 제공할 수 없습니다"라고 답변하세요.
"""
            
            # AI 응답 생성
            messages = [
                SystemMessage(content=rag_prompt),
                HumanMessage(content=message)
            ]
            
            response = await self.llm.agenerate([messages])
            ai_response = response.generations[0][0].text.strip()
            
            # 소스 정보 추출
            sources = [
                {
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                }
                for doc in relevant_docs
            ]
            
            return {
                "response": ai_response,
                "tokens_used": response.llm_output.get("token_usage", {}).get("total_tokens", 0),
                "sources": sources
            }
            
        except Exception as e:
            chatbot_logger.error(f"RAG 응답 생성 실패: {str(e)}")
            return await self._generate_fallback_response(message)
    
    async def _generate_fallback_response(self, message: str) -> Dict[str, Any]:
        """지식 베이스가 로드되지 않았을 때의 fallback 응답"""
        try:
            # 간단한 키워드 매칭
            message_lower = message.lower()
            
            if "greensteel" in message_lower or "esg" in message_lower or "플랫폼" in message_lower:
                return {
                    "response": "GreenSteel ESG 플랫폼은 철강 산업의 환경, 사회, 지배구조(ESG) 성과를 관리하고 개선하기 위한 종합적인 디지털 플랫폼입니다. 현재 지식 베이스가 로드되지 않아 상세한 정보를 제공할 수 없습니다. 잠시 후 다시 시도해주세요.",
                    "tokens_used": 0,
                    "sources": []
                }
            elif "cbam" in message_lower or "탄소국경" in message_lower:
                return {
                    "response": "CBAM(Carbon Border Adjustment Mechanism)은 탄소국경조정메커니즘으로, EU가 도입한 정책입니다. 현재 지식 베이스가 로드되지 않아 상세한 정보를 제공할 수 없습니다. 잠시 후 다시 시도해주세요.",
                    "tokens_used": 0,
                    "sources": []
                }
            elif "lca" in message_lower or "생명주기" in message_lower:
                return {
                    "response": "LCA(Life Cycle Assessment) 분석은 제품의 전체 생명주기 동안 환경에 미치는 영향을 체계적으로 평가하는 방법입니다. 현재 지식 베이스가 로드되지 않아 상세한 정보를 제공할 수 없습니다. 잠시 후 다시 시도해주세요.",
                    "tokens_used": 0,
                    "sources": []
                }
            else:
                return {
                    "response": "죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다. 현재 지식 베이스가 로드되지 않아 상세한 답변을 제공할 수 없습니다. 잠시 후 다시 시도해주세요.",
                    "tokens_used": 0,
                    "sources": []
                }
                
        except Exception as e:
            chatbot_logger.error(f"Fallback 응답 생성 실패: {str(e)}")
            return {
                "response": "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                "tokens_used": 0,
                "sources": []
            }
    
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
    
    async def get_knowledge_base_info(self) -> Dict[str, Any]:
        """지식 베이스 정보 조회"""
        return {
            "loaded": self.knowledge_base_loaded,
            "vectorstore_type": "Chroma" if self.vectorstore else None,
            "collection_name": settings.CHROMA_COLLECTION_NAME if self.vectorstore else None,
            "persist_directory": settings.CHROMA_PERSIST_DIRECTORY,
            "llm_initialized": self.llm is not None,
            "embeddings_initialized": self.embeddings is not None,
            "openai_api_key_set": bool(settings.OPENAI_API_KEY),
            "openai_api_key_length": len(settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else 0,
            "training_data_path": os.path.join(
                os.path.dirname(__file__), 
                "..", "..", "..", "..", 
                "chatbot_training_data.jsonl"
            ),
            "training_data_exists": os.path.exists(os.path.join(
                os.path.dirname(__file__), 
                "..", "..", "..", "..", 
                "chatbot_training_data.jsonl"
            ))
        }
