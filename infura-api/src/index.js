/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  if (event.request.method !== 'POST') {
    return new Response(`method not allowed`, { headers: new Headers({ status: 405 }) });
  }

  try {
    const keys = new Dictionary("keys");

    let newURL = new URL(event.request.url);
    newURL.host = 'ipfs.infura.io';
    newURL.port = '5001';
    const newRequest = new Request(event.request);
    newRequest.headers.set('Authorization', `Basic ${keys.get('infura_auth')}`);
    return await fetch(newRequest, { backend: 'infura' });

  } catch (e) {
    return new Response(`error :c`, { headers: new Headers({ status: 500, 'access-control-allow-origin': '*', }) });
  }
}
