CREATE TABLE IF NOT EXISTS erc20_transfers (
    id String,
    chain_id UInt16,
    block_number UInt64,
    token FixedString(42),
    from FixedString(42),
    to FixedString(42),
    amount String
) ENGINE = ReplacingMergeTree()
ORDER BY (chain_id, id);

-- Balance tracking table (automatically aggregated)
CREATE TABLE IF NOT EXISTS balances (
    chain_id UInt16,
    wallet_address FixedString(42),
    token_address FixedString(42),
    amount Int256
) ENGINE = SummingMergeTree()
ORDER BY (chain_id, wallet_address, token_address);

-- Materialized view: automatically track incoming transfers (balance increases)
CREATE MATERIALIZED VIEW IF NOT EXISTS balances_incoming TO balances AS
SELECT
    chain_id,
    to as wallet_address,
    token as token_address,
    CAST(amount AS Int256) as amount
FROM erc20_transfers;

-- Materialized view: automatically track outgoing transfers (balance decreases)
CREATE MATERIALIZED VIEW IF NOT EXISTS balances_outgoing TO balances AS
SELECT
    chain_id,
    `from` as wallet_address,
    token as token_address,
    -CAST(amount AS Int256) as amount
FROM erc20_transfers;
