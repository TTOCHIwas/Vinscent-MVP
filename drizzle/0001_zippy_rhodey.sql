CREATE TABLE `admin_users` (
	`admin_id` bigint AUTO_INCREMENT NOT NULL,
	`admin_name` varchar(50) NOT NULL,
	`admin_role` enum('developer','designer','marketing','pm') NOT NULL,
	`admin_key` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_admin_id` PRIMARY KEY(`admin_id`),
	CONSTRAINT `admin_users_admin_key_unique` UNIQUE(`admin_key`)
);
--> statement-breakpoint
CREATE TABLE `magazine_views` (
	`view_id` bigint AUTO_INCREMENT NOT NULL,
	`magazine_id` bigint NOT NULL,
	`view_date` date NOT NULL,
	`view_count` int NOT NULL DEFAULT 1,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `magazine_views_view_id` PRIMARY KEY(`view_id`),
	CONSTRAINT `magazine_views_magazine_id_view_date_unique` UNIQUE(`magazine_id`,`view_date`)
);
--> statement-breakpoint
CREATE TABLE `product_image` (
	`image_id` bigint AUTO_INCREMENT NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`image_order` int NOT NULL,
	`image_description` varchar(200),
	`product_id` bigint NOT NULL,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_image_image_id` PRIMARY KEY(`image_id`)
);
--> statement-breakpoint
ALTER TABLE `magazine` ADD `magazine_subtitle` varchar(200);--> statement-breakpoint
ALTER TABLE `magazine` ADD `magazine_category` enum('official','unofficial') DEFAULT 'official' NOT NULL;--> statement-breakpoint
ALTER TABLE `magazine` ADD `view_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `magazine` ADD `status` enum('draft','published') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `magazine` ADD `published_date` timestamp;--> statement-breakpoint
ALTER TABLE `product` ADD `main_image_url` varchar(255);