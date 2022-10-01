import React from 'react';
import ReactDOM from 'react-dom';
import { DAppProvider, Config, DEFAULT_SUPPORTED_CHAINS } from '@usedapp/core';

import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';

import { Chain } from '@usedapp/core';

export const ETHWChain: Chain = {
  chainId: 10001,
  chainName: 'ETHPoW',
  isTestChain: false,
  isLocalChain: false,
  getExplorerAddressLink: (address: string) => `https://www.oklink.com/en/ethw/address/${address}`,
  getExplorerTransactionLink: (transactionHash: string) => `https://www.oklink.com/en/ethw/tx/${transactionHash}`,
  // Optional parameters:
  rpcUrl: 'https://mainnet.ethereumpow.org',
  blockExplorerUrl: 'https://www.oklink.com/en/ethw',
  nativeCurrency: {
    name: 'ETHW',
    symbol: 'ETHW',
    decimals: 18,
  },
  multicallAddress: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
  multicall2Address: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
};

const config: Config = {
  readOnlyChainId: ETHWChain.chainId,
  readOnlyUrls: {
    [ETHWChain.chainId]: 'https://mainnet.ethereumpow.org',
  },
  networks: [...DEFAULT_SUPPORTED_CHAINS, ETHWChain],
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <HashRouter>
        <App />
      </HashRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
