/// <reference types="@fastly/js-compute" />
import aws from 'aws-sdk';
import { randomBytes } from 'crypto';

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  if (event.request.method !== 'POST') {
    return new Response(`method not allowed`, { headers: new Headers({ status: 405 }) });
  }

  try {
    const random = randomBytes(32).toString("hex");

    const keys = new Dictionary("keys");

    const s3 = new aws.S3({
      apiVersion: '2006-03-01',
      accessKeyId: keys.get('access_key'),
      secretAccessKey: keys.get('secret_access_key'),
      endpoint: 'https://s3.filebase.com',
      region: 'us-east-1',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    const post = s3.createPresignedPost({
      Bucket: 'valist-test',
      Fields: {
        key: random,
      },
      Expires: 60,
    });

    return new Response(JSON.stringify(post), { headers: new Headers({ status: 200, 'content-type': 'application/json', 'access-control-allow-origin': '*', }) });
  } catch (e) {
    console.log(e)
    return new Response(`error :c`, { headers: new Headers({ status: 500 }) });
  }
}
