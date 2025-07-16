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
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." }),
    confirmPass: z.string(),
  })
    .refine((data) => data.password === data.confirmPass, {
      message: "Passwords do not match.",
      path: ["confirmPass"], 
  });

const SignInForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      username: "",
      confirmPass: "",
    },
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      const { confirmPass, ...userData } = data;
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const response = await res.json();
      console.log(response);

      if (res.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
}

  const [hiddenPassword, setHiddenPassword] = useState(true);
  function viewPassword() {
    setHiddenPassword(!hiddenPassword);
  }

  return (
    <div className='h-[100vh] w-[100vw] flex justify-center items-center bg-gray-900 text-gray-100'>
      <SpaceBackground />
      <div className='w-[90%] md:w-[50%] lg:w-[30%] rounded-2xl shadow-2xl p-10 relative bg-white text-black z-10'>
      <Form {...form}>
        <h1 className="text-2xl font-semibold text-center m-3 my-4">
          Create New Account
        </h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
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

          <Button className="w-full h-12" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
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