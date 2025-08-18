from sqlalchemy.orm import Session
from app.domain.repositories.stream_repo import StreamRepository
from app.domain.schemas.stream import StreamCreate, StreamUpdate
from app.common.logger import auth_logger

class StreamService:
    """스트림 서비스"""
    
    def __init__(self, db: Session):
        self.db = db
        self.stream_repo = StreamRepository(db)
    
    def create_stream(self, stream_data: StreamCreate):
        """스트림 생성"""
        stream = self.stream_repo.create(stream_data)
        auth_logger.info(f"Stream created: {stream.name} (ID: {stream.id})")
        return stream
    
    def get_stream(self, stream_id: int):
        """스트림 조회"""
        return self.stream_repo.get_by_id(stream_id)
    
    def get_user_streams(self, user_id: int):
        """사용자의 스트림 목록 조회"""
        return self.stream_repo.get_by_user_id(user_id)
    
    def get_company_streams(self, company_id: int):
        """기업의 스트림 목록 조회"""
        return self.stream_repo.get_by_company_id(company_id)
    
    def update_stream(self, stream_id: int, stream_data: StreamUpdate):
        """스트림 정보 업데이트"""
        stream = self.stream_repo.update(stream_id, stream_data)
        if stream:
            auth_logger.info(f"Stream updated: {stream.name} (ID: {stream.id})")
        return stream
    
    def delete_stream(self, stream_id: int):
        """스트림 삭제"""
        success = self.stream_repo.delete(stream_id)
        if success:
            auth_logger.info(f"Stream deleted: ID {stream_id}")
        return success
    
    def list_streams(self, skip: int = 0, limit: int = 100):
        """스트림 목록 조회"""
        return self.stream_repo.list_streams(skip, limit)
