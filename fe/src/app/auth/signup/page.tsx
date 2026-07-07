"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useForm } from "react-hook-form";

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>();

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
        />
        <Input
          type="text"
          label="Last Name"
          placeholder="Enter your last name"
          id="lastName"
          {...register("lastName")}
        />
        <Input
          type="email"
          label="Email Id"
          placeholder="Enter your email id"
          id="email"
          {...register("email")}
        />
        <Input
          type="password"
          label="Password"
          placeholder="Enter password"
          id="password"
          {...register("password")}
        />
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Enter confirm password"
          id="confirmPassword"
          {...register("confirmPassword")}
        />
        <Button type="submit">Signup</Button>
      </form>
    </div>
  );
}
