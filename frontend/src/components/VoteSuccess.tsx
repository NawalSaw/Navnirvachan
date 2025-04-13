import { Check } from "lucide-react";
import React from "react";

const VoteSuccess = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0B0F1A] text-white">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
          <Check size={50}/>
          </div>
        </div>
        <h1 className="text-2xl font-semibold">Successfully Voted</h1>
        <p className="text-gray-400 mt-2">You may close this Application now</p>
      </div>
    </div>
  );
};

export default VoteSuccess;
