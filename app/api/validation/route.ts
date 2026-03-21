import { NextResponse } from "next/server";

import { getValidationDetails } from "@/lib/mirai/server";

export async function GET() {
  return NextResponse.json(await getValidationDetails());
}
