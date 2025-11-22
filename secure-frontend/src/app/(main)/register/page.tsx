"use client";

import CameraCapture from "@/components/CameraCapture";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  useGetAdminOTP,
  useGetUserOtp,
  useRegisterUser,
  useVerifyAdmin,
} from "@/hooks/voterApi";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const [formData, setFormData] = useState({
    otp: "",
    voterId: "",
    image: "",
  });
  const [email, setEmail] = useState("");

  const { getAdminOTP } = useGetAdminOTP();
  const { getOtp } = useGetUserOtp();

  const { registerVoter, isPending: isUserPending } = useRegisterUser();
  const { verifyAdminAsync, isPending: isPendingAdmin } = useVerifyAdmin();

  const router = useRouter();

  const handleOTP = async () => {
    if (!email && !formData.voterId) {
      toast.error("Please enter Voter ID or email");
      return;
    }
    if (email) {
      getAdminOTP(email);
    } else {
      getOtp(formData.voterId);
    }
  };

  const handleRegister = async () => {
    if (!formData.otp || !(formData.voterId || email)) {
      toast.error("Please fill OTP and other fields");
      return;
    }

    if (!formData.image){
      toast.error("Please add your image")
      return
    }

    const form = new FormData();
    const imageBlob = base64ToBlob(formData.image);
    form.append("image", imageBlob, "face.jpg");

    if (email) {
      form.append("email", email);
      form.append("otp", formData.otp);

      const response = await verifyAdminAsync(form, {
        onSuccess: () => {
          router.push("/admin/dashboard");
        },
      });
    } else {
      form.append("voterId", formData.voterId);
      form.append("otp", formData.otp);

      const response = await registerVoter(form, {
        onSuccess: () => router.push("/elections"),
      });
    }
  };

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(",");
    const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  };

  return (
   <div className="text-white gap-6 flex flex-col items-center justify-center pt-36 md:pt-24 w-full min-h-screen px-4">
  <h1 className="font-bold text-4xl md:text-5xl">Register</h1>

  {/* Camera Capture */}
  <CameraCapture
    onCapture={(image) => setFormData({ ...formData, image })}
  />

  <Input
    className="w-full max-w-md md:max-w-xl h-12 text-md md:text-lg font-bold border-2 border-orange-400"
    name="identifier"
    onChange={(e) => {
      if (e.target.value.includes("@")) {
        setEmail(e.target.value);
      } else {
        setFormData({ ...formData, voterId: e.target.value });
      }
    }}
    placeholder="Voter ID or Email"
  />

  <div className="w-full max-w-md md:max-w-xl flex rounded-lg h-12 font-bold border-2 border-orange-400">
    <Input
      className="border-none w-[75%] h-full focus-visible:ring-0 text-md md:text-lg"
      name="otp"
      placeholder="One Time Password"
      onChange={(e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value })
      }
    />
    <Button
      onClick={handleOTP}
      className="w-[25%] h-full transition-all duration-100 flex justify-center items-center rounded-md text-sm md:text-lg"
    >
      Send OTP
    </Button>
  </div>

  <Button
    onClick={handleRegister}
    className="bg-orange-400 w-full max-w-md md:max-w-xl border-b-8 h-14 rounded-full active:border-b-0 hover:bg-amber-600 transition-all duration-100 border-b-orange-700 text-lg md:text-xl font-bold"
  >
    {isUserPending || isPendingAdmin ? <Loader /> : "Register"}
  </Button>
</div>
  );
}

export default Page;
