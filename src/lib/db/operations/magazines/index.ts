// 카드 조회 그룹 (썸네일 포함 최적화 데이터)
export {
  getLatestMagazineCards,
  getTopMagazineCards, 
  getPublishedMagazineCardById,
  getPublishedMagazineCards,
  getPublishedMagazineIds // 🔧 추가: generateStaticParams용
} from './cards';

// 전체 데이터 조회 그룹 (블록 데이터 포함)
export {
  getMagazineById,
  getAllMagazines
} from './content';

// CRUD 관리 그룹 (생성, 수정, 삭제)
export {
  createMagazine,
  updateMagazine,
  deleteMagazine
} from './management';

// 통계 및 메타 그룹 (카운트, 조회수, 통계)
export {
  getMagazineCount,
  incrementViewCount,
  getMagazineStatistics
} from './statistics';

// 공통 헬퍼 함수들 (내부 사용)
export {
  magazineCardSelectFields,
  extractMagazineThumbnail,
  transformToMagazineCard,
  handleMagazineOperationError
} from './helpers';