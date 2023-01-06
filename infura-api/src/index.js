/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const validPaths = new RegExp("^\/api\/v0\/(add|pin\/add|pin\/ls)$");

async function handleRequest(event) {
  let reqUrl = new URL(event.request.url);

  if (event.request.method !== 'POST' || !reqUrl.pathname.match(validPaths)) {
    return new Response(`method not allowed`, { headers: new Headers({ status: 405 }) });
  }

  try {
    const keys = new Dictionary("keys");

    reqUrl.host = 'ipfs.infura.io';
    reqUrl.port = '5001';

    const newRequest = new Request(event.request);
    newRequest.headers.set('Authorization', `Basic ${keys.get('infura_auth')}`);

    return await fetch(newRequest, { backend: 'infura' });

  } catch (e) {
    return new Response(`error :c`, { headers: new Headers({ status: 500, 'access-control-allow-origin': '*', }) });
  }
}
