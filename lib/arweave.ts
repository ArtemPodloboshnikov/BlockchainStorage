import Arweave from 'arweave';

export const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export async function getPrice(bytes: number): Promise<string> {
  const winston = await arweave.transactions.getPrice(bytes);
  return arweave.ar.winstonToAr(winston);
}