import { useContractCall, useContractFunction } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { Gnosis } from '../utils/contracts';
import { BigNumber, Contract } from 'ethers';
import { recoverTypedData } from '../utils/signature';
import { ETHWChain } from '..';

type AddressSignature = {
  address: string;
  sig: string;
};

const isAddressSignature = (item: AddressSignature | undefined): item is AddressSignature => {
  return !!item;
};

type SendProps = {
  multisigAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  nonce: number;
  onSuccess: any;
};

export default function Send({ multisigAddress, destinationAddress, amount, nonce, onSuccess }: SendProps) {
  const [signatureNumbers, setSignatureNumbers] = useState([0]);
  const [signatureInputs, setSignatureInputs] = useState(['']);
  const [addressOutputs, setAddressOuputs] = useState(['']);
  const [combinedSignatures, setCombinedSignatures] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  const [lastThreshold, setLastThreshold] = useState(0);

  const [threshold] =
    useContractCall(
      multisigAddress && {
        abi: Gnosis,
        address: multisigAddress,
        method: 'getThreshold',
        args: [],
      }
    ) ?? [];

  const GnosisContract = new Contract(multisigAddress, Gnosis);

  const { send, state } = useContractFunction(GnosisContract, 'execTransaction', {
    transactionName: 'ExecTransaction',
  });

  useEffect(() => {
    if (threshold) {
      const thresholdNumber = threshold.toNumber();

      if (lastThreshold !== thresholdNumber) {
        setLastThreshold(thresholdNumber);

        const signatureNumbersArray = [];
        const signatureInputsArray = [];
        const addressOutputsArray = [];
        for (let i = 0; i < thresholdNumber; i++) {
          signatureNumbersArray.push(i);
          signatureInputsArray.push('');
          addressOutputsArray.push('');
        }

        setSignatureNumbers(signatureNumbersArray);
        setSignatureInputs(signatureInputsArray);
        setAddressOuputs(addressOutputsArray);
      }
    }
  }, [threshold]);

  useEffect(() => {
    setCombinedSignatures('');
    const addressArray = addressOutputs.concat();

    const addressSignatureMap = signatureInputs.map((signatureInput, i) => {
      if (signatureInput.length == 132) {
        try {
          const address = recoverTypedData(multisigAddress, destinationAddress, amount, nonce, signatureInput);

          addressArray[i] = address;
          return {
            address: address,
            sig: signatureInput,
          };
        } catch (e) {
          console.error(e);
          addressArray[i] = '';
        }
      } else {
        addressArray[i] = '';
      }
    });
    setAddressOuputs(addressArray);

    const sortedSignatures = addressSignatureMap
      .filter(isAddressSignature)
      .sort((a, b) => {
        return a.address.localeCompare(b.address);
      })
      .map((addressSignature) => {
        return addressSignature.sig;
      });

    const signatureInputsWithoutPrefix = sortedSignatures.map((sig) => sig.replace('0x', ''));
    const signatures = signatureInputsWithoutPrefix.join('');

    if (signatures.length == 130 * lastThreshold) {
      setCombinedSignatures('0x' + signatures);
    }
  }, [signatureInputs]);

  useEffect(() => {
    if (state.status == 'Exception') {
      setStatusMessage(state.errorMessage ?? '');
    } else if (state.status == 'Mining') {
      setStatusMessage(`Mining...`);
      setTxHash(state?.transaction?.hash ?? '');
    } else if (state.status == 'Success') {
      onSuccess(state?.transaction?.hash);
      setTxHash(state?.transaction?.hash ?? '');
      setStatusMessage(`Success!`);
    }
  }, [state]);

  const onSignatureInput = (signature: string, signatureNumber: number) => {
    const signatureInputsArray = signatureInputs.concat();
    signatureInputsArray[signatureNumber] = signature;
    setSignatureInputs(signatureInputsArray);
  };

  return (
    <div className="main">
      {threshold && (
        <>
          <p>
            We detected that this Gnosis Multisig requires {lastThreshold} signatures before a transaction can be sent.
          </p>

          <p>
            Note: you should manually set a gas limit of around 500,000 in your wallet. Gnosis Safe TXs require quite a
            bit. This will be automated soon.
          </p>

          {signatureNumbers.map((signatureNumber) => {
            return (
              <div className="signatureInput" key={signatureNumber}>
                <h3>Signature {(signatureNumber + 1).toString()}</h3>
                <input
                  type="text"
                  onChange={(e) => onSignatureInput(e.target.value, signatureNumber)}
                  value={signatureInputs[signatureNumber]}
                />
                {addressOutputs[signatureNumber] && (
                  <p className="small">Signed by {addressOutputs[signatureNumber]}</p>
                )}
              </div>
            );
          })}

          {combinedSignatures && (
            <div>
              <button
                type="button"
                onClick={async () => {
                  await send(
                    destinationAddress,
                    amount,
                    '',
                    '0',
                    '0',
                    '0',
                    '0',
                    '0x0000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000',
                    combinedSignatures
                  );
                }}
              >
                Send
              </button>

              {statusMessage && <p className="small">{statusMessage}</p>}
              {txHash && (
                <p className="small">
                  <a href={`${ETHWChain.blockExplorerUrl}/tx/${txHash}`} target="_blank">
                    {txHash}
                  </a>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
