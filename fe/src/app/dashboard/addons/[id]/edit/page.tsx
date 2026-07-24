"use client";

import { useParams } from "next/navigation";
import AddonsForm from "@/app/components/add_ons/addonsForm";

export default function EditAddonsPage() {
  const params = useParams();
  const addonId = params.id as string;

  return <AddonsForm mode="edit" addonId={addonId} />;
}
