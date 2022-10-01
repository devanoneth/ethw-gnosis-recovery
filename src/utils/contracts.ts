import { utils } from 'ethers';
import GnosisABI from '../assets/gnosis-safe.abi.json';
export const Gnosis = new utils.Interface(GnosisABI);
