import { Fragment, useEffect, useState } from 'react';
import { useContractCall, useEtherBalance, useEthers } from '@usedapp/core';
import { Link, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { utils } from 'ethers';
import { Gnosis } from '../utils/contracts';
import Sign from './Sign';
import Send from './Send';
import { ETHWChain } from '..';

export default function Dapp() {
  const { activateBrowserWallet, account, chainId, library } = useEthers();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [multisigAddressInput, setMultisigAddressInput] = useState(
    searchParams.get('multisigAddress')?.toString() ?? ''
  );
  const [destinationAddressInput, setDestinationAddressInput] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );
  const [amountInput, setAmountInput] = useState(searchParams.get('amount')?.toString() ?? '');
  const [nonceInput, setNonceInput] = useState(searchParams.get('nonce')?.toString() ?? '');

  const [multisigAddress, setMultisigAddress] = useState(searchParams.get('multisigAddress')?.toString());
  const [destinationAddress, setDestinationAddress] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );

  const [linkButtonText, setLinkButtonText] = useState('Share Recovery Details');
  const [link, setLink] = useState(false);

  const [txHash, setTxHash] = useState('');

  const etherBalance = useEtherBalance(multisigAddress);

  useEffect(() => {
    if (!amountInput && etherBalance) {
      setAmountInput(utils.formatEther(etherBalance));
    }
  }, [etherBalance]);

  const [nonceContract] =
    useContractCall(
      multisigAddress && {
        abi: Gnosis,
        address: multisigAddress,
        method: 'nonce',
        args: [],
      }
    ) ?? [];

  const [versionContract] =
    useContractCall(
      multisigAddress && {
        abi: Gnosis,
        address: multisigAddress,
        method: 'VERSION',
        args: [],
      }
    ) ?? [];

  useEffect(() => {
    if (!nonceInput) {
      setNonceInput(nonceContract);
    }
  }, [nonceContract]);

  useEffect(() => {
    setSearchParams('', { replace: true });
  }, []);

  const onAddressInput = (address: string, inputSetter: any, setter: any) => {
    inputSetter(address);
    try {
      address = utils.getAddress(address);

      setter(address);
    } catch (err) {
      console.error(err);
      setter('');
      // TODO: Show error somewhere
    }
  };

  const [checked, setChecked] = useState(false);
  const handleChange = () => {
    setChecked(!checked);
  };

  const onNumberInput = (numberTarget: EventTarget & HTMLInputElement, inputSetter: any) => {
    numberTarget.validity.valid && inputSetter(numberTarget.value);
  };

  const onSuccess = (transactionHash: string) => {
    setTxHash(transactionHash);
  };

  return (
    <Fragment>
      <button type="button" disabled={!!account} onClick={() => activateBrowserWallet()}>
        {account ? 'connected' : 'connect'}
      </button>
      {account && <p>{account}</p>}

      {(chainId == undefined || chainId !== ETHWChain.chainId) && <p>Please connect to ETHW</p>}

      {account && library && chainId && chainId === ETHWChain.chainId && (
        <>
          <h3>Gnosis Multisig Address</h3>
          <input
            type="text"
            onChange={(e) => {
              onAddressInput(e.target.value, setMultisigAddressInput, setMultisigAddress);
              setAmountInput('');
            }}
            value={multisigAddressInput}
          />

          {multisigAddress && account && library && etherBalance && etherBalance.gt('0') && (
            <>
              <h3>Amount of ETHW to send</h3>
              <input
                type="text"
                pattern={`\\d*\\.?\\d{0,18}$`}
                onChange={(e) => onNumberInput(e.target, setAmountInput)}
                value={amountInput}
              />
              <p className="small">Prefilled to current balance, but you can manually change this if needed.</p>

              <h3>Send {amountInput} ETHW to</h3>
              <input
                type="text"
                onChange={(v) => onAddressInput(v.target.value, setDestinationAddressInput, setDestinationAddress)}
                value={destinationAddressInput}
              />

              {destinationAddress && amountInput && (
                <>
                  <h3>Gnosis Safe Nonce</h3>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    onChange={(e) => onNumberInput(e.target, setNonceInput)}
                    value={nonceInput}
                  />
                  <p className="small">Prefilled to current nonce, but you can manually change this if needed.</p>

                  <h3>Gnosis Safe Version</h3>
                  <p className="small">{versionContract}</p>

                  {versionContract !== '1.3.0' && (
                    <>
                      <p className="small">
                        Please note, your Gnosis Safe is on a version which does not check the chain id of the current
                        chain. If your Gnosis Safe on mainnet is also below v1.3.0 you could be prone to replay attacks
                        by sending your ETHW.
                      </p>
                      <p className="small">
                        <input type="checkbox" checked={checked} onChange={handleChange} />I understand, ignore chain id
                        in the signature.
                      </p>
                    </>
                  )}

                  {((versionContract !== '1.3.0' && checked) || versionContract === '1.3.0') && (
                    <>
                      <div>
                        <button
                          type="button"
                          onClick={async () => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}${process.env.PUBLIC_URL}#/sign?multisigAddress=${multisigAddress}&amount=${amountInput}&destinationAddress=${destinationAddress}&nonce=${nonceInput}`
                            );

                            setLinkButtonText('Copied to cliboard...');
                            setLink(true);

                            setTimeout(() => {
                              setLinkButtonText('Share Recovery Details');
                              setLink(false);
                            }, 3 * 1000);
                          }}
                        >
                          {linkButtonText}
                        </button>
                      </div>

                      {link && (
                        <div>
                          <p className="small">
                            Send this link to any other signatories on the multisig and ask them to also Sign.
                          </p>
                        </div>
                      )}

                      <div className="tabs">
                        <Link
                          to="/sign"
                          style={{
                            fontWeight: location.pathname == '/sign' ? 'bold' : 'normal',
                          }}
                        >
                          Sign
                        </Link>
                        <Link
                          to="/send"
                          style={{
                            fontWeight: location.pathname == '/send' ? 'bold' : 'normal',
                          }}
                        >
                          Send
                        </Link>
                      </div>

                      <Routes>
                        <Route
                          path="/sign"
                          element={
                            <Sign
                              multisigAddress={multisigAddress}
                              destinationAddress={destinationAddress}
                              amount={utils.parseEther(amountInput)}
                              nonce={parseInt(nonceInput)}
                              ignoreChainId={versionContract !== '1.3.0' && checked}
                            />
                          }
                        />
                        <Route
                          path="/send"
                          element={
                            <Send
                              multisigAddress={multisigAddress}
                              destinationAddress={destinationAddress}
                              amount={utils.parseEther(amountInput)}
                              nonce={parseInt(nonceInput)}
                              ignoreChainId={versionContract !== '1.3.0' && checked}
                              onSuccess={onSuccess}
                            />
                          }
                        />
                      </Routes>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {account && library && etherBalance && etherBalance.eq('0') && txHash && (
            <p>
              Successfully cleared the wallet of all ETHW in this transaction:{' '}
              <a href={`${ETHWChain.blockExplorerUrl}/tx/${txHash}`} target="_blank">
                {txHash}
              </a>
              .
            </p>
          )}

          {account && library && etherBalance && etherBalance.eq('0') && !txHash && (
            <p className="small">No balance found!</p>
          )}
        </>
      )}
    </Fragment>
  );
}
