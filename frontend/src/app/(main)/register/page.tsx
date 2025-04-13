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
    aadhaarId: "",
    image: "",
  });
  const [email, setEmail] = useState("");

  const { getAdminOTP } = useGetAdminOTP();
  const { getOtp } = useGetUserOtp();

  const { registerVoter, isPending: isUserPending } = useRegisterUser();
  const { verifyAdminAsync, isPending: isPendingAdmin } = useVerifyAdmin();

  const router = useRouter();

  const handleOTP = async () => {
    if (!email && !formData.aadhaarId) {
      toast.error("Please enter Aadhaar ID or email");
      return;
    }
    if (email) {
      getAdminOTP(email);
    } else {
      getOtp(formData.aadhaarId);
    }
  };

  const handleRegister = async () => {
    if (!formData.otp || !(formData.aadhaarId || email)) {
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

      const response = await verifyAdminAsync(form);
      router.push("/admin/dashboard");
      console.log(response);
    } else {
      form.append("aadhaarId", formData.aadhaarId);
      form.append("otp", formData.otp);

      const response = await registerVoter(form);
      console.log(response);
      router.push("/vote");
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
    <div className="text-white gap-6 flex flex-col items-center justify-center pt-24">
      <h1 className="font-bold text-4xl">Register</h1>

      {/* Using iframe instead of video for YouTube embedding */}
      <CameraCapture
        onCapture={(image) => setFormData({ ...formData, image: image })}
      />

      <Input
        className="max-w-[40vw] h-12 text-4xl font-bold border-2 border-orange-400"
        name="identifier"
        onChange={(e) => {
          if (e.target.value.includes("@")) {
            setEmail(e.target.value);
            return;
          } else {
            setFormData({ ...formData, aadhaarId: e.target.value });
            return;
          }
        }}
        placeholder="AdhaarID or Email"
      />
      <div className="w-[40vw] flex rounded-lg h-12 text-4xl font-bold border-2 border-orange-400">
        <Input
          className="border-none w-[80%] h-full focus-visible:ring-0"
          name="otp"
          placeholder="One Time Password"
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
        />
        <Button
          onClick={handleOTP}
          className="w-[20%] h-full active:border-orange-800 transition-all duration-100 hover:bg-orange-400 flex justify-center items-center ml-4 rounded-md text-lg"
        >
          Send OTP
        </Button>
      </div>
      {/* <Link href="/vote"> */}
      <Button
        onClick={handleRegister}
        className="bg-orange-400 w-[40vw] border-b-8 h-14 rounded-full active:border-b-0 hover:bg-amber-600 transition-all duration-100 border-b-orange-700 text-xl font-bold"
      >
        {isUserPending || isPendingAdmin ? <Loader /> : "Register"}
      </Button>
      {/* </Link> */}
    </div>
  );
}

export default Page;
