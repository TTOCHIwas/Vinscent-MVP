CREATE TABLE `magazine_blocks` (
	`block_id` bigint AUTO_INCREMENT NOT NULL,
	`magazine_id` bigint NOT NULL,
	`block_type` enum('text','image') NOT NULL,
	`block_order` int NOT NULL,
	`text_content` text,
	`image_url` varchar(255),
	`image_source` varchar(100),
	`image_caption` varchar(200),
	`image_description` text,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `magazine_blocks_block_id` PRIMARY KEY(`block_id`),
	CONSTRAINT `magazine_blocks_magazine_id_block_order_unique` UNIQUE(`magazine_id`,`block_order`)
);
--> statement-breakpoint
ALTER TABLE `magazine` ADD `is_block_based` boolean DEFAULT true NOT NULL;