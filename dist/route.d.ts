/**
 * The route a host app mounts at `src/app/api/bug-hunt/route.ts`:
 *
 *   export { POST } from '@berenyilevente/bug-hunt/route';
 *
 * One request per save step. With the flag off it answers 404 before reading
 * the body, so a production build gives away nothing about it.
 */
export declare function POST(request: Request): Promise<Response>;
