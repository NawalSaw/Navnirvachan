"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import React, { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { Check, Delete, X } from "lucide-react";
import { ApprovalRequest } from "@/hooks/voterApi";

export function ApprovalRequestTable({
  approvalRequests,
  handleApproveClick,
  handleRejectClick,
}: {
  approvalRequests: ApprovalRequest[];
  handleApproveClick?: (approvalRequestID: string) => void;
  handleRejectClick?: (approvalRequestID: string) => void;
}) {
  const [selectedApprovalRequest, setSelectedApprovalRequest] =
    useState<string>("");

  return (
    <Table className="text-white scrollbar-none w-full">
      <TableCaption>A list of your recent approval requests.</TableCaption>

      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px] text-white">#</TableHead>
          <TableHead className="text-white">Request Type</TableHead>
          <TableHead className="text-white">Requested By</TableHead>
          <TableHead className="text-white">Constituency</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white">Created</TableHead>
          <TableHead className="text-right text-white">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {approvalRequests.map((req, index) => (
          <React.Fragment key={req._id ?? index}>
            {/* Main Row */}
            <TableRow
              onClick={() =>
                setSelectedApprovalRequest(
                  selectedApprovalRequest === req._id ? "" : req._id
                )
              }
              className="cursor-pointer"
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{req.request}</TableCell>
              <TableCell>{req.requestedBy}</TableCell>
              <TableCell>{req.constituency}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>

              <TableCell className="text-right flex items-center justify-end gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveClick?.(req._id);
                  }}
                >
                  <Check />
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    <ConfirmDialog
                      trigger={
                        <Button className="bg-red-600 hover:bg-red-700">
                          Reject
                        </Button>
                      }
                      handleClick={() => handleRejectClick?.(req._id)}
                    />
                  }}
                >
                  <X />
                </Button>
              </TableCell>
            </TableRow>

            {/* Expandable Row (Optional Detail Section) */}
            <TableRow className="border-none">
              <TableCell colSpan={7} className="p-0">
                <div
                  className={`overflow-hidden transition-[max-height] duration-500 ease-in-out bg-gray-800 text-gray-300 px-6`}
                  style={{
                    maxHeight:
                      selectedApprovalRequest === req._id ? "200px" : "0px",
                  }}
                >
                  <div className="py-4 space-y-2 text-sm">
                    <p>
                      <strong>Approvals:</strong>{" "}
                      {req.approvals.length > 0
                        ? req.approvals.join(", ")
                        : "None"}
                    </p>

                    <p>
                      <strong>Rejections:</strong>{" "}
                      {req.rejections && req.rejections.length > 0
                        ? req.rejections.join(", ")
                        : "None"}
                    </p>

                    <p>
                      <strong>Updated At:</strong>{" "}
                      {new Date(req.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
