CREATE TABLE IF NOT EXISTS erc20_transfers (
    id String CODEC(ZSTD(3)),
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    block_number UInt64 CODEC(DoubleDelta, ZSTD(3)),
    timestamp DateTime CODEC(DoubleDelta, ZSTD(3)),
    token FixedString(42) CODEC(ZSTD(9)),
    from FixedString(42) CODEC(ZSTD(3)),
    to FixedString(42) CODEC(ZSTD(3)),
    amount String CODEC(ZSTD(3))
) ENGINE = ReplacingMergeTree()
ORDER BY (chain_id, id);

-- Balance tracking table (automatically aggregated)
CREATE TABLE IF NOT EXISTS balances (
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    wallet_address FixedString(42) CODEC(ZSTD(3)),
    token_address FixedString(42) CODEC(ZSTD(9)),
    amount Int256 CODEC(ZSTD(3))
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

-- Balance snapshots: track balance changes at each block
CREATE TABLE IF NOT EXISTS balance_snapshots (
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    block_number UInt64 CODEC(DoubleDelta, ZSTD(3)),
    wallet_address FixedString(42) CODEC(ZSTD(3)),
    token_address FixedString(42) CODEC(ZSTD(9)),
    delta Int256 CODEC(ZSTD(3)),
    sign Int8 CODEC(ZSTD(1))
) ENGINE = SummingMergeTree()
ORDER BY (chain_id, wallet_address, token_address, block_number);

-- Snapshot incoming transfers
CREATE MATERIALIZED VIEW IF NOT EXISTS snapshots_incoming TO balance_snapshots AS
SELECT
    chain_id,
    block_number,
    to as wallet_address,
    token as token_address,
    CAST(amount AS Int256) as delta,
    1 as sign
FROM erc20_transfers;

-- Snapshot outgoing transfers
CREATE MATERIALIZED VIEW IF NOT EXISTS snapshots_outgoing TO balance_snapshots AS
SELECT
    chain_id,
    block_number,
    `from` as wallet_address,
    token as token_address,
    -CAST(amount AS Int256) as delta,
    1 as sign
FROM erc20_transfers;

-- Total supply tracking (mints - burns)
CREATE TABLE IF NOT EXISTS total_supply (
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    token_address FixedString(42) CODEC(ZSTD(9)),
    amount Int256 CODEC(ZSTD(3))
) ENGINE = SummingMergeTree()
ORDER BY (chain_id, token_address);

-- Materialized view: track mints (transfers from zero address)
CREATE MATERIALIZED VIEW IF NOT EXISTS total_supply_mints TO total_supply AS
SELECT
    chain_id,
    token as token_address,
    CAST(amount AS Int256) as amount
FROM erc20_transfers
WHERE `from` = '0x0000000000000000000000000000000000000000';

-- Materialized view: track burns (transfers to zero address)
CREATE MATERIALIZED VIEW IF NOT EXISTS total_supply_burns TO total_supply AS
SELECT
    chain_id,
    token as token_address,
    -CAST(amount AS Int256) as amount
FROM erc20_transfers
WHERE `to` = '0x0000000000000000000000000000000000000000';

-- Daily transfer statistics
CREATE TABLE IF NOT EXISTS transfer_stats_daily (
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    token_address FixedString(42) CODEC(ZSTD(9)),
    date Date CODEC(DoubleDelta, ZSTD(3)),
    transfer_count UInt64 CODEC(ZSTD(3)),
    volume Int256 CODEC(ZSTD(3))
) ENGINE = SummingMergeTree()
ORDER BY (chain_id, token_address, date);

-- Materialized view: aggregate daily transfer stats
CREATE MATERIALIZED VIEW IF NOT EXISTS transfer_stats_daily_mv TO transfer_stats_daily AS
SELECT
    chain_id,
    token as token_address,
    toDate(timestamp) as date,
    1 as transfer_count,
    CAST(amount AS Int256) as volume
FROM erc20_transfers;

-- Daily mint/burn statistics for charts
CREATE TABLE IF NOT EXISTS mint_burn_daily (
    chain_id UInt16 CODEC(DoubleDelta, ZSTD(3)),
    token_address FixedString(42) CODEC(ZSTD(9)),
    date Date CODEC(DoubleDelta, ZSTD(3)),
    mint_count UInt64 CODEC(ZSTD(3)),
    mint_volume Int256 CODEC(ZSTD(3)),
    burn_count UInt64 CODEC(ZSTD(3)),
    burn_volume Int256 CODEC(ZSTD(3))
) ENGINE = SummingMergeTree()
ORDER BY (chain_id, token_address, date);

-- Materialized view: daily mints (from zero address)
CREATE MATERIALIZED VIEW IF NOT EXISTS mint_daily_mv TO mint_burn_daily AS
SELECT
    chain_id,
    token as token_address,
    toDate(timestamp) as date,
    1 as mint_count,
    CAST(amount AS Int256) as mint_volume,
    0 as burn_count,
    0 as burn_volume
FROM erc20_transfers
WHERE `from` = '0x0000000000000000000000000000000000000000';

-- Materialized view: daily burns (to zero address)
CREATE MATERIALIZED VIEW IF NOT EXISTS burn_daily_mv TO mint_burn_daily AS
SELECT
    chain_id,
    token as token_address,
    toDate(timestamp) as date,
    0 as mint_count,
    0 as mint_volume,
    1 as burn_count,
    CAST(amount AS Int256) as burn_volume
FROM erc20_transfers
WHERE `to` = '0x0000000000000000000000000000000000000000';
