import './utils/helpers/env.helper'
import { clickhouseClient } from './utils/clients/clickhouse.client'

const PORT = Number(process.env.PORT) || 3000

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

async function getWalletBalance(address: string): Promise<Record<string, unknown>> {
  const result = await clickhouseClient.query({
    query: `
      SELECT
        wallet_address,
        chain_id,
        token,
        balance
      FROM balances
      WHERE wallet_address = {address:String}
    `,
    query_params: { address: address.toLowerCase() },
    format: 'JSONEachRow',
  })
  const rows = await result.json()
  return { balances: rows }
}

function renderDashboard(address: string, isValidFormat: boolean, data: Record<string, unknown>): string {
  const errorBadge = !isValidFormat
    ? `<span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">Wrong format address</span>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wallet Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { margin-bottom: 24px; }
    .address-row { display: flex; align-items: center; margin-bottom: 16px; }
    .address { font-family: monospace; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; word-break: break-all; }
    .section { margin-top: 24px; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
    pre { background: #f8f9fa; padding: 16px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Wallet Dashboard</h1>

    <div class="section">
      <div class="section-title">Wallet Balance</div>
      <div class="address-row">
        <span class="address">${address}</span>
        ${errorBadge}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Data</div>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
  </div>
</body>
</html>`
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // Route: /dashboard/wallet/:address
    const walletMatch = path.match(/^\/dashboard\/wallet\/(.+)$/)
    if (walletMatch && walletMatch[1]) {
      const address = walletMatch[1]
      const isValidFormat = isValidEthereumAddress(address)

      let data: Record<string, unknown> = {}

      if (isValidFormat) {
        try {
          data = await getWalletBalance(address)
        } catch (error) {
          console.error('Error fetching wallet balance:', error)
          data = { error: 'Failed to fetch balance' }
        }
      }
      // If invalid format, data stays as empty object - no API calls

      const html = renderDashboard(address, isValidFormat, data)
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Default route
    return new Response('Not Found', { status: 404 })
  },
})

console.log(`Dashboard server running on http://localhost:${PORT}`)
