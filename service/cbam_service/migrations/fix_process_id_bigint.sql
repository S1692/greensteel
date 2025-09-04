-- ============================================================================
-- 🔧 Process ID를 BIGINT로 변경하는 마이그레이션 스크립트
-- ============================================================================
-- JavaScript 타임스탬프 기반 ID가 int32 범위를 초과하는 문제 해결

-- 1. process 테이블의 id 컬럼을 BIGINT로 변경
ALTER TABLE process ALTER COLUMN id TYPE BIGINT;

-- 2. product_process 테이블의 process_id 컬럼을 BIGINT로 변경
ALTER TABLE product_process ALTER COLUMN process_id TYPE BIGINT;

-- 3. matdir 테이블의 process_id 컬럼을 BIGINT로 변경
ALTER TABLE matdir ALTER COLUMN process_id TYPE BIGINT;

-- 4. fueldir 테이블의 process_id 컬럼을 BIGINT로 변경
ALTER TABLE fueldir ALTER COLUMN process_id TYPE BIGINT;

-- 5. edge 테이블의 source_id, target_id 컬럼을 BIGINT로 변경 (process_id를 참조할 수 있음)
ALTER TABLE edge ALTER COLUMN source_id TYPE BIGINT;
ALTER TABLE edge ALTER COLUMN target_id TYPE BIGINT;

-- 6. process_attrdir_emission 테이블의 process_id 컬럼을 BIGINT로 변경
ALTER TABLE process_attrdir_emission ALTER COLUMN process_id TYPE BIGINT;

-- 7. 인덱스 재생성 (필요한 경우)
-- PostgreSQL은 컬럼 타입 변경 시 인덱스를 자동으로 재생성하지만, 명시적으로 확인
REINDEX INDEX IF EXISTS idx_process_id;
REINDEX INDEX IF EXISTS idx_product_process_process_id;
REINDEX INDEX IF EXISTS idx_matdir_process_id;
REINDEX INDEX IF EXISTS idx_fueldir_process_id;
REINDEX INDEX IF EXISTS idx_edge_source_id;
REINDEX INDEX IF EXISTS idx_edge_target_id;
REINDEX INDEX IF EXISTS idx_process_attrdir_emission_process_id;

-- 8. 외래키 제약조건 확인 (자동으로 업데이트됨)
-- PostgreSQL은 컬럼 타입 변경 시 외래키 제약조건을 자동으로 업데이트합니다.

COMMENT ON COLUMN process.id IS '공정 ID (BIGINT - JavaScript 타임스탬프 지원)';
COMMENT ON COLUMN product_process.process_id IS '공정 ID (BIGINT - JavaScript 타임스탬프 지원)';
COMMENT ON COLUMN matdir.process_id IS '공정 ID (BIGINT - JavaScript 타임스탬프 지원)';
COMMENT ON COLUMN fueldir.process_id IS '공정 ID (BIGINT - JavaScript 타임스탬프 지원)';
COMMENT ON COLUMN edge.source_id IS '소스 노드 ID (BIGINT - process_id 지원)';
COMMENT ON COLUMN edge.target_id IS '타겟 노드 ID (BIGINT - process_id 지원)';
COMMENT ON COLUMN process_attrdir_emission.process_id IS '공정 ID (BIGINT - JavaScript 타임스탬프 지원)';
