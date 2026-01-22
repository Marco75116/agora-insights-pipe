export function getTransferId(chainId: number, transactionHash: string, logIndex: number): string {
  return `${chainId}-${transactionHash}-${logIndex}`
}
