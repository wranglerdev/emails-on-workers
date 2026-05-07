import { P, Sub, IC, CodeBlock, FieldTable } from '../primitives'

export function AuthSection() {
  return (
    <div className="flex flex-col gap-3">
      <P>
        All <IC>/v1/*</IC> endpoints require an API key. Two header conventions are accepted — use whichever fits your HTTP client:
      </P>
      <CodeBlock>{`Authorization: Bearer <your-api-key>
# or
x-api-key: <your-api-key>`}</CodeBlock>
      <Sub>Creating an API key</Sub>
      <P>
        API keys are managed through the Better Auth API. Make an authenticated request (session cookie) to create one:
      </P>
      <CodeBlock>{`POST /api/auth/api-key/create
Content-Type: application/json

{ "name": "production" }`}</CodeBlock>
      <P>
        The response contains a <IC>key</IC> field — this is your API key. Save it immediately; it won't be shown again.
      </P>
      <Sub>Managing keys</Sub>
      <FieldTable rows={[
        { field: 'GET /api/auth/api-key/list', desc: 'List all active keys for your account.' },
        { field: 'POST /api/auth/api-key/delete', desc: 'Revoke a key by its ID.' },
      ]} />
      <P>
        A missing or invalid key returns <IC>401 Unauthorized</IC>.
      </P>
    </div>
  )
}
