import pino from "pino";
import { env } from "./env.helper";

export function normalizeAddress(address: string): string {
    return address.trim().toLowerCase();
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