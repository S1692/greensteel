# 🏗️ GreenSteel DDD 리팩토링 가이드

## 📋 **개요**

GreenSteel 프로젝트를 **DDD(Domain-Driven Design)** 아키텍처로 리팩토링하여 더 나은 도메인 모델링, 비즈니스 로직 분리, 그리고 확장성을 제공합니다.

## 🎯 **DDD vs EDD 선택 이유**

### **DDD (Domain-Driven Design) 선택**
- ✅ **비즈니스 도메인 중심**: ESG, CBAM, LCI 등 핵심 비즈니스 영역에 집중
- ✅ **도메인 규칙 명확화**: 각 도메인의 비즈니스 규칙을 명확하게 모델링
- ✅ **확장성**: 새로운 도메인 추가 시 기존 코드 영향 최소화
- ✅ **팀 협업**: 도메인 전문가와 개발자 간 명확한 의사소통

### **EDD (Event-Driven Design) 미선택 이유**
- ❌ **복잡성**: 이벤트 소싱과 CQRS 패턴의 복잡성
- ❌ **학습 곡선**: 팀원들의 이벤트 기반 아키텍처 이해도
- ❌ **디버깅 어려움**: 이벤트 흐름 추적의 복잡성

## 🏛️ **DDD 아키텍처 구조**

### **1. 레이어 구조**
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│                    (Gateway + Frontend)                    │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                        │
│                 (Use Cases, Workflows)                     │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                            │
│              (Entities, Value Objects, Services)           │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                       │
│              (Database, External Services)                 │
└─────────────────────────────────────────────────────────────┘
```

### **2. 도메인 분리**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Identity &      │  │ Carbon Border   │  │ Data Collection │
│ Access Domain   │  │ Domain          │  │ Domain          │
│                 │  │                 │  │                 │
│ • Company       │  │ • CBAM          │  │ • ESG Data      │
│ • User          │  │ • Carbon        │  │ • Metrics       │
│ • Auth          │  │ • Border        │  │ • Collection    │
│ • Stream        │  │ • Adjustment    │  │ • Processing    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🔧 **구현된 DDD 패턴**

### **1. Aggregate Root**
```python
# Company Aggregate Root
class Company:
    def __init__(self, company_id: str, name: str, biz_no: str):
        self.company_id = company_id
        self.name = name
        self.biz_no = biz_no
        self.users: List[User] = []
        self._domain_events: List[DomainEvent] = []
    
    def add_user(self, user: User):
        # 도메인 규칙 검증
        if not self.can_add_user(user):
            raise DomainException("Cannot add user to company")
        
        self.users.append(user)
        self._add_domain_event(UserAddedEvent(user, self))
    
    def _add_domain_event(self, event: DomainEvent):
        self._domain_events.append(event)
```

### **2. Value Objects**
```python
# Address Value Object
@dataclass(frozen=True)
class Address:
    street: str
    city: str
    country: str
    zipcode: str
    
    def __post_init__(self):
        if not self.street or not self.city:
            raise ValueError("Address must have street and city")
    
    @property
    def full_address(self) -> str:
        return f"{self.street}, {self.city}, {self.country} {self.zipcode}"
```

### **3. Domain Services**
```python
# Authentication Domain Service
class AuthenticationService:
    def __init__(self, user_repository: UserRepository, 
                 password_hasher: PasswordHasher):
        self.user_repository = user_repository
        self.password_hasher = password_hasher
    
    def authenticate_user(self, username: str, password: str) -> User:
        user = self.user_repository.find_by_username(username)
        if not user or not self.password_hasher.verify(password, user.password_hash):
            raise AuthenticationException("Invalid credentials")
        
        return user
```

### **4. Repository Pattern**
```python
# User Repository Interface
class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> User:
        pass
    
    @abstractmethod
    def find_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def find_by_username(self, username: str) -> Optional[User]:
        pass

# PostgreSQL Implementation
class PostgreSQLUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session
    
    def save(self, user: User) -> User:
        self.session.add(user)
        self.session.commit()
        return user
```

## 🚀 **Gateway와 Auth Service 연동**

### **1. 포트 설정**
```bash
# Gateway: 8080
# Auth Service: 8081
# CBAM Service: 8082
# DataGather Service: 8083
# LCI Service: 8084
```

### **2. 환경 변수 설정**
```bash
# Gateway (.env)
AUTH_SERVICE_URL=http://localhost:8081
CBAM_SERVICE_URL=http://localhost:8082
DATAGATHER_SERVICE_URL=http://localhost:8083
LCI_SERVICE_URL=http://localhost:8084

