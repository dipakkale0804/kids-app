import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";

export async function GET() {
  return NextResponse.json({ success: true, message: "Firestore imported successfully", type: typeof getFirestore });
}
