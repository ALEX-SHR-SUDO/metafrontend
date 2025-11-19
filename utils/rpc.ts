/**
 * Common placeholder patterns that indicate an RPC endpoint is not properly configured
 */
const RPC_PLACEHOLDER_PATTERNS = [
  'YOUR_API_KEY',
  'YOUR_KEY',
  'REPLACE_ME',
  'API_KEY_HERE'
] as const;

/**
 * Validates if an RPC endpoint is properly configured and doesn't contain placeholder values
 * Type guard that narrows the type from `string | undefined` to `string`
 * @param endpoint The RPC endpoint URL to validate
 * @returns true if the endpoint is valid and ready to use, false otherwise
 */
export const isValidRpcEndpoint = (endpoint: string | undefined): endpoint is string => {
  if (!endpoint || endpoint.trim() === '') {
    return false;
  }
  
  // Check if endpoint contains placeholder text
  const hasPlaceholder = RPC_PLACEHOLDER_PATTERNS.some(placeholder => 
    endpoint.toUpperCase().includes(placeholder)
  );
  
  return !hasPlaceholder;
};
