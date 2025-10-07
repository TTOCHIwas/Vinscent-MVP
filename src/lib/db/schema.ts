import { pgTable, varchar, text, integer, bigserial, timestamp, boolean, date, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ✅ PostgreSQL Enum 선언 (테이블 밖에서 선언)
export const magazineCategoryEnum = pgEnum('magazine_category', ['official', 'unofficial']);
export const magazineStatusEnum = pgEnum('magazine_status', ['draft', 'published']);
export const blockTypeEnum = pgEnum('block_type', ['text', 'image']);
export const adminRoleEnum = pgEnum('admin_role', ['developer', 'designer', 'marketing', 'pm']);
export const adminActionEnum = pgEnum('admin_action', ['create', 'update', 'delete', 'view']);

// Magazine 테이블 (완전 블록 기반 시스템)
export const magazines = pgTable('magazine', {
  id: bigserial('magazine_id', { mode: 'number' }).primaryKey(),
  title: varchar('magazine_title', { length: 100 }).notNull(),
  subtitle: varchar('magazine_subtitle', { length: 200 }),
  
  category: magazineCategoryEnum('magazine_category').notNull().default('official'),
  viewCount: integer('view_count').notNull().default(0),
  status: magazineStatusEnum('status').notNull().default('draft'),
  publishedDate: timestamp('published_date'),
  
  // 브랜드 직접 입력 방식
  brandName: varchar('brand_name', { length: 100 }).notNull(),
  brandUrl: varchar('brand_url', { length: 255 }),
  
  credits: text('credits'), // JSON 형태로 크레딧 정보 저장
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(), // onUpdateNow 제거
});

// Magazine Blocks 테이블 (블록 기반 콘텐츠)
export const magazineBlocks = pgTable('magazine_blocks', {
  id: bigserial('block_id', { mode: 'number' }).primaryKey(),
  magazineId: bigserial('magazine_id', { mode: 'number' }).notNull(),
  blockType: blockTypeEnum('block_type').notNull(),
  blockOrder: integer('block_order').notNull(),
  
  // 텍스트 블록용 필드
  textContent: text('text_content'),
  
  // 이미지 블록용 필드
  imageUrl: varchar('image_url', { length: 255 }),
  imageSource: varchar('image_source', { length: 100 }),
  
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
}, (table) => ({
  magazineOrderIndex: uniqueIndex('magazine_order_idx').on(table.magazineId, table.blockOrder),
}));

// Magazine Images 테이블 (상세 페이지 지원 - 레거시)
export const magazineImages = pgTable('magazine_image', {
  id: bigserial('image_id', { mode: 'number' }).primaryKey(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  imageOrder: integer('image_order').notNull(),
  imageCaption: varchar('image_caption', { length: 200 }),
  imageSource: varchar('image_source', { length: 100 }),
  magazineId: bigserial('magazine_id', { mode: 'number' }).notNull(),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Admin Users 테이블 (어드민 권한 관리)
export const adminUsers = pgTable('admin_users', {
  id: bigserial('admin_id', { mode: 'number' }).primaryKey(),
  name: varchar('admin_name', { length: 50 }).notNull(),
  role: adminRoleEnum('admin_role').notNull(),
  key: varchar('admin_key', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdDate: timestamp('created_date').defaultNow().notNull(),
  updatedDate: timestamp('updated_date').defaultNow().notNull(),
});

// Admin Activity Logs 테이블 (모든 관리자 활동 추적)
export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: bigserial('log_id', { mode: 'number' }).primaryKey(),
  action: adminActionEnum('action').notNull(),
  tableName: varchar('table_name', { length: 50 }).notNull(),
  recordId: bigserial('record_id', { mode: 'number' }).notNull(),
  adminId: bigserial('admin_id', { mode: 'number' }),
  adminName: varchar('admin_name', { length: 50 }),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  changes: text('changes'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Magazine Views 테이블 (조회수 통계)
export const magazineViews = pgTable('magazine_views', {
  id: bigserial('view_id', { mode: 'number' }).primaryKey(),
  magazineId: bigserial('magazine_id', { mode: 'number' }).notNull(),
  viewDate: date('view_date').notNull(),
  viewCount: integer('view_count').notNull().default(1),
  createdDate: timestamp('created_date').defaultNow().notNull(),
}, (table) => ({
  uniqueMagazineDate: uniqueIndex('unique_magazine_date_idx').on(table.magazineId, table.viewDate),
}));

// ✅ Relations (변경 없음)
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

// ✅ 타입 정의 (변경 없음)
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
  name: string;
  url?: string;
}
