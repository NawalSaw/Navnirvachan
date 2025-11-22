import { getAdminApprovalRequestModel } from "../models/auditDB/adminApprovalRequest.model.js";
import { ApiError } from "../utils/system/ApiError.js";
import { ApiHandler } from "../utils/system/ApiHandler.js";

const AdminApprovalRequest = getAdminApprovalRequestModel();
export const AdminApprovalCheck = (requestType) => {
  return ApiHandler( async (req, _, next) => {
    const constituency = req.user.constituency;
    if (!constituency) {
      throw new ApiError(400, "You are not authorized to perform this action");
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
      (approvalRequest.approvals.length > (approvalRequest?.rejections?.length || 0)) &&
      (approvalRequest.approvals.length >= 2) &&
      (approvalRequest.status === "approved")
    ) {
      return next();
    }
    throw new ApiError(400, "You are not authorized to perform this action");
  });
};
