RENAME TABLE `magazine_photo` TO `magazine_image`;--> statement-breakpoint
ALTER TABLE `brand` RENAME COLUMN `brand_profile_photo_url` TO `brand_profile_image_url`;--> statement-breakpoint
ALTER TABLE `magazine_image` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `magazine_image` ADD PRIMARY KEY(`image_id`);