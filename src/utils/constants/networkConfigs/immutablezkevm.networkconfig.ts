import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

const tokens = [
    {
        address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
        range: { from: 22_187_926 },
    },
];

export const immutablezkevmNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/immutable-zkevm-mainnet',
    chainId: 13371,
    chainTag: 'immutablezkevm',
    tokens,
    tokensStartBlock: Math.min(...tokens.map((t) => t.range.from)),
    tokenAddresses: tokens.map((t) => t.address),
}
