import { AdminApprovalRequest } from "../models/auditDB/adminApprovalRequest.model.js";

export const AdminApprovalCheck = (requestType) => {
  return async (req, _, next) => {
    const { constituency } = req.user.constituency;

    if (!constituency) {
      throw new ApiError(400, "You are not authorized to add candidates");
    }

    const approvalRequest = await AdminApprovalRequest.findOne({
      constituency,
      request: requestType,
      requestedBy: req.user._id,
    });

    if (!approvalRequest) {
      throw new ApiError(
        400,
        "No pending approval request for this constituency"
      );
    }

    if (
      approvalRequest.approvals.length > approvalRequest.rejections.length &&
      approvalRequest.approvals.length > 5 &&
      approvalRequest.status === "approved"
    ) {
      return next();
    }

    throw new ApiError(400, "You are not authorized to perform this action");
  };
};
