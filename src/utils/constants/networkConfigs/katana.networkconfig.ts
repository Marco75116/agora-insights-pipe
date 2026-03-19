import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

const tokens = [
    {
        address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
        range: { from: 1_798_357 },
    },
];

export const katanaNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/katana-mainnet',
    chainId: 747474,
    chainTag: 'katana',
    tokens,
    tokensStartBlock: Math.min(...tokens.map((t) => t.range.from)),
    tokenAddresses: tokens.map((t) => t.address),
}
