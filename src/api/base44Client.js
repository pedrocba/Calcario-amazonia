import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68954c8b2b3cb8a6182efcdb", 
  requiresAuth: true // Ensure authentication is required for all operations
});
