-- 새로운 데이터 업로드 스키마를 위한 테이블 생성 스크립트
-- 기존 테이블을 삭제하고 새로운 구조로 생성

-- 기존 테이블 삭제 (존재하는 경우)
DROP TABLE IF EXISTS input_data CASCADE;
DROP TABLE IF EXISTS output_data CASCADE;
DROP TABLE IF EXISTS transport_data CASCADE;
DROP TABLE IF EXISTS process_data CASCADE;

-- 1. 투입물 데이터 테이블 (Input Data)
CREATE TABLE input_data (
    id SERIAL PRIMARY KEY,
    로트번호 VARCHAR(50) NOT NULL,
    생산품명 VARCHAR(100) NOT NULL,
    생산수량 DECIMAL(15,3) NOT NULL CHECK (생산수량 > 0),
    투입일 DATE,
    종료일 DATE,
    공정 VARCHAR(100) NOT NULL,
    투입물명 VARCHAR(200) NOT NULL,
    수량 DECIMAL(15,3) NOT NULL CHECK (수량 > 0),
    단위 VARCHAR(20) NOT NULL DEFAULT 't',
    AI추천답변 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 산출물 데이터 테이블 (Output Data)
CREATE TABLE output_data (
    id SERIAL PRIMARY KEY,
    로트번호 VARCHAR(50) NOT NULL,
    생산품명 VARCHAR(100) NOT NULL,
    생산수량 DECIMAL(15,3) NOT NULL CHECK (생산수량 > 0),
    투입일 DATE,
    종료일 DATE,
    공정 VARCHAR(100) NOT NULL,
    산출물명 VARCHAR(200) NOT NULL,
    수량 DECIMAL(15,3) NOT NULL CHECK (수량 > 0),
    단위 VARCHAR(20) NOT NULL DEFAULT 't',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 운송 데이터 테이블 (Transport Data)
CREATE TABLE transport_data (
    id SERIAL PRIMARY KEY,
    생산품명 VARCHAR(100) NOT NULL,
    로트번호 VARCHAR(50) NOT NULL,
    운송물질 VARCHAR(200) NOT NULL,
    운송수량 DECIMAL(15,3) NOT NULL CHECK (운송수량 > 0),
    운송일자 DATE,
    도착공정 VARCHAR(100) NOT NULL,
    출발지 VARCHAR(200) NOT NULL,
    이동수단 VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 공정 데이터 테이블 (Process Data)
CREATE TABLE process_data (
    id SERIAL PRIMARY KEY,
    공정명 VARCHAR(100) NOT NULL,
    공정설명 TEXT,
    공정유형 VARCHAR(100) NOT NULL,
    공정단계 VARCHAR(100) NOT NULL,
    공정효율 DECIMAL(5,2) CHECK (공정효율 >= 0 AND 공정효율 <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_input_data_로트번호 ON input_data(로트번호);
CREATE INDEX idx_input_data_생산품명 ON input_data(생산품명);
CREATE INDEX idx_input_data_투입일 ON input_data(투입일);
CREATE INDEX idx_input_data_공정 ON input_data(공정);

CREATE INDEX idx_output_data_로트번호 ON output_data(로트번호);
CREATE INDEX idx_output_data_생산품명 ON output_data(생산품명);
CREATE INDEX idx_output_data_투입일 ON output_data(투입일);
CREATE INDEX idx_output_data_공정 ON output_data(공정);

CREATE INDEX idx_transport_data_로트번호 ON transport_data(로트번호);
CREATE INDEX idx_transport_data_생산품명 ON transport_data(생산품명);
CREATE INDEX idx_transport_data_운송일자 ON transport_data(운송일자);

CREATE INDEX idx_process_data_공정명 ON process_data(공정명);
CREATE INDEX idx_process_data_공정유형 ON process_data(공정유형);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_input_data_updated_at BEFORE UPDATE ON input_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_output_data_updated_at BEFORE UPDATE ON output_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_data_updated_at BEFORE UPDATE ON transport_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_data_updated_at BEFORE UPDATE ON process_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 생성 확인
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('input_data', 'output_data', 'transport_data', 'process_data')
ORDER BY table_name, ordinal_position;
