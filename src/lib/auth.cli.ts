// Used ONLY by `@better-auth/cli generate`. Not imported anywhere in the app.
import { createAuth } from './auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createAuth({} as any, 'http://localhost')
