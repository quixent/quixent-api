import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

let s3: S3Client | null = null;

function getS3(): S3Client {
  if (!s3) {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET must be set in .env');
    }
    s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }
  return s3;
}

export async function uploadToS3(base64: string, mimetype: string, folder: string): Promise<string> {
  const bucket = process.env.AWS_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) throw new Error('AWS_BUCKET and AWS_REGION must be set in .env');

  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg',
    'image/png': 'png', 'image/webp': 'webp',
  };
  const ext = mimeMap[mimetype.toLowerCase()] ?? 'jpg';
  const key = `${folder}/${crypto.randomBytes(16).toString('hex')}.${ext}`;

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 5 * 1024 * 1024) throw new Error('Image must be under 5MB');

  await getS3().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  }));

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
