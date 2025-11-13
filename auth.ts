// NOTE: Google + credentials auth both sync into Supabase `users` so onboarding can detect ownership state.
import NextAuth, { type NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabaseServer';
import { ensurePlanStatus } from '@/lib/wallet';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !supabaseServer) {
          return null;
        }

        const { data, error } = await supabaseServer
          .from('users')
          .select('id, email, name, image, password_hash')
          .eq('email', credentials.email)
          .maybeSingle();

        if (error || !data || !data.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, data.password_hash);
        if (!isValid) {
          return null;
        }

        return {
          id: data.id,
          email: data.email,
          name: data.name ?? data.email,
          image: data.image ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (!token.sub || !supabaseServer) {
        return token;
      }

      try {
        await ensurePlanStatus(token.sub);

        const { data } = await supabaseServer
          .from('users')
          .select('id')
          .eq('id', token.sub)
          .maybeSingle();

        if (!data && account?.provider === 'google') {
          await supabaseServer.from('users').insert({
            id: token.sub,
            email: token.email ?? '',
            name: token.name ?? profile?.name ?? '',
            image: token.picture ?? null,
            plan_tier: 'free',
          });
        }

        const { data: restaurant } = await supabaseServer
          .from('restaurants')
          .select('id')
          .eq('owner_id', token.sub)
          .maybeSingle();

        (token as typeof token & { hasRestaurant?: boolean }).hasRestaurant = Boolean(restaurant);
      } catch (error) {
        console.warn('[auth] Supabase sync skipped:', (error as Error).message);
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.sub) {
        (session.user as typeof session.user & { id?: string; hasRestaurant?: boolean }).id = token.sub;
        (session.user as typeof session.user & { hasRestaurant?: boolean }).hasRestaurant = Boolean(
          (token as typeof token & { hasRestaurant?: boolean }).hasRestaurant
        );
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const auth = () => getServerSession(authOptions);
