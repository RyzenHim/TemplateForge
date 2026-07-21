import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import axios from "axios";
import { toast } from "sonner";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? "Something went wrong";
  }
  return "Something went wrong";
}

export function showApiError(error: unknown) {
  toast.error(getApiErrorMessage(error));
}


export function showApiSuccess(message: string) {
  toast.success(message);
}