import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const { templateId } = await req.json();

  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 10);

  const params = {
    auth: {
      key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
      expires: expires.toISOString(),
    },
    template_id: templateId, 
  };

  const paramsString = JSON.stringify(params);

  const signature = crypto
    .createHmac("sha384", process.env.TRANSLOADIT_SECRET!)
    .update(paramsString)
    .digest("hex");

  return NextResponse.json({
    params: paramsString,
    signature,
  });
}
