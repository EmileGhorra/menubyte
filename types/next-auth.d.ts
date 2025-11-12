import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id?: string;
      hasRestaurant?: boolean;
    };
  }

  interface User {
    id: string;
    hasRestaurant?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    hasRestaurant?: boolean;
  }
}
