export type WalletType = 'arconnect' | 'phantom' | 'keplr' | 'metamask';

const getWindow = () => window as any;

export async function connectWallet(type: WalletType): Promise<string> {
  switch (type) {
    case 'arconnect': {
      const w = getWindow();
      if (!w.arweaveWallet) throw new Error('ArConnect not installed');
      await w.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      return await w.arweaveWallet.getActiveAddress();
    }

    case 'phantom': {
      const w = getWindow();
      if (!w.solana?.isPhantom) throw new Error('Phantom not installed');
      await w.solana.connect();
      return w.solana.publicKey.toString();
    }

    case 'keplr': {
      const w = getWindow();
      if (!w.keplr) throw new Error('Keplr not installed');
      await w.keplr.enable('cosmoshub-4');
      const [acc] = await w.keplr
        .getOfflineSigner('cosmoshub-4')
        .getAccounts();
      return acc.address;
    }

    case 'metamask': {
      const w = getWindow();
      if (!w.ethereum) throw new Error('MetaMask not installed');
      const accounts: string[] = await w.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
    }

    default:
      throw new Error('Unsupported wallet');
  }
}