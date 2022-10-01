import { useEthers } from '@usedapp/core';
import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { signTypedData } from '../utils/signature';

type BuildProps = {
  multisigAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  nonce: number;
};

export default function Sign({ multisigAddress, destinationAddress, amount, nonce }: BuildProps) {
  const { account, library } = useEthers();

  const [signature, setSignature] = useState('');

  useEffect(() => {
    signature && setSignature('');
  }, [multisigAddress, destinationAddress, amount, nonce]);

  return (
    <div className="main">
      {account && library && (
        <>
          <p>
            This will sign a Gnosis Multisig compatible message (based on{' '}
            <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank">
              EIP-712
            </a>
            ) for a transfer of {utils.formatEther(amount)} ETHW to {destinationAddress}.
          </p>
          <div>
            <button
              type="button"
              onClick={async () => {
                const localSignature = await signTypedData(
                  account,
                  multisigAddress,
                  destinationAddress,
                  amount,
                  nonce,
                  library
                );

                setSignature(localSignature);
              }}
            >
              Sign
            </button>
          </div>

          {signature && (
            <div>
              <div className="code" id="signatureAnchor">
                <pre>{signature}</pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signature);
                  }}
                >
                  Copy
                </button>
              </div>
              <p className="small">Copy this and use it in the "Send" tab.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
