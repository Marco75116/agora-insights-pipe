import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

export const mantleNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/mantle-mainnet',
    chainId: 5000,
    chainTag: 'mantle',
    tokens: [
        {
            address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
            range: { from: 69_361_435 },
        },
    ],
}
