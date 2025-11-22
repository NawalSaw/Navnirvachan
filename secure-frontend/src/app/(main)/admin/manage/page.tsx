"use client"

import { AdminTable } from '@/components/AdminTable'
import React from 'react'
import { useDeleteAdmin, useGetAllAdmins, useGetCurrentVoter } from '@/hooks/voterApi';


function Page() {
  const { data: currentVoter, isPending, isError, error, isSuccess } = useGetCurrentVoter();

  const { data: admins, isError: isAdminsError, error: adminsError, isPending: adminsPending, isSuccess: adminsSuccess } = useGetAllAdmins(currentVoter?.data?.constituency || "");

  const {deleteAdminAsync, isPending: deletePending, isError: isDeleteError, error: deleteError, isSuccess: deleteSuccess} = useDeleteAdmin();
  
  if (isPending && !isError && !isSuccess && !adminsPending && !adminsSuccess && !deletePending) {
    return <div>Loading...</div>;
  }

  if (isError && !isPending && !isSuccess && !adminsPending && !adminsSuccess && !isDeleteError) {
    return <div>{deleteError?.message || "Something went wrong"}</div>; 
  }

  const handleDelete = (adminID: string) => {
    deleteAdminAsync(adminID);
  }

  return (
<div className="bg-gray-800 flex flex-col gap-10 items-center text-white min-h-full pt-15 mt-18 w-full px-4">

  <h1 className="text-3xl md:text-4xl font-bold text-center">
    Manage Admins
  </h1>

  <div className="w-full max-w-5xl flex flex-col gap-6 mr-16">
    <AdminTable handleDelete={handleDelete} admins={admins?.data || []} />
  </div>

</div>

  )
}

export default Page
