"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { usePlatformPrices } from "@/app/lib/hooks/platform-price/usePlatformPrices";
import { updatePlatformPrices } from "@/app/lib/services/platform-price.service";
import type { PlatformName } from "@/app/lib/types/platform-price.types";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

const platforms: PlatformName[] = ["Android", "iOS", "Android & iOS"];
export default function PlatformPricingPage() {
  const { data, isLoading, isError } = usePlatformPrices();
  const queryClient = useQueryClient();
  const [prices, setPrices] = useState<Partial<Record<PlatformName, string>>>({});
  const [saving, setSaving] = useState(false);
  const valueFor = (platform: PlatformName) => prices[platform] ?? (data?.find((item) => item.platform === platform)?.price === null ? "" : String((data?.find((item) => item.platform === platform)?.price ?? 0) / 100));
  const save = async () => { const parsed = platforms.map((platform) => ({ platform, price: Math.round(Number(valueFor(platform)) * 100) })); if (parsed.some((item) => !Number.isInteger(item.price) || item.price < 0)) { toast.error("Enter a valid price of ₹0 or more for every platform."); return; } setSaving(true); try { await updatePlatformPrices(parsed); setPrices({}); await queryClient.invalidateQueries({ queryKey: ["platform-prices"] }); showApiSuccess("Platform prices saved successfully."); } catch (error) { showApiError(error); } finally { setSaving(false); } };
  if (isLoading) return <Loader text="Loading platform pricing..." />;
  if (isError) return <div className="p-8 text-red-500">Could not load platform prices.</div>;
  return <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:px-6"><div><p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">App billing</p><h1 className="mt-1 text-3xl font-bold">Platform pricing</h1><p className="mt-2 text-sm text-zinc-500">Set the INR base price for each platform. New apps save a permanent snapshot of the selected price.</p></div><Card className="mt-8"><div className="space-y-5">{platforms.map((platform) => <label key={platform} className="block"><span className="text-sm font-semibold">{platform}</span><div className="mt-2 flex items-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"><span className="border-r border-zinc-200 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-700">₹</span><input type="number" min="0" step="0.01" value={valueFor(platform)} onChange={(event) => setPrices((current) => ({ ...current, [platform]: event.target.value }))} placeholder="0.00" className="w-full bg-transparent px-3 py-2.5 text-sm outline-none" /></div></label>)}</div><div className="mt-7 border-t border-zinc-200 pt-5 dark:border-zinc-800"><Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save platform prices"}</Button></div></Card></div>;
}
