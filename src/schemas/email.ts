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

const inlineAttachmentSchema = z.object({
  disposition: z.literal('inline'),
  contentId: z
    .string()
    .min(
      1,
      'contentId is required for inline attachments — it is referenced in HTML via cid:<contentId>',
    ),
  filename: z.string().min(1, 'Attachment filename is required'),
  type: z.string().min(1, 'Attachment MIME type is required (e.g. "image/png")'),
  content: z.string().min(1, 'Attachment content must be a non-empty base64-encoded string'),
})

const regularAttachmentSchema = z.object({
  disposition: z.literal('attachment'),
  filename: z.string().min(1, 'Attachment filename is required'),
  type: z.string().min(1, 'Attachment MIME type is required (e.g. "application/pdf")'),
  content: z.string().min(1, 'Attachment content must be a non-empty base64-encoded string'),
})

const attachmentSchema = z.discriminatedUnion('disposition', [
  inlineAttachmentSchema,
  regularAttachmentSchema,
])

const sendBodySchema = z
  .object({
    to: recipientSchema,
    from: addressSchema,
    subject: z.string().min(1, 'Subject cannot be empty'),
    html: z.string().optional(),
    text: z.string().optional(),
    cc: recipientSchema.optional(),
    bcc: recipientSchema.optional(),
    replyTo: addressSchema.optional(),
    attachments: z.array(attachmentSchema).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .refine((data) => data.html !== undefined || data.text !== undefined, {
    message: 'At least one of "html" or "text" must be provided',
    path: ['html'],
  })

export { sendBodySchema }
