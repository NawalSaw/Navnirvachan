"use client";

import { useState } from "react";
import { ApprovalRequestTable } from "@/components/ApprovalRequestTable";
import { useQueryClient } from "@tanstack/react-query";
import {
  ApprovalRequestType,
  useAddApprovalRequest,
  useApproveApprovalRequest,
  useGetApprovalRequest,
  useGetCurrentVoter,
  useRejectApprovalRequest,
} from "@/hooks/voterApi";

function Page() {
  const { data: currentVoter } = useGetCurrentVoter();
  const constituency = currentVoter?.data.constituency;
  
  const { approvalRequests } = useGetApprovalRequest();
  const queryClient = useQueryClient();
  const { addVoter, isPending: isAddApprovalPending } = useAddApprovalRequest();
  console.log(approvalRequests);
  const { approveVoter } = useApproveApprovalRequest();
  const { rejectVoter } = useRejectApprovalRequest();

  const [showForm, setShowForm] = useState(false);
  const [requestData, setRequestData] = useState<ApprovalRequestType | "">("");

  const handleApproveClick = (id: string) => approveVoter(id);
  const handleRejectClick = (id: string) => rejectVoter(id);

  const handleAddSubmit = () => {
    if (!requestData || !constituency) return;

    const payload = {
      request: requestData,
      constituency,
    };

    addVoter(payload, {
      onSuccess: () => {
        setShowForm(false);
        setRequestData("" as ApprovalRequestType);
        queryClient.invalidateQueries({ queryKey: ["approvalRequests"] });
      },
    });
  };

  return (
    <div className="bg-gray-800 min-h-full w-full text-white pt-3 px-4 flex flex-col items-center mt-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Manage Approval Requests
      </h1>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold"
        >
          Add Approval Request
        </button>
      )}

      {/* Simple Inline Form */}
      {showForm && (
        <div className="mb-6 w-full max-w-3xl bg-gray-700 p-4 rounded-lg flex flex-col gap-3">
          <select
            className="p-2 rounded bg-gray-600"
            value={requestData}
            onChange={(e) =>
              setRequestData(e.target.value as ApprovalRequestType)
            }
          >
            <option value="">Select Request Type</option>
            <option value={ApprovalRequestType.AddVoter}>Add Voter</option>
            <option value={ApprovalRequestType.RemoveVoter}>
              Remove Voter
            </option>
            <option value={ApprovalRequestType.AddConstituency}>
              Add Constituency
            </option>
            <option value={ApprovalRequestType.RemoveConstituency}>
              Remove Constituency
            </option>
            <option value={ApprovalRequestType.AddAdmin}>Add Admin</option>
            <option value={ApprovalRequestType.RemoveAdmin}>
              Remove Admin
            </option>
            <option value={ApprovalRequestType.AddCandidate}>
              Add Candidate
            </option>
            <option value={ApprovalRequestType.RemoveCandidate}>
              Remove Candidate
            </option>
            <option value={ApprovalRequestType.AddElection}>
              Add Election
            </option>
            <option value={ApprovalRequestType.RemoveElection}>
              Remove Election
            </option>
            <option value={ApprovalRequestType.ToggleElection}>
              Toggle Election
            </option>
          </select>
          <div className="flex gap-3">
            <button
              onClick={handleAddSubmit}
              disabled={isAddApprovalPending}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded font-semibold"
            >
              {isAddApprovalPending ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scrollable List */}
      <div className="w-full max-w-3xl h-[60vh] md:h-[70vh] overflow-y-auto scrollbar-none rounded-lg flex flex-col gap-6 p-4 bg-gray-600/40">
        <ApprovalRequestTable
          handleApproveClick={handleApproveClick}
          handleRejectClick={handleRejectClick}
          approvalRequests={approvalRequests?.data || []}
        />
      </div>
    </div>
  );
}

export default Page;
