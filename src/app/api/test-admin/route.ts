import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function GET() {
  return NextResponse.json({ success: true, message: "Admin imported successfully", type: typeof getAdminAuth });
}
