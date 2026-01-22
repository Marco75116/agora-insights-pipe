import { ethNetworkConfig } from './networkConfigs/eth.ntworkconfig'

export type ContractConfig = {
  address: string;
  range: { from: number };
};

export type NetworkConfig = {
  portalUrl: string;
  chainId: number;
  chainTag: string;
  tokens: ContractConfig[];
};

export const networksConfigs: Record<string, NetworkConfig> = {
  eth: ethNetworkConfig,
};

export const tokensStartBlock = Math.min(
  ...Object.values(networksConfigs).flatMap((n) => n.tokens.map((t) => t.range.from))
);

export const tokenAddresses = Object.values(networksConfigs).flatMap((n) =>
  n.tokens.map((t) => t.address)
);