import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";

export async function GET() {
  return NextResponse.json({ success: true, message: "Auth imported successfully", type: typeof getAuth });
}
