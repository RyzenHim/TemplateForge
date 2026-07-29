import { useMutation } from "@tanstack/react-query";

import { publishApp } from "../../services/app.service";

export const usePublishApp = () => {
  return useMutation({
    mutationFn: publishApp,
  });
};
