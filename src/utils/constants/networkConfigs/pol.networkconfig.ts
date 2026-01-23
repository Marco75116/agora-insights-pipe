import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

const tokens = [
    {
        address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
        range: { from: 66_071_168 },
    },
];

export const polNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/polygon-mainnet',
    chainId: 137,
    chainTag: 'pol',
    tokens,
    tokensStartBlock: Math.min(...tokens.map((t) => t.range.from)),
    tokenAddresses: tokens.map((t) => t.address),
}
