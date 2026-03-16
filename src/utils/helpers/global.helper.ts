import pino from "pino";
import type { ClickHouseClient } from "@clickhouse/client";
import { env } from "./env.helper";

export function normalizeAddress(address: string): string {
    return address.trim().toLowerCase();
}

export async function getSyncCursor(client: ClickHouseClient, streamId: string) {
    try {
        const res = await client.query({
            query: `SELECT * FROM "default"."sync" WHERE id = {id:String} ORDER BY timestamp DESC LIMIT 1`,
            format: "JSONEachRow",
            query_params: { id: streamId },
        });
        const [row] = await res.json<{ current: string }>()
        if (row) {
            return JSON.parse(row.current)
        }
        return undefined
    } catch (e: unknown) {
        if (e instanceof Error && 'type' in e && (e as any).type === 'UNKNOWN_TABLE') {
            return undefined
        }
        throw e
    }
}

export function getLogger(chainTag: string) {
    const prefix = chainTag.toUpperCase();

    return pino({
        base: null,
        messageKey: "message",
        level: env.LOG_LEVEL,
        formatters: {
            level(label) {
                return { level: label.toUpperCase() };
            },
            log(object) {
                return {
                    ...object,
                    message: object.message ? `[${prefix}] ${object.message}` : undefined,
                };
            },
        },
        transport: process.stdout?.isTTY
            ? {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    messageKey: "message",
                    ignore: "pid,hostname",
                },
            }
            : undefined,
    });
}