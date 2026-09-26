import { NextResponse } from "next/server";
import { DEMO_OVERVIEW } from "@/data/overview";
export async function GET() { return NextResponse.json(DEMO_OVERVIEW); }
