export const routes = {
  home: '/',
  interoperability: '/interoperability',
  app: {
    home: '/app',
    credentials: {
      home: '/app/credentials',
      view: (id: string) => `/app/credentials/${id}`,
      overall: {
        home: '/app/credentials/overall'
      },
      pending: {
        home: '/app/credentials/pending'
      }
    },
    students: {
      home: '/app/students',
      view: (id: string) => `/app/students/${id}`
    },
    apiKeys: {
      home: '/app/apiKeys'
    },
    schemaTemplates: {
      home: '/app/schemas'
    },
    offers: {
      home: '/app/offers',
      view: (id: string) => `/app/offers/${id}`
    },
    interoperability: {
      home: '/app/interoperability'
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