# Auth Service (.env)
PORT=8081
HOST=0.0.0.0
GATEWAY_URL=http://localhost:8080
```

### **3. 라우팅 규칙**
```python
# Gateway Proxy Controller
self.service_map = {
    "/auth": "http://localhost:8081",      # 인증 도메인
    "/stream": "http://localhost:8081",    # 이벤트 스트림
    "/company": "http://localhost:8081",   # 회사 관리
    "/user": "http://localhost:8081",      # 사용자 관리
    "/cbam": "http://localhost:8082",      # CBAM 도메인
    "/datagather": "http://localhost:8083", # 데이터 수집
    "/lci": "http://localhost:8084",       # LCI 도메인
}
```

## 📁 **파일 구조**

### **Gateway 구조**
```
gateway/
├── app/
│   ├── main.py              # FastAPI 애플리케이션
│   ├── domain/
│   │   └── proxy.py         # 프록시 컨트롤러 (Application Layer)
│   └── common/
│       └── utility/
│           └── logger.py     # 로깅 유틸리티
├── env.example              # 환경 변수 예시
└── requirements.txt          # 의존성
```

### **Auth Service 구조**
```
service/auth_service/
├── app/
│   ├── main.py              # FastAPI 애플리케이션
│   ├── domain/              # 도메인 레이어
│   │   ├── entities/        # 엔티티
│   │   ├── value_objects/   # 값 객체
│   │   ├── services/        # 도메인 서비스
│   │   └── repositories/    # 리포지토리 인터페이스
│   ├── application/         # 애플리케이션 레이어
│   │   ├── use_cases/       # 유스케이스
│   │   └── workflows/       # 워크플로우
│   ├── infrastructure/      # 인프라스트럭처 레이어
│   │   ├── database/        # 데이터베이스 구현
│   │   └── external/        # 외부 서비스
│   └── www/                 # 웹 레이어
│       ├── controllers/     # 컨트롤러
│       ├── middlewares/     # 미들웨어
│       └── responses/       # 응답 모델
├── env.example              # 환경 변수 예시
└── requirements.txt          # 의존성
```

## 🔄 **마이그레이션 단계**

### **1단계: 기존 구조 분석**
- [x] 현재 레이어 구조 파악
- [x] 도메인 경계 식별
- [x] 의존성 매핑

### **2단계: DDD 구조 설계**
- [x] 도메인 모델 설계
- [x] Aggregate Root 정의
- [x] Value Object 설계
- [x] Domain Service 정의

### **3단계: 코드 리팩토링**
- [x] Gateway DDD 구조 적용
- [x] Auth Service DDD 구조 적용
- [x] 환경 변수 설정 업데이트
- [x] 포트 설정 수정

### **4단계: 테스트 및 검증**
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 성능 테스트 수행
- [ ] 도메인 규칙 검증

## 🧪 **테스트 전략**

### **1. 단위 테스트**
```python
# Domain Service 테스트
def test_authentication_service_authenticate_valid_user():
    # Given
    user = User("testuser", "password123")
    user_repo = MockUserRepository([user])
    password_hasher = MockPasswordHasher()
    auth_service = AuthenticationService(user_repo, password_hasher)
    
    # When
    result = auth_service.authenticate_user("testuser", "password123")
    
    # Then
    assert result == user
```

### **2. 통합 테스트**
```python
# Repository 통합 테스트
def test_user_repository_save_and_find():
    # Given
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine)
    repo = PostgreSQLUserRepository(session)
    
    # When
    user = User("testuser", "password123")
    saved_user = repo.save(user)
    found_user = repo.find_by_username("testuser")
    
    # Then
    assert found_user.username == "testuser"
```

## 📊 **성능 최적화**

### **1. 데이터베이스 최적화**
- [ ] 인덱스 최적화
- [ ] 쿼리 최적화
- [ ] 연결 풀 설정

### **2. 캐싱 전략**
- [ ] Redis 캐싱
- [ ] 메모리 캐싱
- [ ] CDN 캐싱

### **3. 비동기 처리**
- [ ] Celery 작업 큐
- [ ] FastAPI 백그라운드 태스크
- [ ] 이벤트 스트림 처리

## 🔒 **보안 고려사항**

### **1. 인증 및 권한**
- [ ] JWT 토큰 검증
- [ ] Role-based Access Control (RBAC)
- [ ] API 키 관리

### **2. 데이터 보호**
- [ ] PII 데이터 암호화
- [ ] 민감 정보 마스킹
- [ ] 감사 로그 기록

### **3. API 보안**
- [ ] Rate Limiting
- [ ] Input Validation
- [ ] SQL Injection 방지

## 🚀 **배포 및 운영**

### **1. Docker 컨테이너화**
```dockerfile
# Gateway Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### **2. Kubernetes 배포**
```yaml
# Gateway Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: greensteel/gateway:latest
        ports:
        - containerPort: 8080
```

### **3. 모니터링 및 로깅**
- [ ] Prometheus 메트릭 수집
- [ ] Grafana 대시보드
- [ ] ELK 스택 로그 분석
- [ ] Health Check 엔드포인트

## 📚 **참고 자료**

### **1. DDD 관련**
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)

### **2. FastAPI 관련**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

### **3. 마이크로서비스 관련**
- [Building Microservices by Sam Newman](https://www.amazon.com/Building-Microservices-Designing-Fine-Grained-Systems/dp/1491950358)
- [Microservices Patterns by Chris Richardson](https://www.amazon.com/Microservices-Patterns-Examples-Chris-Richardson/dp/1617294543)

## 🤝 **기여 가이드**

### **1. 코드 스타일**
- Python: PEP 8 준수
- Type Hints 사용
- Docstring 작성
- 테스트 코드 작성

### **2. 커밋 메시지**
```
feat: 새로운 도메인 서비스 추가
fix: 인증 로직 버그 수정
refactor: DDD 패턴 적용
docs: API 문서 업데이트
test: 테스트 케이스 추가
```

### **3. Pull Request**
- 기능별 브랜치 생성
- 테스트 코드 포함
- 문서 업데이트
- 코드 리뷰 요청

## 📞 **문의 및 지원**

프로젝트 관련 문의사항이나 기술 지원이 필요한 경우:

- **이슈 등록**: GitHub Issues
- **토론**: GitHub Discussions
- **문서**: 프로젝트 Wiki
- **연락처**: 프로젝트 메인테이너

---

**GreenSteel DDD 리팩토링** - 더 나은 도메인 모델링과 확장성을 위한 여정을 시작하세요! 🚀✨
