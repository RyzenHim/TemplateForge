"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// interface SignupData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }

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

type SignupData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  function onSubmit(data: SignupData) {
    console.log(data);
  }
  return (
    <div>
      <h1>This is the signup page</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
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
          label="Email Id"
          placeholder="Enter your email id"
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
        <Button type="submit">Signup</Button>
      </form>
    </div>
  );
}
