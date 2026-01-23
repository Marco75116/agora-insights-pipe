import './utils/helpers/env.helper'
import { evmDecoder, evmPortalSource } from '@subsquid/pipes/evm'
import { clickhouseTarget } from '@subsquid/pipes/targets/clickhouse'
import { initSchemaStatements } from './schema'
import { clickhouseClient } from './utils/clients/clickhouse.client'
import { networksConfigs } from './utils/constants/network.constant'
import { portalSqliteCache } from '@subsquid/pipes/portal-cache/node'
import { getLogger } from './utils/helpers/global.helper'
import { getTransferId } from './utils/helpers/transfer.helper'
import type { TransferRecord } from './utils/types/global.type'
import * as ausdAbi from './abi/ausd'

// Validate network argument
const networkTag = Bun.argv[2]
if (!networkTag || !(networkTag in networksConfigs)) {
  console.error(
    `Processor takes a network ID argument. Must be one of: ${Object.keys(networksConfigs).join(', ')}. Got "${networkTag}".`
  )
  process.exit(1)
}

const networkConfig = networksConfigs[networkTag]!

async function main() {
  const logger = getLogger(networkConfig.chainTag);
  logger.info(`Starting indexer for chain ID ${networkConfig.chainId}`);

  await evmPortalSource({
    portal: {
      url: networkConfig.portalUrl,
      finalized: true,
    },
    cache: portalSqliteCache({
      path: `./${networkConfig.chainTag}-portal.cache.sqlite`,
    }),
    logger
  })
    .pipe(
      evmDecoder({
        range: { from: networkConfig.tokensStartBlock },
        events: {
          transfers: ausdAbi.events.Transfer,
        },
        contracts: networkConfig.tokenAddresses,
      }),
    )
    .pipe({
      transform: (data) => {
        const transfers: TransferRecord[] = data.transfers.map((t) => ({
          id: getTransferId(networkConfig.chainId, t.rawEvent.transactionHash, t.rawEvent.logIndex),
          chain_id: networkConfig.chainId,
          block_number: t.block.number,
          timestamp: Math.floor(t.timestamp.getTime() / 1000),
          token: t.contract,
          from: t.event.from,
          to: t.event.to,
          amount: t.event.value.toString(),
        }))
        return transfers
      },
    })
    .pipeTo(
      clickhouseTarget({
        client: clickhouseClient,
        onStart: async ({ store }) => {
          for (const stmt of initSchemaStatements) {
            await store.command({ query: stmt })
          }
        },
        onData: async ({ data, store }) => {
          if (data.length > 0) {
            await store.insert({
              table: 'erc20_transfers',
              values: data,
              format: 'JSONEachRow',
            })
          }
        },
      }),
    )
}

void main()