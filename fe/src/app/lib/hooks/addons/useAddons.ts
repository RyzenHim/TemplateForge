import { useQuery } from "@tanstack/react-query";
import { getAlladdons } from "../../services/add_ons.service";

export function useAddons() {
  return useQuery({
    queryKey: ["addons"],
    queryFn: getAlladdons,
  });
}
