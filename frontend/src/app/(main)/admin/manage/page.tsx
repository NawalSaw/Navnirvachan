"use client"

import { AdminTable } from '@/components/AdminTable'
import React from 'react'
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useDeleteAdmin, useGetAllAdmins } from '@/hooks/voterApi';

// const admins = [
//   {
//     id: "asdlfjfasdjfhgfgjfls",
//     name: "John Doe",
//     image: "https://picsum.photos/200",
//     permanentAddress: "123 Main St, Anytown, USA",
//     age: "25",
//     phone: "123-456-7890",
//     email: "john.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: true,
//     date: new Date(),
//   },
//   {
//     id: "asdlasduyhrnjksjfls",
//     name: "John Doe",
//     image: "https://picsum.photos/200",
//     permanentAddress: "123 Main St, Anytown, USA",
//     age: "25",
//     phone: "123-456-7890",
//     email: "john.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: true,
//     date: new Date(),
//   },
//   {
//     id: "asdlgoerighejnlfksjfls",
//     name: "John Doe",
//     image: "https://picsum.photos/200",
//     permanentAddress: "123 Main St, Anytown, USA",
//     age: "25",
//     phone: "123-456-7890",
//     email: "john.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: true,
//     date: new Date(),
//   },
//   {
//     id: "asdlfgshsclfksjfls",
//     name: "Jane Doe",
//     image: "https://picsum.photos/201",
//     permanentAddress: "456 Elm St, Othertown, USA",
//     age: "30",
//     phone: "987-654-3210",
//     email: "jane.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: false,
//     date: new Date(),
//   },
//   {

//     id: "asdlfjdjfsfksjfls",
//     name: "Jane Doe",
//     image: "https://picsum.photos/201",
//     permanentAddress: "456 Elm St, Othertown, USA",
//     age: "30",
//     phone: "987-654-3210",
//     email: "jane.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: false,
//     date: new Date(),
//   },
//   {
//     id: "asdlfjaafdghsjfls",
//     name: "Jane Doe",
//     image: "https://picsum.photos/201",
//     permanentAddress: "456 Elm St, Othertown, USA",
//     age: "30",
//     phone: "987-654-3210",
//     email: "jane.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: false,
//     date: new Date(),
//   },
//   {
//     id: "asdlfjaslfksjfls",
//     name: "Jane Doe",
//     image: "https://picsum.photos/201",
//     permanentAddress: "456 Elm St, Othertown, USA",
//     age: "30",
//     phone: "987-654-3210",
//     email: "jane.doe@example.com",
//     role: "admin",
//     isVerifiedAdmin: false,
//     date: new Date(),
//   },
// ]

function page() {
  const { data: admins, isError, error, isPending, isSuccess } = useGetAllAdmins();
  const {deleteAdminAsync} = useDeleteAdmin();

  if (isPending && !isError && !isSuccess && !admins) {
    return <div>Loading...</div>;
  }

  if (isError && !isPending && !isSuccess && !admins) {
    return <div>{error?.message || "Something went wrong"}</div>;
  }

  const handleDelete = (adminID: string) => {
    deleteAdminAsync(adminID);
  }
  return (
    <div className="bg-gray-700 flex flex-col gap-20 items-center justify-center text-white h-[90vh] mt-20 w-full mx-10 p-10">
      <h1 className="text-4xl font-bold text-center">Manage Admins</h1>
      <div className="w-[800px] h-[800px] overflow-y-scroll scrollbar-none flex flex-col gap-6">
        {/* @ts-ignore */}
        <AdminTable handleDelete={handleDelete} admins={admins?.data || []} />
        </div>
    </div>
  )
}

export default page
