import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import clientPromise from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const doc = await db.collection("chat_history").findOne({
    userId: session.user.id,
  });

  return NextResponse.json({ history: doc?.history ?? [] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { history } = await req.json();
  if (!Array.isArray(history)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();

  await db.collection("chat_history").updateOne(
    { userId: session.user.id },
    {
      $set: {
        userId: session.user.id,
        history,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
