function getRequiredEnv(key: string): string {
  const value = Bun.env[key]
  if (!value) {
    console.error(`Missing required environment variable: ${key}`)
    process.exit(1)
  }
  return value
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return Bun.env[key] || defaultValue
}

export const env = {
  CLICKHOUSE_URL: getRequiredEnv('CLICKHOUSE_URL'),
  LOG_LEVEL: getOptionalEnv('LOG_LEVEL', 'info'),
}
