CREATE TABLE `admin_activity_logs` (
	`log_id` bigint AUTO_INCREMENT NOT NULL,
	`action` enum('create','update','delete','view') NOT NULL,
	`table_name` varchar(50) NOT NULL,
	`record_id` bigint NOT NULL,
	`admin_id` bigint,
	`admin_name` varchar(50),
	`ip_address` varchar(45) NOT NULL,
	`user_agent` text,
	`changes` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_logs_log_id` PRIMARY KEY(`log_id`)
);
--> statement-breakpoint
ALTER TABLE `magazine` MODIFY COLUMN `brand_id` bigint;--> statement-breakpoint
ALTER TABLE `magazine_image` ADD `image_caption` varchar(200);--> statement-breakpoint
ALTER TABLE `magazine_image` ADD `image_source` varchar(100);--> statement-breakpoint
ALTER TABLE `magazine_image` ADD `image_description` text;--> statement-breakpoint
ALTER TABLE `magazine` ADD `brand_name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `magazine` ADD `brand_url` varchar(255);--> statement-breakpoint
ALTER TABLE `magazine` ADD `credits` text;