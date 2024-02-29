export const routes = {
  home: '/',
  app: {
    home: '/app',
    credentials: {
      home: '/app/credentials',
      overall: {
        home: '/app/credentials/overall'
      },
      pending: {
        home: '/app/credentials/pending'
      }
    },
    students: {
      home: '/app/students'
    },
    integrations: {
      home: '/app/integrations',
      sources: {
        home: '/app/integrations/sources'
      }
    },
    admin: {
      home: '/app/admin',
      users: {
        home: '/app/admin/users'
      }
    }
  },
  auth: {
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  }
};
