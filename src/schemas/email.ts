import { z } from 'zod'

const emailAddressSchema = z.email('Invalid email address')

const namedAddressSchema = z.object({
  email: z.email('Invalid email address'),
  name: z.string().min(1, 'Display name cannot be empty'),
})

const addressSchema = z.union([emailAddressSchema, namedAddressSchema])

const recipientSchema = z.union([
  emailAddressSchema,
  z
    .array(emailAddressSchema)
    .min(1, 'Recipient list must contain at least one address')
    .max(50, 'Maximum of 50 recipients allowed per field'),
])

// 10 MB expressed as base64 character count (ceil(10 * 1024 * 1024 / 3) * 4)
const MAX_ATTACHMENT_BASE64_CHARS = 13_981_016
const MAX_ATTACHMENTS = 20

const base64ContentSchema = z
  .string()
  .min(1, 'Attachment content must be a non-empty base64-encoded string')
  .max(MAX_ATTACHMENT_BASE64_CHARS, 'Attachment exceeds the 10 MB size limit')
  .regex(/^[A-Za-z0-9+/]*={0,2}$/, 'Attachment content must be valid base64')

// No path separators or null bytes; capped at 255 chars (POSIX limit)
const filenameSchema = z
  .string()
  .min(1, 'Attachment filename is required')
  .max(255, 'Attachment filename must be 255 characters or fewer')
  .regex(
    /^[^/\\:*?"<>|\x00]+$/,
    'Attachment filename must not contain path separators or special characters',
  )

// Strict type/subtype MIME format
const mimeTypeSchema = z
  .string()
  .regex(
    /^[a-z]+\/[a-z0-9][a-z0-9!#$&\-^_.+]*$/i,
    'Attachment type must be a valid MIME type (e.g. "image/png", "application/pdf")',
  )

// Content-ID as used in cid: references — no angle brackets, safe chars only
const contentIdSchema = z
  .string()
  .min(1, 'contentId is required for inline attachments — it is referenced in HTML via cid:<contentId>')
  .max(255, 'contentId must be 255 characters or fewer')
  .regex(
    /^[A-Za-z0-9\-_.@]+$/,
    'contentId must contain only alphanumeric characters, hyphens, underscores, dots, or @',
  )

const inlineAttachmentSchema = z.object({
  disposition: z.literal('inline'),
  contentId: contentIdSchema,
  filename: filenameSchema,
  type: mimeTypeSchema,
  content: base64ContentSchema,
})

const regularAttachmentSchema = z.object({
  disposition: z.literal('attachment'),
  filename: filenameSchema,
  type: mimeTypeSchema,
  content: base64ContentSchema,
})

const attachmentSchema = z.discriminatedUnion('disposition', [
  inlineAttachmentSchema,
  regularAttachmentSchema,
])

const sendBodySchema = z
  .object({
    to: recipientSchema,
    from: addressSchema,
    subject: z.string().min(1, 'Subject cannot be empty').max(998, 'Subject exceeds RFC 5322 limit of 998 characters'),
    html: z.string().optional(),
    text: z.string().optional(),
    cc: recipientSchema.optional(),
    bcc: recipientSchema.optional(),
    replyTo: addressSchema.optional(),
    attachments: z
      .array(attachmentSchema)
      .max(MAX_ATTACHMENTS, `Maximum of ${MAX_ATTACHMENTS} attachments allowed per email`)
      .optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.html !== undefined || data.text !== undefined, {
    message: 'At least one of "html" or "text" must be provided',
    path: ['html'],
  })

export { sendBodySchema }
