CREATE TABLE `brand` (
	`brand_id` bigint AUTO_INCREMENT NOT NULL,
	`brand_title` varchar(100) NOT NULL,
	`brand_description` varchar(500),
	`brand_profile_photo_url` varchar(255),
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_brand_id` PRIMARY KEY(`brand_id`)
);
--> statement-breakpoint
CREATE TABLE `magazine_photo` (
	`image_id` bigint AUTO_INCREMENT NOT NULL,
	`image_url` varchar(255) NOT NULL,
	`image_order` int NOT NULL,
	`magazine_id` bigint NOT NULL,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `magazine_photo_image_id` PRIMARY KEY(`image_id`)
);
--> statement-breakpoint
CREATE TABLE `magazine` (
	`magazine_id` bigint AUTO_INCREMENT NOT NULL,
	`magazine_title` varchar(100) NOT NULL,
	`magazine_content` text,
	`brand_id` bigint NOT NULL,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `magazine_magazine_id` PRIMARY KEY(`magazine_id`)
);
--> statement-breakpoint
CREATE TABLE `product` (
	`product_id` bigint AUTO_INCREMENT NOT NULL,
	`product_title` varchar(100) NOT NULL,
	`product_description` varchar(500),
	`top_note` varchar(100),
	`middle_note` varchar(100),
	`base_note` varchar(100),
	`product_price` int NOT NULL,
	`brand_id` bigint NOT NULL,
	`created_date` timestamp NOT NULL DEFAULT (now()),
	`updated_date` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_product_id` PRIMARY KEY(`product_id`)
);
