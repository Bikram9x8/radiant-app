import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { fileName, fileType } = await req.json();

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "fileName and fileType are required" },
      { status: 400 }
    );
  }

  const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: safeFileName,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${safeFileName}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}