import { ethNetworkConfig } from './networkConfigs/eth.ntworkconfig'
import { mantleNetworkConfig } from './networkConfigs/mantle.networkconfig'
import { monadNetworkConfig } from './networkConfigs/monad.networkconfig'
import { polNetworkConfig } from './networkConfigs/pol.networkconfig'

export type ContractConfig = {
  address: string;
  range: { from: number };
};

export type NetworkConfig = {
  portalUrl: string;
  chainId: number;
  chainTag: string;
  tokens: ContractConfig[];
  tokensStartBlock: number;
  tokenAddresses: string[];
};

export const networksConfigs: Record<string, NetworkConfig> = {
  eth: ethNetworkConfig,
  mantle: mantleNetworkConfig,
  monad: monadNetworkConfig,
  pol: polNetworkConfig,
};