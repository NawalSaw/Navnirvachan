"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import toast from "react-hot-toast";

export function AllowGuard({
  children,
}: {
  allowedRole: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data, isError, isPending, error } = useGetCurrentVoter();

  useEffect(() => {
    if (!isPending) {
      if (error || isError || (!data && !isPending)) {
        router.replace("/register");
        toast.error("You are not authorized to access this page.");
      }
    }
  }, [data, isPending, error, router]);

  if (isPending || !data) return <div>Loading...</div>;

  return <>{children}</>;
}
