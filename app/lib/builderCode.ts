/**
 * Base Builder Code Attribution (ERC-8021)
 * 
 * Automatically appends Builder Code to all transactions for attribution.
 * This enables:
 * - Rewards from Base program
 * - Analytics tracking (volume, TVL, users)
 * - App Leaderboard visibility
 * - Base App store discovery
 * 
 * @see https://docs.base.org/specifications/builder-codes/for-app-developers
 */

// Builder Code: bc_h2u72tae
// ERC-8021 encoded suffix (hex)
export const BUILDER_CODE_SUFFIX = '0x62635f68327537327461650b0080218021802180218021802180218021' as const;

/**
 * Get Builder Code attribution suffix for transactions
 * 
 * Usage with useWriteContract:
 * ```typescript
 * writeContract({
 *   ...contractConfig,
 *   dataSuffix: getBuilderCodeSuffix(),
 * });
 * ```
 */
export function getBuilderCodeSuffix(): `0x${string}` {
  return BUILDER_CODE_SUFFIX;
}

/**
 * Verify if transaction data includes Builder Code
 * Useful for debugging attribution
 */
export function hasBuilderCode(data: string): boolean {
  return data.endsWith('80218021802180218021802180218021');
}
