// base44Client.js — DEPRECATED. Use apiClient.js instead.
// This stub prevents import errors during transition.
export const base44 = {
  entities: new Proxy({}, { get: () => new Proxy({}, { get: () => () => Promise.resolve([]) }) }),
  auth: { me: () => Promise.reject(new Error('base44 removed')), logout: () => {}, redirectToLogin: () => {} },
};
