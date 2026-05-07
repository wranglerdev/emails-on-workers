CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`to_addresses` text NOT NULL,
	`from_address` text NOT NULL,
	`subject` text NOT NULL,
	`message_id` text,
	`error_code` text,
	`error_message` text,
	`created_at` integer NOT NULL,
	`sent_at` integer
);
