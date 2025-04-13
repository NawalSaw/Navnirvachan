"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import toast from "react-hot-toast";

export function AuthGuard({
  allowedRole,
  children,
}: {
  allowedRole: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data, isError, isPending, error } = useGetCurrentVoter();

  useEffect(() => {
    if (!isPending) {
      if (error || isError) {
        router.replace("/register");
      } else if (data?.role !== allowedRole) {
        toast.error("You are not authorized to access this page.");
        router.replace("/vote");
      }
    }
  }, [data, isPending, error, router, allowedRole]);

  if (isPending || !data) return <div>Loading...</div>;

  return <>{children}</>;
}
