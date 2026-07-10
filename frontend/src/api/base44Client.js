// Mock Base44 client to silence 404 proxy logs and avoid external tracking
export const base44 = {
  auth: {
    me: async () => ({ role: 'user', full_name: 'Collector' }),
    redirectToLogin: () => {},
    loginWithProvider: () => {},
    logout: () => {},
    setToken: () => {},
  },
  appLogs: {
    logUserInApp: async () => {},
  },
  entities: new Proxy({}, {
    get: (target, entityName) => {
      // Mocking chat and other entity methods
      if (entityName === 'ChatMessage') {
        return {
          list: async () => [
            { id: '1', text: 'Hey fellow collectors! Spider-Man Pop is awesome.', author_name: 'Peter', author_initials: 'PP', author_email: 'peter@parker.com', created_date: new Date(Date.now() - 3600000).toISOString() },
            { id: '2', text: 'Just added Mickey Mouse Grail to my vault!', author_name: 'Mickey', author_initials: 'MM', author_email: 'mickey@disney.com', created_date: new Date(Date.now() - 1800000).toISOString() },
          ],
          subscribe: (callback) => {
            // No-op subscription
            return () => {};
          },
          create: async (data) => {
            return { id: Math.random().toString(), ...data, created_date: new Date().toISOString() };
          }
        };
      }
      return {
        list: async () => [],
        filter: async () => [],
        get: async () => ({}),
        create: async (data) => data,
        update: async (id, data) => data,
        delete: async () => ({}),
        subscribe: () => () => {},
      };
    }
  })
};
