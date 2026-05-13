export function getHost(address: string) {
  return address
    .replace(/^http:\/\//, '')
    .replace(/^https:\/\//, '')
    .replace(/\/$/, '')
    .replace(/(:([0-9]+))$/, '')
    .replace(/\[(:+)([0-9]*)\]/, '::');
}

export function getPort(address: string) {
  const rawPort = address
    .replace(/\/$/, '')
    .match(/(:([0-9]+))$/)
    ?.at(2);

  if (!rawPort) return 3e3;

  return _.toNumber(rawPort);
}

export async function getAddressURL() {
  let address = await _nestApp?.getUrl();
  if (!address) address = 'localhost';

  const https = false;
  const proto = https ? 'https' : 'http';

  let host = getHost(address);
  host = host.includes(':') ? `[${host}]` : host;
  if (host === '[::]') host = 'localhost';

  const port = getPort(address);

  return `${proto}://${host}:${port}`;
}
