import type { NetworkConfig } from "../network.constant";
import { normalizeAddress } from "../../helpers/global.helper";

export const ethNetworkConfig: NetworkConfig = {
    portalUrl: 'https://portal.sqd.dev/datasets/ethereum-mainnet',
    chainId: 1,
    chainTag: 'eth',
    tokens: [
        {
            address: normalizeAddress('0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'), // AUSD
            range: { from: 20_257_620 },
        },
    ],
} 
