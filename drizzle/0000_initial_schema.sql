CREATE TABLE "kiraylink_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"landlord_id" text NOT NULL,
	"status" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "kiraylink_inquiries_status_check" CHECK ("kiraylink_inquiries"."status" IN ('pending', 'reviewed', 'responded'))
);
--> statement-breakpoint
CREATE TABLE "kiraylink_properties" (
	"id" text PRIMARY KEY NOT NULL,
	"landlord_id" text NOT NULL,
	"landlord_email" text NOT NULL,
	"status" text NOT NULL,
	"is_seed" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "kiraylink_properties_status_check" CHECK ("kiraylink_properties"."status" IN ('available', 'pending', 'rented'))
);
--> statement-breakpoint
CREATE TABLE "kiraylink_saved_properties" (
	"tenant_id" text NOT NULL,
	"property_id" text NOT NULL,
	"saved_at" text NOT NULL,
	CONSTRAINT "kiraylink_saved_properties_tenant_id_property_id_pk" PRIMARY KEY("tenant_id","property_id")
);
--> statement-breakpoint
CREATE TABLE "kiraylink_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"phone" text,
	"company" text,
	"created_at" text NOT NULL,
	CONSTRAINT "kiraylink_users_role_check" CHECK ("kiraylink_users"."role" IN ('tenant', 'landlord', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "kiraylink_saved_properties" ADD CONSTRAINT "kiraylink_saved_properties_tenant_id_kiraylink_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."kiraylink_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kiraylink_saved_properties" ADD CONSTRAINT "kiraylink_saved_properties_property_id_kiraylink_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."kiraylink_properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kiraylink_inquiries_tenant_idx" ON "kiraylink_inquiries" USING btree ("tenant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "kiraylink_inquiries_landlord_idx" ON "kiraylink_inquiries" USING btree ("landlord_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "kiraylink_properties_status_idx" ON "kiraylink_properties" USING btree ("status") WHERE "kiraylink_properties"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "kiraylink_properties_owner_idx" ON "kiraylink_properties" USING btree ("landlord_id","landlord_email") WHERE "kiraylink_properties"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "kiraylink_users_email_normalized_key" ON "kiraylink_users" USING btree ("email_normalized");