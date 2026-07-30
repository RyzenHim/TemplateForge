"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  PackagePlus,
  Smartphone,
} from "lucide-react";

import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { useAddons } from "@/app/lib/hooks/addons/useAddons";
import { useApps } from "@/app/lib/hooks/app/useApps";
import { useTransactions } from "@/app/lib/hooks/payment/useTransactions";
import { useTemplates } from "@/app/lib/hooks/template/useTemplates";

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);

function OverviewCard({
  title,
  value,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-5 transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
          </div>
          <div className={`rounded-xl p-3 ${color}`}>{icon}</div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-zinc-500">
          <span>{description}</span>
          <ArrowRight size={16} className="text-indigo-500 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const appsQuery = useApps();
  const templatesQuery = useTemplates();
  const addonsQuery = useAddons();
  const transactionsQuery = useTransactions();

  if (
    appsQuery.isLoading ||
    templatesQuery.isLoading ||
    addonsQuery.isLoading ||
    transactionsQuery.isLoading
  ) {
    return <Loader text="Loading your dashboard..." />;
  }

  const apps = appsQuery.data ?? [];
  const templates = templatesQuery.data ?? [];
  const addons = addonsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const publishedApps = apps.filter((app) => app.status === "published").length;
  const purchasedApps = apps.filter((app) => app.status === "purchased").length;
  const successfulPayments = transactions.filter((payment) => payment.status === "success");
  const totalRevenue = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const recentApps = [...apps]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">TemplateForge overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Manage your apps, templates, add-ons, and payment activity from one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard title="Apps" value={apps.length} description={`${publishedApps} published · ${purchasedApps} purchased`} href="/dashboard/apps" icon={<Smartphone size={22} />} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300" />
        <OverviewCard title="Templates" value={templates.length} description="Your reusable starting points" href="/dashboard/templates" icon={<FileText size={22} />} color="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300" />
        <OverviewCard title="Add-ons" value={addons.length} description="Features ready to reuse" href="/dashboard/addons" icon={<PackagePlus size={22} />} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300" />
        <OverviewCard title="Payments" value={money(totalRevenue)} description={`${successfulPayments.length} successful transaction${successfulPayments.length === 1 ? "" : "s"}`} href="/dashboard/transactions" icon={<CircleDollarSign size={22} />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div><h2 className="font-semibold text-zinc-900 dark:text-white">Recent apps</h2><p className="mt-1 text-sm text-zinc-500">Your most recently updated applications.</p></div>
            <Link href="/dashboard/apps" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View all</Link>
          </div>
          {recentApps.length ? <div>{recentApps.map((app) => <Link key={app.id} href={`/dashboard/apps/${app.id}`} className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><Smartphone size={18} /></div><div className="min-w-0"><p className="truncate font-medium text-zinc-900 dark:text-white">{app.name}</p><p className="mt-1 truncate text-xs text-zinc-500">{app.packageName}</p></div></div><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{app.status}</span></Link>)}</div> : <div className="px-5 py-12 text-center text-sm text-zinc-500">No apps yet. Create your first app to see it here.</div>}
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Recent payments</h2><p className="mt-1 text-sm text-zinc-500">Latest payment activity.</p></div><Link href="/dashboard/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View all</Link></div>
          {recentTransactions.length ? <div>{recentTransactions.map((transaction) => <Link key={transaction.id} href="/dashboard/transactions" className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"><div className="min-w-0"><p className="truncate font-medium text-zinc-900 dark:text-white">{transaction.app?.name || "Deleted app"}</p><p className="mt-1 text-xs capitalize text-zinc-500">{transaction.gateway} · {transaction.status}</p></div><p className="shrink-0 font-semibold text-zinc-900 dark:text-white">{money(transaction.amount)}</p></Link>)}</div> : <div className="px-5 py-12 text-center text-sm text-zinc-500">No payment activity yet.</div>}
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/apps/create"><Card className="flex items-center gap-3 p-5 transition hover:border-indigo-500/40"><Boxes className="text-indigo-500" /><div><p className="font-semibold">Create an app</p><p className="text-sm text-zinc-500">Start a new mobile app.</p></div></Card></Link>
        <Link href="/dashboard/templates"><Card className="flex items-center gap-3 p-5 transition hover:border-violet-500/40"><FileText className="text-violet-500" /><div><p className="font-semibold">Browse templates</p><p className="text-sm text-zinc-500">Build from a reusable base.</p></div></Card></Link>
        <Link href="/dashboard/transactions"><Card className="flex items-center gap-3 p-5 transition hover:border-emerald-500/40"><CheckCircle2 className="text-emerald-500" /><div><p className="font-semibold">Review payments</p><p className="text-sm text-zinc-500">See complete transaction details.</p></div></Card></Link>
      </div>
    </div>
  );
}
