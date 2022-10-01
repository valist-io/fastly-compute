/// <reference types="@fastly/js-compute" />
import { CID } from 'multiformats/cid';

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const CID_REGEX = new RegExp(/\/ipfs\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})/);

async function handleRequest(event) {
  const reqURL = new URL(event.request.url);

  const subdomain = reqURL.host.split('.')[0];

  const names = subdomain.split('--');

  const account = names[1];
  const project = names[0];

  const gql = JSON.stringify({
    query: `
    query LatestRelease($account: String, $project: String) {
      accounts(where:{name: $account}){
        projects(where:{name: $project}){
            releases(first: 1, orderBy: blockTime, orderDirection: desc) {
                metaURI
            }
        }
      }
    }`,
    variables: {
        account,
        project,
      }
  });

  const source = await fetch(`https://api.thegraph.com/subgraphs/name/valist-io/valist`, {
    backend: 'subgraph',
    method: 'POST', 
    body: gql,
  });

  const query = await source.json();

  const metaURI = query.data?.accounts[0]?.projects[0]?.releases[0]?.metaURI;
  const metaCID = CID.parse(new URL(metaURI).pathname.match(CID_REGEX)[1]);

  const release = await fetch(new URL(`https://${metaCID.toV1().toString()}.ipfs.gateway.valist.io`), { backend: 'gateway' });
  const releaseMeta = await release.json();
  const releaseURI = releaseMeta?.external_url;

  const cid = CID.parse(new URL(releaseURI).pathname.match(CID_REGEX)[1]);

  const newURL = new URL(`https://${cid.toV1().toString()}.ipfs.gateway.valist.io${reqURL.pathname}`);

  return await fetch(newURL, {
    backend: 'gateway'
  });
}
