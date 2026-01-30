export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  ENDPOINTS: {
    USERS: '/users',
    TASKS: '/tasks',
    SCRUM_NOTES: '/scrum-notes',
    NOTIFICATIONS: '/notifications',
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
  },
} as const;
