'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import SpaceBackground from '@/components/SpaceBackground';

// Validation for form
const formSchema = z.object({
  aadhaar_number: z
    .string(),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    // .regex(/[0-9]/, { message: "Password must contain at least one number" })
    // .regex(/[?!@#$%^&*]/, { message: "Password must contain at least one special character" })
})

const LoginForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(data) {
    // const res = await signIn('userLogin', {
    //   redirect: false,
    //   aadhaar_number: data.aadhaar_number,
    //   password: data.password,
    //   user_type: 'User'
    // })
    // if (res && res.ok) {
    //   router.push('/schemes');
    // } else {
    //   console.log(res);
    // }
  }

  const [hiddenPassword, setHiddenPassword] = useState(true);
  function viewPassword() {
    setHiddenPassword(!hiddenPassword);
  }

 return (
  <div className='h-[100vh] w-[100vw] flex justify-center items-center bg-gray-900 text-gray-100'>
    <SpaceBackground />
    <div className='w-[90%] md:w-[50%] lg:w-[30%] rounded-2xl shadow-2xl p-10 relative z-10'>
      <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
        <h1 className='text-2xl font-semibold text-center m-3'>Login to your Account</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-[15px]'>
                  Username<span className='text-red-600'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Input your name" className='h-12 ' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-semibold text-[15px]'>
                  Password<span className='text-red-600'>*</span>
                </FormLabel>
                <div className='flex relative'>
                  <FormControl>
                    <Input placeholder="Input your password" className='h-12 ' type={hiddenPassword ? 'password' : 'text'} {...field} />
                  </FormControl>
                  {hiddenPassword ? (
                    <FontAwesomeIcon className='absolute right-3 top-3.5 cursor-pointer w-5 h-5' onClick={viewPassword} icon={faEye} />
                  ) : (
                    <FontAwesomeIcon className='absolute right-3 top-3.5 cursor-pointer w-5 h-5' onClick={viewPassword} icon={faEyeSlash} />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className='w-[100%] h-12 ' type="submit">Login</Button>

          {/* 👇 Signup Link */}
          <p className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up here
            </a>
          </p>
        </form>
      </Form>
    </div>
  </div>
)

}

export default LoginForm;