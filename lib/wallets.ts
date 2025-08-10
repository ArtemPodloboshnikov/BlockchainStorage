declare global {
  interface Window {
    arweaveWallet?: any;
  }
}

export type WalletType = 'arconnect' | 'phantom' | 'keplr' | 'metamask';

export async function connectWallet(type: WalletType) {
  switch (type) {
    case 'arconnect':
      if (!window.arweaveWallet) throw new Error('ArConnect not installed');
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
      return await window.arweaveWallet.getActiveAddress();

    case 'phantom':
      if (!window.solana?.isPhantom) throw new Error('Phantom not installed');
      await window.solana.connect();
      return window.solana.publicKey.toString();

    case 'keplr':
      if (!window.keplr) throw new Error('Keplr not installed');
      await window.keplr.enable('cosmoshub-4');
      const offlineSigner = window.keplr.getOfflineSigner('cosmoshub-4');
      const [acc] = await offlineSigner.getAccounts();
      return acc.address;

    case 'metamask':
      if (!window.ethereum) throw new Error('MetaMask not installed');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];

    default:
      throw new Error('Unsupported wallet');
  }
}