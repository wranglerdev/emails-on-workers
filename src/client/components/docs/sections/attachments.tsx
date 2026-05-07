import { P, Sub, IC, CodeBlock, FieldTable } from '../primitives'

export function AttachmentsSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        Each attachment must be base64-encoded and include a MIME type. Up to 20 attachments per email, with a maximum of 10 MB each.
      </P>
      <Sub>Regular attachment</Sub>
      <P>
        Appears in the email's attachment tray. Use <IC>disposition: "attachment"</IC>:
      </P>
      <CodeBlock>{`{
  "disposition": "attachment",
  "filename": "report.pdf",
  "type": "application/pdf",
  "content": "<base64-encoded content>"
}`}</CodeBlock>
      <Sub>Inline attachment</Sub>
      <P>
        Embeds the file inside the HTML body via a <IC>cid:</IC> reference. Useful for images. Requires a <IC>contentId</IC> that you reference in the <IC>src</IC> attribute:
      </P>
      <CodeBlock>{`// Attachment object
{
  "disposition": "inline",
  "contentId": "logo",
  "filename": "logo.png",
  "type": "image/png",
  "content": "<base64-encoded content>"
}

// Reference it in your HTML body
<img src="cid:logo" alt="Logo" />`}</CodeBlock>
      <Sub>Fields</Sub>
      <FieldTable rows={[
        { field: 'disposition', type: 'string', required: true, desc: '"attachment" to appear in the tray, or "inline" to embed in HTML.' },
        { field: 'contentId',   type: 'string',                 desc: 'Required for inline only. Matches the cid: reference in your HTML.' },
        { field: 'filename',    type: 'string', required: true, desc: 'File name shown in the email client. Max 255 characters.' },
        { field: 'type',        type: 'string', required: true, desc: 'MIME type, e.g. "image/png" or "application/pdf".' },
        { field: 'content',     type: 'string', required: true, desc: 'Base64-encoded file content. Max 10 MB per file.' },
      ]} />
    </div>
  )
}
