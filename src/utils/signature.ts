import { BigNumber, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ETHWChain } from '..';

export async function signTypedData(
  from: string,
  multisigAddress: string,
  destinationAddress: string,
  amount: BigNumber,
  nonce: number,
  provider: JsonRpcProvider
): Promise<string> {
  const msgParams = JSON.stringify({
    domain: {
      chainId: ETHWChain.chainId.valueOf(),
      verifyingContract: multisigAddress,
    },
    message: {
      to: destinationAddress,
      value: amount.toHexString(),
      data: [],
      operation: '0',
      safeTxGas: '0',
      baseGas: '0',
      gasPrice: '0',
      gasToken: '0x0000000000000000000000000000000000000000',
      refundReceiver: '0x0000000000000000000000000000000000000000',
      nonce,
    },
    primaryType: 'SafeTx',
    types: {
      EIP712Domain: [
        {
          type: 'uint256',
          name: 'chainId',
        },
        {
          type: 'address',
          name: 'verifyingContract',
        },
      ],
      SafeTx: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'bytes', name: 'data' },
        { type: 'uint8', name: 'operation' },
        { type: 'uint256', name: 'safeTxGas' },
        { type: 'uint256', name: 'baseGas' },
        { type: 'uint256', name: 'gasPrice' },
        { type: 'address', name: 'gasToken' },
        { type: 'address', name: 'refundReceiver' },
        { type: 'uint256', name: 'nonce' },
      ],
    },
  });

  return await provider.send('eth_signTypedData_v4', [from, msgParams]);
}

export function recoverTypedData(
  multisigAddress: string,
  destinationAddress: string,
  amount: BigNumber,
  nonce: number,
  signature: string
): string {
  return utils.verifyTypedData(
    {
      chainId: ETHWChain.chainId.valueOf(),
      verifyingContract: multisigAddress,
    },
    {
      SafeTx: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'bytes', name: 'data' },
        { type: 'uint8', name: 'operation' },
        { type: 'uint256', name: 'safeTxGas' },
        { type: 'uint256', name: 'baseGas' },
        { type: 'uint256', name: 'gasPrice' },
        { type: 'address', name: 'gasToken' },
        { type: 'address', name: 'refundReceiver' },
        { type: 'uint256', name: 'nonce' },
      ],
    },
    {
      to: destinationAddress,
      value: amount.toHexString(),
      data: [],
      operation: '0',
      safeTxGas: '0',
      baseGas: '0',
      gasPrice: '0',
      gasToken: '0x0000000000000000000000000000000000000000',
      refundReceiver: '0x0000000000000000000000000000000000000000',
      nonce,
    },
    signature
  );
}
