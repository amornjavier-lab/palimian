import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { env } = await getCloudflareContext();
    const { results } = await env.palimian.prepare('SELECT * FROM pages').all();
    return Response.json(results || []);
  } catch (error) {
    console.error("D1 Error:", error);
    return Response.json([], { status: 500 });
  }
}