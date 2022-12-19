/// <reference types="@fastly/js-compute" />

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  if (event.request.method !== 'POST') {
    return new Response(`method not allowed`, { headers: new Headers({ status: 405 }) });
  }

  try {
    const keys = new Dictionary("keys");

    let newURL = new URL(event.request.url);
    newURL.host = 'api.pinata.cloud';
    const newRequest = new Request(event.request);
    newRequest.headers.set('Authorization', `Bearer ${keys.get('pinata_jwt')}`);
    return await fetch(newRequest, { backend: 'pinata' });

  } catch (e) {
    return new Response(`error :c`, { headers: new Headers({ status: 500, 'access-control-allow-origin': '*', }) });
  }
}
