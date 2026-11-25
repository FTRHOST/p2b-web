import { createAuthClient } from 'better-auth/react';
import { adminClient, usernameClient } from 'better-auth/client/plugins';
import { cmsAc, cmsRoles } from './authRoles';

// Hold Bearer token strictly in JS memory (never in localStorage or sessionStorage)
let inMemoryAuthToken = '';

export function getInMemoryAuthToken(): string {
  return inMemoryAuthToken;
}

export function setInMemoryAuthToken(token: string): void {
  inMemoryAuthToken = (token || '').trim();
}

export function clearInMemoryAuthToken(): void {
  inMemoryAuthToken = '';
}

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    adminClient({
      ac: cmsAc,
      roles: cmsRoles,
    }),
  ],
  fetchOptions: {
    credentials: 'include',
    auth: {
      type: 'Bearer',
      token: () => inMemoryAuthToken || undefined,
    },
    onResponse: (ctx) => {
      const authTokenHeader = ctx.response.headers.get('set-auth-token');
      if (authTokenHeader && authTokenHeader.trim()) {
        inMemoryAuthToken = authTokenHeader.trim();
      }
    },
  },
});
