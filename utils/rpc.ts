/**
 * Validates if an RPC endpoint is properly configured and doesn't contain placeholder values
 * @param endpoint The RPC endpoint URL to validate
 * @returns true if the endpoint is valid and ready to use, false otherwise
 */
export const isValidRpcEndpoint = (endpoint: string | undefined): boolean => {
  if (!endpoint || endpoint.trim() === '') {
    return false;
  }
  
  // Check if endpoint contains placeholder text
  const placeholders = ['YOUR_API_KEY', 'YOUR_KEY', 'REPLACE_ME', 'API_KEY_HERE'];
  const hasPlaceholder = placeholders.some(placeholder => 
    endpoint.toUpperCase().includes(placeholder)
  );
  
  return !hasPlaceholder;
};
