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
  // console.log("hey", loginSchema);
  // console.log("error", errors);

  //   console.log(register("email"));

  function onSubmit(data: LoginFormData) {
    // console.log(data);
  }
  console.log("error", errors);
  return (
    <div className="rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur dark:bg-zinc-900/40 dark:ring-zinc-800">
      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Login
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Welcome back. Enter your details to continue.
          </p>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <span className="mr-1">Don&apos;t have an account?</span>
          <Link
            href="/signup"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
