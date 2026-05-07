import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  status: text('status', { enum: ['pending', 'sent', 'failed'] }).notNull().default('pending'),
  toAddresses: text('to_addresses').notNull(),
  fromAddress: text('from_address').notNull(),
  subject: text('subject').notNull(),
  messageId: text('message_id'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  sentAt: integer('sent_at', { mode: 'timestamp_ms' }),
})

export type EmailLog = typeof emailLogs.$inferSelect
export type NewEmailLog = typeof emailLogs.$inferInsert
