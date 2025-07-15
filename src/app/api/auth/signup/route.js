import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { username, password, isAdmin = false } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const user_id = crypto.randomUUID(); 

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_id,        
      username,
      password: hashedPassword,
      isAdmin,
    });

    return NextResponse.json(
      {
        message: 'Signup successful',
        user: {
          username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

