import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("github_auth");

    if (!authCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const auth = JSON.parse(authCookie.value);
    return NextResponse.json({ success: true, data: auth });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 401 }
    );
  }
}
