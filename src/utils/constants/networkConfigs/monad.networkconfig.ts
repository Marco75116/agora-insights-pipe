import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

const tokens = [
    {
        address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
        range: { from: 27_901_301 },
    },
];

export const monadNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/monad-mainnet',
    chainId: 143,
    chainTag: 'monad',
    tokens,
    tokensStartBlock: Math.min(...tokens.map((t) => t.range.from)),
    tokenAddresses: tokens.map((t) => t.address),
}
