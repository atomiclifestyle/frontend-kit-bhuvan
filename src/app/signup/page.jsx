"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import Link from "next/link";
import SpaceBackground from '@/components/SpaceBackground';

// Validation schema
const formSchema = z
  .object({
    full_name: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    mobile_number: z
      .string()
      .length(10, { message: "Phone number must be exactly 10 digits." })
      .regex(/^[6-9]\d{9}$/, {
        message: "Phone number must start with 6, 7, 8, or 9.",
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[?!@#$%^&*]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPass: z.string(),
  });

const SignInForm = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      full_name: "",
      mobile_number: "",
      confirmPass: "",
    },
  });

  async function onSubmit(data) {
    // const { confirmPass, ...userData } = data;
    // console.log(userData);
    // const res = await fetch(
    //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(userData),
    //   }
    // );
    // const response = await res.json();
    // if (res.ok) {
    //   router.push('/login')
    // }
    // console.log(response);
  }

  const [hiddenPassword, setHiddenPassword] = useState(true);
  function viewPassword() {
    setHiddenPassword(!hiddenPassword);
  }

  return (
    <div className='h-[100vh] w-[100vw] flex justify-center items-center bg-gray-900 text-gray-100'>
      <SpaceBackground />
      <div className='w-[90%] md:w-[50%] lg:w-[30%] rounded-2xl shadow-2xl p-10 relative bg-white text-black z-10'>
      <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-semibold text-center m-3 my-4">
          Create New Account
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[15px]">
                  Name<span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Input your name"
                    className="h-12 "
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel className="font-semibold text-[15px]">
                    Phone Number<span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Phone Number"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[15px]">
                  Password<span className="text-red-600">*</span>
                </FormLabel>
                <div className="flex relative">
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      className="h-12"
                      type={hiddenPassword ? "password" : "text"}
                      {...field}
                    />
                  </FormControl>
                  <FontAwesomeIcon
                    icon={hiddenPassword ? faEye : faEyeSlash}
                    onClick={viewPassword}
                    className="absolute right-3 top-3.5 cursor-pointer w-5 h-5 text-gray-600"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPass"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-[15px]">
                  Confirm Password<span className="text-red-600">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Re-enter password"
                    className="h-12"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full h-12" type="submit">
            Sign Up
          </Button>

          {/* 👇 Login Link */}
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </Form>
      </div>
    </div>
  );
};

export default SignInForm;