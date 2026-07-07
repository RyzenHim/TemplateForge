"use client";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useForm } from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  //   console.log(register("email"));

  function onSubmit(data: LoginFormData) {
    console.log(data);
  }

  return (
    <div className="border m-2 p-2 rounded-2xl">
      <h1>This is the login page</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" id="email" type="email" {...register("email")} />
        <Input
          label="Password"
          id="password"
          type="password"
          {...register("password")}
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
