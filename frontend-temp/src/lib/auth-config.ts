import CredentialsProvider from 'next-auth/providers/credentials'
import type { JWT } from "next-auth/jwt"
import type { Session, User } from "next-auth"

export const authOptions = {
  providers: [
    // Temporarily commented out Google OAuth until credentials are configured
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your backend API to verify credentials
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (response.ok && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              userType: data.user.userType,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.userType = (user as User & { userType?: string }).userType
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as Session['user'] & { userType?: string }).userType = token.userType as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
  }
}
