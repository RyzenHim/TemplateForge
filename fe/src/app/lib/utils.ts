import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import axios from "axios";
import { toast } from "sonner";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function showApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? "Something went wrong");
    return;
  }
  toast.error("Something went wrong");
}


export function showApiSuccess(message: string) {
  toast.success(message);
}