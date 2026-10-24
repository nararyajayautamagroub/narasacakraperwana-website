import {NextResponse} from "next/server";
import {db} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  const sourceConfig = process.env.SCRAPER_SOURCES;
  let scraperSourceCount: number | null = null;
  if (sourceConfig) {
    try {
      const parsed: unknown = JSON.parse(sourceConfig);
      scraperSourceCount = Array.isArray(parsed) ? parsed.length : null;
    } catch {
      scraperSourceCount = null;
    }
  }

  const checks = {
    database,
    nextAuth: Boolean(process.env.NEXTAUTH_SECRET),
    googleOAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: process.env.GITHUB_TOKEN ? "authenticated" : "public-only",
    ai: process.env.OPENAI_API_KEY ? "configured" : "not-configured",
    paymentWebhook: process.env.PAYMENT_WEBHOOK_SECRET ? "configured" : "not-configured",
    qrisCheckout: process.env.NEXT_PUBLIC_QRIS_IMAGE_URL ? "configured" : "not-configured",
    whatsappCheckout: process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER ? "configured" : "not-configured",
    scraperSecret: Boolean(process.env.CRON_SECRET || process.env.SCRAPER_RUN_SECRET),
    scraperAllowlist: Boolean(process.env.SCRAPER_ALLOWED_HOSTS),
    scraperSourceCount,
  };

  // Optional integrations are reported for diagnostics but do not make the
  // whole website unhealthy when intentionally left unconfigured.
  const ok = database === "ok" && checks.nextAuth;
  return NextResponse.json(
    { status: ok ? "ok" : "degraded", timestamp: new Date().toISOString(), checks },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
