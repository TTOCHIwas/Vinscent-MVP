import { mysqlTable, varchar, text, int, bigint, timestamp, mysqlEnum, boolean, date, unique } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Magazine 테이블 (완전 블록 기반 시스템)
export const magazines = mysqlTable('magazine', {
  id: bigint('magazine_id', { mode: 'number' }).primaryKey().autoincrement(),
  title: varchar('magazine_title', { length: 100 }).notNull(),
  subtitle: varchar('magazine_subtitle', { length: 200 }),
  
  // 🔧 isBlockBased 제거: 모든 매거진이 블록 기반
  // content 필드도 제거: 레거시 지원 종료
  
  category: mysqlEnum('magazine_category', ['official', 'unofficial']).notNull().default('official'),
  viewCount: int('view_count').notNull().default(0),
  status: mysqlEnum('status', ['draft', 'published']).notNull().default('draft'),
  publishedDate: timestamp('published_date'),
  
  // 브랜드 직접 입력 방식
  brandName: varchar('brand_name', { length: 100 }).notNull(),
  brandUrl: varchar('brand_url', { length: 255 }),
  
  credits: text('credits'), // JSON 형태로 크레딧 정보 저장
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().onUpdateNow().notNull(),
});

// Magazine Blocks 테이블 (블록 기반 콘텐츠)
export const magazineBlocks = mysqlTable('magazine_blocks', {
  id: bigint('block_id', { mode: 'number' }).primaryKey().autoincrement(),
  magazineId: bigint('magazine_id', { mode: 'number' }).notNull(),
  blockType: mysqlEnum('block_type', ['text', 'image']).notNull(),
  blockOrder: int('block_order').notNull(),
  
  // 텍스트 블록용 필드
  textContent: text('text_content'), // 마크다운 텍스트
  
  // 이미지 블록용 필드
  imageUrl: varchar('image_url', { length: 255 }),
  imageSource: varchar('image_source', { length: 100 }),
  
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    magazineOrderIndex: unique().on(table.magazineId, table.blockOrder), // 매거진별 순서 유니크
  };
});

// Magazine Images 테이블 (상세 페이지 지원 - 레거시)
export const magazineImages = mysqlTable('magazine_image', {
  id: bigint('image_id', { mode: 'number' }).primaryKey().autoincrement(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  imageOrder: int('image_order').notNull(),
  imageCaption: varchar('image_caption', { length: 200 }),  // 레거시 호환용 유지
  imageSource: varchar('image_source', { length: 100 }),             
  magazineId: bigint('magazine_id', { mode: 'number' }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().onUpdateNow().notNull(),
});

// Admin Users 테이블 (어드민 권한 관리)
export const adminUsers = mysqlTable('admin_users', {
  id: bigint('admin_id', { mode: 'number' }).primaryKey().autoincrement(),
  name: varchar('admin_name', { length: 50 }).notNull(),
  role: mysqlEnum('admin_role', ['developer', 'designer', 'marketing', 'pm']).notNull(),
  key: varchar('admin_key', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().onUpdateNow().notNull(),
});

// Admin Activity Logs 테이블 (모든 관리자 활동 추적)
export const adminActivityLogs = mysqlTable('admin_activity_logs', {
  id: bigint('log_id', { mode: 'number' }).primaryKey().autoincrement(),
  action: mysqlEnum('action', ['create', 'update', 'delete', 'view']).notNull(),
  tableName: varchar('table_name', { length: 50 }).notNull(),    
  recordId: bigint('record_id', { mode: 'number' }).notNull(),   
  adminId: bigint('admin_id', { mode: 'number' }),               
  adminName: varchar('admin_name', { length: 50 }),             
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),   
  userAgent: text('user_agent'),                                
  changes: text('changes'),                                     
  timestamp: timestamp('timestamp').defaultNow().notNull(),     
});

// Magazine Views 테이블 (조회수 통계)
export const magazineViews = mysqlTable('magazine_views', {
  id: bigint('view_id', { mode: 'number' }).primaryKey().autoincrement(),
  magazineId: bigint('magazine_id', { mode: 'number' }).notNull(),
  viewDate: date('view_date').notNull(),
  viewCount: int('view_count').notNull().default(1),
  createdDate: timestamp('created_date').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueMagazineDate: unique().on(table.magazineId, table.viewDate),
  };
});

export const magazinesRelations = relations(magazines, ({ many }) => ({
  blocks: many(magazineBlocks), 
  images: many(magazineImages),
  views: many(magazineViews),
  activityLogs: many(adminActivityLogs),
}));

export const magazineBlocksRelations = relations(magazineBlocks, ({ one }) => ({
  magazine: one(magazines, {
    fields: [magazineBlocks.magazineId],
    references: [magazines.id],
  }),
}));

export const magazineImagesRelations = relations(magazineImages, ({ one }) => ({
  magazine: one(magazines, {
    fields: [magazineImages.magazineId],
    references: [magazines.id],
  }),
}));

export const magazineViewsRelations = relations(magazineViews, ({ one }) => ({
  magazine: one(magazines, {
    fields: [magazineViews.magazineId],
    references: [magazines.id],
  }),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminActivityLogs.adminId],
    references: [adminUsers.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  activityLogs: many(adminActivityLogs),
}));

export type Magazine = typeof magazines.$inferSelect;
export type NewMagazine = typeof magazines.$inferInsert;
export type MagazineBlock = typeof magazineBlocks.$inferSelect;
export type NewMagazineBlock = typeof magazineBlocks.$inferInsert;
export type MagazineImage = typeof magazineImages.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type MagazineView = typeof magazineViews.$inferSelect;
export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type NewAdminActivityLog = typeof adminActivityLogs.$inferInsert;

export interface MagazineBrandInfo {
  name: string;      // brandName
  url?: string;      // brandUrl (선택사항)
}