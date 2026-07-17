"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/app/components/ui/Card";
import Link from "next/link";
import { useSignup } from "@/app/lib/hooks/auth/useSignup";
import { useRouter } from "next/navigation";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

//purpose:runtime form validation
const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Name dmust be of two charaters atleast")
      .max(50, "First name cannot exceed 50 characters"),
    lastName: z
      .string()
      .trim()
      .min(2, "The last name must be of 2 charters atleast")
      .max(50, "The last name should not exceed 50 characters"),
    email: z.email("Enter a valid email").trim().toLowerCase(),
    password: z.string().min(8, "Min password must be of 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

//
type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const { mutate, isPending, isSuccess, isError, error, data, reset } =
    useSignup();
  function onSubmit(data: SignupData) {
    mutate(data, {
      onSuccess(response) {
        showApiSuccess(response.message);
        router.push("/login");
      },

      onError(error) {
        showApiError(error);
      },
    });
  }

  return (
    <div className="rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur dark:bg-zinc-900/40 dark:ring-zinc-800">
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create account
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Fill in the details below to get started.
          </p>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              type="text"
              label="First Name"
              placeholder="Enter your first name"
              id="firstName"
              {...register("firstName")}
              error={errors.firstName?.message}
            />
            <Input
              type="text"
              label="Last Name"
              placeholder="Enter your last name"
              id="lastName"
              {...register("lastName")}
              error={errors.lastName?.message}
            />
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              id="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter password"
              id="password"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Enter confirm password"
              id="confirmPassword"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <div className="pt-2">
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? "Creating Account..." : "Sign up"}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <span className="mr-1">Already have an account?</span>
            <Link
              href="/login"
              className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
