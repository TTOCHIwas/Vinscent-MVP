-- Vinscent MVP 스키마 마이그레이션
-- 실행 날짜: 2025-01-20
-- 목적: MVP에 필요한 필드 추가

-- 1. magazines 테이블에 필드 추가
ALTER TABLE `magazine` 
ADD COLUMN `magazine_subtitle` VARCHAR(200) AFTER `magazine_title`,
ADD COLUMN `magazine_category` ENUM('official', 'unofficial') NOT NULL DEFAULT 'official' COMMENT '공식/비공식 구분',
ADD COLUMN `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '조회수',
ADD COLUMN `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft' COMMENT '임시저장/발행 상태',
ADD COLUMN `published_date` TIMESTAMP NULL COMMENT '발행일시';

-- 2. 인덱스 추가 (조회 성능 최적화)
CREATE INDEX `idx_magazine_category` ON `magazine` (`magazine_category`);
CREATE INDEX `idx_magazine_status` ON `magazine` (`status`);
CREATE INDEX `idx_magazine_published_date` ON `magazine` (`published_date`);
CREATE INDEX `idx_magazine_view_count` ON `magazine` (`view_count`);

-- 3. admin_users 테이블 생성 (어드민 관리용)
CREATE TABLE `admin_users` (
  `admin_id` BIGINT AUTO_INCREMENT NOT NULL,
  `admin_name` VARCHAR(50) NOT NULL COMMENT '어드민 표시 이름',
  `admin_role` ENUM('developer', 'designer', 'marketing', 'pm') NOT NULL COMMENT '역할',
  `admin_key` VARCHAR(255) NOT NULL UNIQUE COMMENT '고유 식별키',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `admin_users_admin_id` PRIMARY KEY(`admin_id`)
) COMMENT='어드민 사용자 관리';

-- 4. magazine_views 테이블 생성 (조회수 통계용)
CREATE TABLE `magazine_views` (
  `view_id` BIGINT AUTO_INCREMENT NOT NULL,
  `magazine_id` BIGINT NOT NULL,
  `view_date` DATE NOT NULL COMMENT '조회 날짜',
  `view_count` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '해당 날짜 조회수',
  `created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `magazine_views_view_id` PRIMARY KEY(`view_id`),
  UNIQUE KEY `unique_magazine_date` (`magazine_id`, `view_date`),
  CONSTRAINT `fk_magazine_views_magazine` FOREIGN KEY (`magazine_id`) REFERENCES `magazine` (`magazine_id`) ON DELETE CASCADE
) COMMENT='매거진 일별 조회수 통계';

-- 5. 기본 어드민 데이터 삽입
INSERT INTO `admin_users` (`admin_name`, `admin_role`, `admin_key`) VALUES
('개발팀', 'developer', 'dev_key_2025'),
('디자인팀', 'designer', 'design_key_2025'),
('마케팅팀', 'marketing', 'marketing_key_2025'),
('PM', 'pm', 'pm_key_2025');

-- 6. 브랜드 테이블에 어드민 브랜드 추가 (매거진 작성용)
INSERT INTO `brand` (`brand_title`, `brand_description`) VALUES
('Vinscent Official', 'Vinscent 공식 매거진 브랜드');

-- 7. 기존 매거진 데이터 업데이트 (있는 경우)
UPDATE `magazine` 
SET `magazine_category` = 'official',
    `status` = 'published',
    `published_date` = `created_date`
WHERE `status` IS NULL;