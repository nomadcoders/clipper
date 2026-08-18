CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_reference` text NOT NULL,
	`pet_name` text NOT NULL,
	`pet_breed` text NOT NULL,
	`groomer_id` text,
	`package_id` text NOT NULL,
	`address` text NOT NULL,
	`neighborhood` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`price_cents` integer NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`groomer_id`) REFERENCES `groomers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `grooming_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_booking_reference_unique` ON `appointments` (`booking_reference`);--> statement-breakpoint
CREATE TABLE `groomer_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`groomer_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`groomer_id`) REFERENCES `groomers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groomer_service_areas` (
	`groomer_id` text NOT NULL,
	`neighborhood` text NOT NULL,
	PRIMARY KEY(`groomer_id`, `neighborhood`),
	FOREIGN KEY (`groomer_id`) REFERENCES `groomers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groomers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`phone` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grooming_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`price_cents` integer NOT NULL
);
