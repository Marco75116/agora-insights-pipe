CREATE TABLE IF NOT EXISTS erc20_transfers (
    id String,
    chain_id UInt64,
    block_number UInt64,
    token String,
    from String,
    to String,
    amount String
) ENGINE = ReplacingMergeTree()
ORDER BY (chain_id, id);
