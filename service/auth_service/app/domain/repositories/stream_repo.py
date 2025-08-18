from sqlalchemy.orm import Session
from app.domain.entities.stream import Stream
from app.domain.schemas.stream import StreamCreate, StreamUpdate

class StreamRepository:
    """스트림 리포지토리"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, stream_id: int) -> Stream:
        """ID로 스트림 조회"""
        return self.db.query(Stream).filter(Stream.id == stream_id).first()
    
    def get_by_user_id(self, user_id: int):
        """사용자 ID로 스트림 목록 조회"""
        return self.db.query(Stream).filter(Stream.user_id == user_id).all()
    
    def get_by_company_id(self, company_id: int):
        """기업 ID로 스트림 목록 조회"""
        return self.db.query(Stream).filter(Stream.company_id == company_id).all()
    
    def create(self, stream_data: StreamCreate) -> Stream:
        """스트림 생성"""
        db_stream = Stream(**stream_data.dict())
        self.db.add(db_stream)
        self.db.commit()
        self.db.refresh(db_stream)
        return db_stream
    
    def update(self, stream_id: int, stream_data: StreamUpdate) -> Stream:
        """스트림 정보 업데이트"""
        db_stream = self.get_by_id(stream_id)
        if db_stream:
            for field, value in stream_data.dict(exclude_unset=True).items():
                setattr(db_stream, field, value)
            self.db.commit()
            self.db.refresh(db_stream)
        return db_stream
    
    def delete(self, stream_id: int) -> bool:
        """스트림 삭제"""
        db_stream = self.get_by_id(stream_id)
        if db_stream:
            self.db.delete(db_stream)
            self.db.commit()
            return True
        return False
    
    def list_streams(self, skip: int = 0, limit: int = 100):
        """스트림 목록 조회"""
        return self.db.query(Stream).offset(skip).limit(limit).all()
