"use client";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Card from "@/app/components/ui/Card";
import Link from "next/link";

// interface LoginFormData {
//   email: string;
//   password: string;
// }

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});
//this says read the schema and generate the typescript from it
//this is crewating the interface for the data from the form
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });
  console.log("hey", loginSchema);
  console.log("error", errors);

  //   console.log(register("email"));

  function onSubmit(data: LoginFormData) {
    console.log(data);
  }
  console.log("error", errors);
  return (
    <div className="border m-2 p-2 rounded-2xl">
      <h1>Login</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            error={errors.email?.message}
            label="Email"
            id="email"
            type="email"
            {...register("email")}
          />
          <Input
            error={errors.password?.message}
            label="Password"
            id="password"
            type="password"
            {...register("password")}
          />
          <Button type="submit">Login</Button>
        </form>
      </Card>

      <div>
        <h1>Dont have a account ?</h1>
        <Link href={"/auth/signup"}>Signup</Link>
      </div>
    </div>
  );
}
