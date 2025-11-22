"use client";

import { useGetAllBulletins, useGetElectionByConstituency } from "@/hooks/VoteApi";
import { useGetCurrentVoter } from "@/hooks/voterApi";
import { Check } from "lucide-react";
import React from "react";

const VoteSuccess = () => {
  const { data: voter } = useGetCurrentVoter();
  const address = voter?.data.constituency;

  const { election } = useGetElectionByConstituency(address || "");
  const { bulletins, isLoading: bulletinsLoading } = useGetAllBulletins(election?.data._id || "");
  console.log(bulletins);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F1A] text-white p-6">
      {/* SUCCESS UI */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
            <Check size={50} />
          </div>
        </div>
        <h1 className="text-2xl font-semibold">Successfully Voted</h1>
        <p className="text-gray-400 mt-2">You may close this application now</p>
      </div>

      {/* BULLETINS TABLE */}
      <div className="w-full max-w-3xl bg-[#111726] p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Bulletins</h2>

        {bulletinsLoading && (
          <p className="text-gray-400">Loading bulletins...</p>
        )}

        {!bulletinsLoading && bulletins?.data?.length === 0 && (
          <p className="text-gray-400">No bulletins available</p>
        )}

        {!bulletinsLoading && bulletins?.data && bulletins?.data?.length > 0 && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Election ID</th>
                <th className="py-2">Ballot Hash</th>
                <th className="py-2">Published At</th>
              </tr>
            </thead>
            <tbody>
              {bulletins.data.map((bulletin, idx) => (
                <tr key={idx} className="border-b border-gray-800">
                  <td className="py-2">{bulletin.electionID}</td>
                  <td className="py-2 truncate max-w-xs">{bulletin.ballotHash}</td>
                  <td className="py-2">
                    {new Date(bulletin.publishedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VoteSuccess;
