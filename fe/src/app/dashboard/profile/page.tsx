"use client";

import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { useProfile } from "@/app/lib/hooks/useProfile";

export default function ProfilePage() {
  const { data, isLoading, isError } = useProfile();

  if (isLoading) {
    return <Loader text="Loading profile..." />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Unable to load your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <Card>
        <div className="flex items-center gap-6 border-b border-zinc-200 pb-6 dark:border-zinc-700">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
            {data.firstName?.charAt(0)}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {data.firstName} {data.lastName}
            </h1>

            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {data.email}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">First Name</p>

            <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
              {data.firstName}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">Last Name</p>

            <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
              {data.lastName}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700 md:col-span-2">
            <p className="text-sm text-zinc-500">Email Address</p>

            <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
              {data.email}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
