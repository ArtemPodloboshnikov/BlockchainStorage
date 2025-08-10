'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { arweave, getPrice } from '@/lib/arweave';
import { connectWallet, WalletType } from '@/lib/wallets';

export default function DropZone() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>('arconnect');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    setFile(f);
    setCid(null);
    const p = await getPrice(f.size);
    setPrice(p);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || !wallet) return;
    setLoading(true);

    const buffer = Buffer.from(await file.arrayBuffer());
    const transaction = await arweave.createTransaction({ data: buffer });
    transaction.addTag('Content-Type', file.type);
    await arweave.transactions.sign(transaction);
    await arweave.transactions.post(transaction);

    setCid(transaction.id);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-mono">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-2 w-8 bg-cyan-400 mr-2"></div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
            ARWEAVE UPLOADER
          </h1>
          <div className="h-2 flex-1 bg-gradient-to-r from-purple-500 to-transparent ml-2 opacity-70"></div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-cyan-400 bg-gray-800 shadow-lg shadow-cyan-500/20'
              : 'border-gray-700 hover:border-cyan-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
            {isDragActive ? (
              <p className="text-cyan-400 font-medium">RELEASE TO UPLOAD</p>
            ) : (
              <>
                <p className="text-lg">Drag & drop files here</p>
                <p className="text-sm text-gray-400">or click to browse</p>
              </>
            )}
          </div>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium">{file.name}</h3>
                <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                {price && (
                  <div className="mt-2 flex items-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
                    <span className="text-cyan-400">Estimated cost: {price} AR</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              <label className="text-sm font-medium">SELECT WALLET</label>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value as WalletType)}
                className="bg-gray-900 border border-gray-700 text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="arconnect">ArConnect</option>
                <option value="phantom">Phantom</option>
                <option value="keplr">Keplr</option>
                <option value="metamask">MetaMask</option>
              </select>

              <button
                onClick={async () => {
                  try {
                    const addr = await connectWallet(walletType);
                    setWallet(addr);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded hover:opacity-90 transition-opacity flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                CONNECT
              </button>
            </div>

            {wallet && (
              <div className="mt-2 p-3 bg-gray-900 rounded border border-gray-700 flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                <span className="font-mono text-sm text-gray-300">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>

        {file && wallet && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`mt-6 w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center ${
              loading
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/30'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                UPLOADING TO ARWEAVE...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                UPLOAD TO PERMANENT STORAGE
              </>
            )}
          </button>
        )}

        {cid && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              <label className="text-sm font-medium">TRANSACTION COMPLETE</label>
            </div>
            <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-700">
              <a
                href={`https://arweave.net/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline flex items-center"
              >
                <span className="font-mono break-all">{cid}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}