/// <reference types="@fastly/js-compute" />
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from 'crypto';

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  if (event.request.method !== 'POST') {
    return new Response(`method not allowed`, { headers: new Headers({ status: 405 }) });
  }

  try {
    const keys = new Dictionary("keys");

    const s3Client = new S3Client({
      endpoint: 'https://s3.filebase.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: keys.get('access_key'),
        secretAccessKey: keys.get('secret_access_key')
      },
    });

    const random = randomBytes(32).toString("hex");

    const bucketParams = {
      Bucket: 'valist',
      Key: random,
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return new Response(signedUrl, { headers: new Headers({ status: 200, 'access-control-allow-origin': '*', }) });
  } catch (e) {
    return new Response(`error :c`, { headers: new Headers({ status: 500, 'access-control-allow-origin': '*', }) });
  }
}
