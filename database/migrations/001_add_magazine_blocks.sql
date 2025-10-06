-- Magazine Blocks 테이블 생성 (블록 기반 콘텐츠)
-- 실행: npm run db:push

CREATE TABLE IF NOT EXISTS magazine_blocks (
  block_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  magazine_id BIGINT NOT NULL,
  block_type ENUM('text', 'image') NOT NULL,
  block_order INT NOT NULL,
  
  -- 텍스트 블록용 필드
  text_content TEXT,
  
  -- 이미지 블록용 필드
  image_url VARCHAR(255),
  image_source VARCHAR(100),
  image_caption VARCHAR(200),
  image_description TEXT,
  
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 외래키 제약조건
  FOREIGN KEY (magazine_id) REFERENCES magazine(magazine_id) ON DELETE CASCADE,
  
  -- 인덱스 최적화
  INDEX idx_magazine_order (magazine_id, block_order),
  INDEX idx_magazine_blocks (magazine_id),
  INDEX idx_block_type (block_type),
  
  -- 유니크 제약조건 (매거진별 순서 중복 방지)
  UNIQUE KEY uk_magazine_order (magazine_id, block_order)
);

-- Magazine 테이블 컬럼 추가 (블록 기반 지원)
ALTER TABLE magazine 
ADD COLUMN IF NOT EXISTS is_block_based BOOLEAN NOT NULL DEFAULT TRUE AFTER magazine_subtitle;

-- 기존 데이터를 레거시로 표시 (나중에 마이그레이션 시 구분용)
UPDATE magazine 
SET is_block_based = FALSE 
WHERE magazine_id IS NOT NULL;

-- 성능 최적화 인덱스
CREATE INDEX IF NOT EXISTS idx_magazine_block_based ON magazine(is_block_based);
CREATE INDEX IF NOT EXISTS idx_magazine_status_block ON magazine(status, is_block_based);

-- 데이터 무결성 검증 쿼리들
SELECT 
  'Magazine 테이블 현황' as info,
  COUNT(*) as total_magazines,
  SUM(CASE WHEN is_block_based = TRUE THEN 1 ELSE 0 END) as block_based,
  SUM(CASE WHEN is_block_based = FALSE THEN 1 ELSE 0 END) as legacy
FROM magazine;

SELECT 
  'Magazine Blocks 테이블 현황' as info,
  COUNT(*) as total_blocks,
  COUNT(DISTINCT magazine_id) as magazines_with_blocks
FROM magazine_blocks;

-- 블록 타입별 통계
SELECT 
  block_type,
  COUNT(*) as count,
  COUNT(DISTINCT magazine_id) as unique_magazines
FROM magazine_blocks 
GROUP BY block_type;