import CredentialsProvider from 'next-auth/providers/credentials'
import NextAuth from 'next-auth'
import { connectToDB } from '@/lib/dbConnect'
import User from '@/models/User'
import bcrypt from 'bcryptjs';

export const authOptions = {
    providers: [
        CredentialsProvider({
            id: 'userLogin',
            name: 'User Login',
            credentials: {
                'username': { name: 'Username', type: 'text' },
                'password': { name: 'Password', type: 'password' },
            },
            authorize: async (credentials, req) => {
                if (!credentials) return null
                const { username , password } = credentials

                await connectToDB();

                const user = await User.findOne({ username: `${username}`})

                if (!user) return null;

                const isCorrect = await bcrypt.compare(password, user.password);

                if(isCorrect){
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    callbacks:{
        async jwt({token , user}){
            if(user){
                token.access_token = user.access_token,
                token.token_type = user.token_type,
                token.user_id = user.user_id
            }
            return token;
        },
        async session({session,token}){
            session.access_token = token.access_token,
            session.token_type = token.token_type,
            session.user_id = token.user_id
            return session;
        }
    },
    session:{
        strategy: 'jwt',
    },
    secret: `${process.env.NEXTAUTH_SECRET}`
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }