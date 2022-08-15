/// <reference types="@fastly/js-compute" />
import { CID } from 'multiformats/cid';

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const CID_REGEX = new RegExp(/^\/ipfs\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})/);

async function handleRequest(event) {
  const reqURL = new URL(event.request.url);
  try {
    const match = reqURL.pathname.match(CID_REGEX)[1];
    const cid = CID.parse(match);
    const newURL = new URL(`https://${cid.toV1().toString()}.ipfs.gateway.valist.io${reqURL.pathname.replace(CID_REGEX, '')}`);
    return new Response(null, { headers: new Headers({ location: newURL.toString(), 'access-control-allow-origin': '*', }), status: 302, url: newURL.toString() });
  } catch (e) {
    return new Response(`invalid cid :c ${reqURL.toString()}`, { headers: new Headers({ 'access-control-allow-origin': '*', })});
  }
}
