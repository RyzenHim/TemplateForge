"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  Pencil,
  Smartphone,
  Trash2,
} from "lucide-react";

import Card from "@/app/components/ui/Card";
import type { App } from "@/app/lib/types/app.types";

import { useDeleteApp } from "@/app/lib/hooks/app/useDeleteApp";
import { useQueryClient } from "@tanstack/react-query";
import Button from "./Button";
import { useCreateOrder } from "@/app/lib/hooks/payment/useCreateOrder";
import { openRazorpayCheckout } from "@/app/lib/services/razorpay.service";
import { useVerifyPayment } from "@/app/lib/hooks/payment/useVerifyPayment";
import { usePublishApp } from "@/app/lib/hooks/app/usePublishApp";

interface AppCardProps {
  app: App;
}

const STATUS_STYLES: Record<string, string> = {
  draft:
    "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700",
  purchased:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  published:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
};

function formatUpdatedAt(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return value;
  }
}

export default function AppCard({ app }: AppCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateAsync: createOrder } = useCreateOrder();
  const queryClient = useQueryClient();

  const { mutate: deleteApp } = useDeleteApp();
  const { mutateAsync: verifyPayment } = useVerifyPayment();
  const { mutateAsync: publishApp } = usePublishApp();

  const handlePurchase = async () => {
    try {
      const order = await createOrder({ appId: app.id });
      openRazorpayCheckout({
        order,
        onSuccess: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log(result);

            await queryClient.invalidateQueries({
              queryKey: ["apps"],
            });

            alert("Payment verified successfully!");
          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
          }
        },
      });
    } catch (error) {
      console.error(error);
      alert("Unable to create payment");
    }
  };
  const handlePublish = async () => {
    await publishApp(app.id);

    await queryClient.invalidateQueries({
      queryKey: ["apps"],
    });
  };

  const statusKey = (app.status || "draft").toLowerCase();
  const statusClass = STATUS_STYLES[statusKey] ?? STATUS_STYLES.draft;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100" />

      <div className="flex items-start gap-3">
        {app.thumbnail ? (
          <img
            src={app.thumbnail}
            alt={`${app.name} thumbnail`}
            className="h-16 w-16 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 text-2xl dark:from-indigo-500/10 dark:to-purple-500/10">
            📱
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            {app.name}
          </h3>

          {app.description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {app.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass}`}
          >
            {app.status || "Draft"}
          </span>

          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Smartphone size={11} />
            {app.platform || "Choose platform"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 rounded-xl bg-zinc-50/70 p-3 text-sm dark:bg-zinc-800/40">
        <div className="flex justify-between gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Platform</span>
          <span className="max-w-[70%] truncate text-right font-medium text-zinc-950 dark:text-zinc-50">
            {app.platform}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Package</span>
          <span className="max-w-[70%] truncate text-right font-medium text-zinc-950 dark:text-zinc-50">
            {app.packageName}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Template</span>
          <span className="max-w-[70%] truncate text-right font-medium text-zinc-950 dark:text-zinc-50">
            {app.templateName || "None"}
          </span>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated {formatUpdatedAt(app.updatedAt)}
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="delete"
            type="button"
            disabled={isDeleting}
            onClick={() => {
              const ok = window.confirm(`Delete app "${app.name}"?`);
              if (!ok) return;

              setIsDeleting(true);
              deleteApp(app.id, {
                onSuccess: async () => {
                  await queryClient.refetchQueries({ queryKey: ["apps"] });
                  setIsDeleting(false);
                },
                onError: () => {
                  setIsDeleting(false);
                  window.alert("Failed to delete app.");
                },
              });
            }}
            aria-label={`Delete app ${app.name}`}
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>

          {app.status === "draft" && (
            <Button size="sm" onClick={handlePurchase}>
              Purchase
            </Button>
          )}

          {app.status === "purchased" && (
            <Button size="sm" onClick={handlePublish}>
              Publish
            </Button>
          )}

          {app.status === "published" && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              Published
            </span>
          )}

          <div className="flex items-center gap-3 border-l border-zinc-200 pl-3 dark:border-zinc-800">
            <Link
              href={`/dashboard/apps/${app.id}/edit`}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <Pencil size={13} />
              Edit
            </Link>

            <Link
              href={`/dashboard/apps/${app.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Open
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
