CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`unit` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_user_id` ON `members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_email` ON `members` (`email`);--> statement-breakpoint
CREATE TABLE `records` (
	`key` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`unit` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`unique_key` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `records_unit_kind` ON `records` (`unit`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `records_unique_key` ON `records` (`unique_key`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL
);
