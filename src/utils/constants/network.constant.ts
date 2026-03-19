import { avalancheNetworkConfig } from './networkConfigs/avalanche.networkconfig'
import { ethNetworkConfig } from './networkConfigs/eth.ntworkconfig'
import { immutablezkevmNetworkConfig } from './networkConfigs/immutablezkevm.networkconfig'
import { katanaNetworkConfig } from './networkConfigs/katana.networkconfig'
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
  avalanche: avalancheNetworkConfig,
  eth: ethNetworkConfig,
  immutablezkevm: immutablezkevmNetworkConfig,
  katana: katanaNetworkConfig,
  monad: monadNetworkConfig,
  pol: polNetworkConfig,
};