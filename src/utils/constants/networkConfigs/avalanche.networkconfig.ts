import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

const tokens = [
    {
        address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
        range: { from: 48_507_997 },
    },
];

export const avalancheNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/avalanche-mainnet',
    chainId: 43114,
    chainTag: 'avalanche',
    tokens,
    tokensStartBlock: Math.min(...tokens.map((t) => t.range.from)),
    tokenAddresses: tokens.map((t) => t.address),
}
