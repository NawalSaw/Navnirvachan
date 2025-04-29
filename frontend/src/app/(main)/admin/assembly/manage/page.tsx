"use client"
// import { AdminTable } from '@/components/AdminTable'


import AssemblyTable from "@/components/AssemblyTable";
import { useDeleteAssembly, useGetAllAssembliesByState } from "@/hooks/candidateApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Loader2 } from "lucide-react";
import React from "react";


function Page() {
  const { data: admins, isPending } = useGetCurrentVoter();
  const address = admins?.WorkingAddress;

  const { assemblies, isLoading } = useGetAllAssembliesByState(address || "");
  const {deleteAssemblyAsync} = useDeleteAssembly();
  console.log(assemblies)

  if ((isPending && !admins) || (isLoading && !assemblies)) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        <Loader2 size={50} className="animate-spin text-white" />
      </div>
    );
  }

  if (!admins || !assemblies) {
    return (
      <div className="text-white text-4xl w-[90vw] h-[100vh] flex items-center justify-center">
        No Admins
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (!id) return
    deleteAssemblyAsync(id);
  }
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Manage Assemblies</h1>
      <div className="w-[800px] h-[800px] overflow-y-scroll scrollbar-none flex flex-col gap-6">
        <AssemblyTable handleDelete={handleDelete} assemblies={assemblies.data} />
      </div>
    </div>
  );
}

export default Page;
