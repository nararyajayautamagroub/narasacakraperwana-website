import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  transactionId: z.string().regex(/^NCRP-[0-9]{8}-[A-F0-9]{8}$/),
  status: z.literal("paid"),
  amount: z.number().int().positive(),
  currency: z.literal("IDR").default("IDR"),
  providerReference: z.string().trim().min(1).max(160),
});

function authorized(request: Request, secret: string) {
  const supplied = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: "Payment webhook belum dikonfigurasi." }, { status: 503 });
  }
  if (!authorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format payload tidak valid." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload pembayaran tidak valid." }, { status: 400 });
  }

  const { transactionId, amount } = parsed.data;
  try {
    const order = await db.order.findUnique({ where: { transactionId } });
    if (!order) return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    if (order.total !== amount) {
      return NextResponse.json({ error: "Nominal pembayaran tidak cocok." }, { status: 409 });
    }
    if (order.status === "PAID") {
      return NextResponse.json({ transactionId, status: "PAID", idempotent: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: `Transaksi berstatus ${order.status} dan tidak dapat dibayar.` }, { status: 409 });
    }
    const now = new Date();
    if (order.paymentExpiresAt <= now) {
      await db.order.updateMany({
        where: { id: order.id, status: "PENDING", paymentExpiresAt: { lte: now } },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ error: "Batas pembayaran telah berakhir." }, { status: 410 });
    }

    const updated = await db.order.updateMany({
      where: { id: order.id, status: "PENDING", paymentExpiresAt: { gt: now }, total: amount },
      data: { status: "PAID", paidAt: now, paymentMethod: "QRIS_GATEWAY" },
    });
    if (!updated.count) {
      return NextResponse.json({ error: "Status transaksi berubah. Periksa status terbaru sebelum mencoba lagi." }, { status: 409 });
    }
    return NextResponse.json({
      transactionId,
      status: "PAID",
      providerReference: parsed.data.providerReference,
      paidAt: now.toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Tidak dapat memproses notifikasi pembayaran." }, { status: 503 });
  }
}
