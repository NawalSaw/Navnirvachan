import { AdminTableProps } from "@/components/AdminTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

type DATA = {
  success: boolean;
  data: Object; // Adjust based on API response
  message: string;
};
export const useRegisterUser = () => {
  const queryClient = useQueryClient(); // ✅ Get query client

  const registerUser = async (userData: FormData): Promise<DATA> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/register`, {
      method: "POST",
      body: userData,
      credentials: "include", // ← this is required to send/receive cookies
    });

    if (!response.ok) {
      // {"success":false,"message":"You are not in the voterlist","errors":[],"data":null}
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    return response.json();
  };

  const { mutateAsync: registerVoter, isPending } = useMutation<
    DATA,
    Error,
    FormData
  >({
    mutationKey: ["registerUser"],
    mutationFn: registerUser,
    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["currentVoter"], data.data); // ✅ Update cache
      toast.success(data.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentVoter"] }); // ✅ Ensure latest data
    },
  });

  return { registerVoter, isPending };
};

export const useGetUserOtp = () => {
  const getUserOtp = async (voterId: string): Promise<string> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/get-user-otp/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voterId }),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message);
    }

    return response.json(); // ✅ Returns typed response
  };

  const mutation = useMutation<string, Error, string>({
    mutationFn: getUserOtp,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      toast.success("OTP sent successfully to your phone number");
    },
  }); // ✅ Explicitly typed

  const {
    mutateAsync: getOtp,
    data,
    isPending,
    isError,
    isSuccess,
    error,
  } = mutation;

  return { getOtp, isPending, data, isError, isSuccess, error };
};

// Only the voter data type
type CurrentVoterResponse = {
  success: boolean;
  message: string;
  data: Voter; // Adjust based on API response
};

type Voter = {
  _id?: string;
  voterId?: string;
  name: string;
  constituency: string;
  age: number;
  phone: string;
  email: string;
  image: string;
  aadhaarID?: string;
  address: string;
  verified: boolean;
  role?: string;
  registeredAt?: Date;
};

export const useGetCurrentVoter = () => {
  const getCurrentVoter = async (): Promise<CurrentVoterResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 👈 this is important for sending cookies
    });

    const res = await response.json();

    if (!response.ok) {
      toast.error(res.message || "Failed to get current voter");
      throw new Error(res.message || "Failed to get current voter");
    }
    return res
  };

  const { data, isError, error, isFetching, isPending, isSuccess } = useQuery<
    CurrentVoterResponse,
    Error
  >({
    queryKey: ["currentVoter"],
    queryFn: getCurrentVoter,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { data, isError, error, isFetching, isPending, isSuccess };
};

type AdminResponse = {
  success: boolean;
  data: AdminTableProps;
  message: string;
}
export const useGetAdmin = (id: string) => {
  const getAdmin = async (): Promise<AdminResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/admin/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      toast.error(errorMessage.message);
      throw new Error(errorMessage.message || "Failed to get admin");
    }

    return response.json(); // ✅ Returns typed response
  };

  const { data, isError, error, isFetching, isLoading, isSuccess } = useQuery<
    AdminResponse,
    Error
  >({
    queryKey: ["admin", id], // ✅ Ensure proper caching per `id`
    queryFn: getAdmin,
    enabled: !!id, // ✅ Prevents query from running if `id` is undefined
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return { data, isError, error, isFetching, isLoading, isSuccess };
};

export const useAddAdmin = () => {
  const addAdmin = async (userData: FormData): Promise<Object> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/add-admin`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      credentials: "include",
      body: userData,
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to add admin");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: addAdminAsync,
    isPending,
    data,
    isError,
    isSuccess,
    error,
  } = useMutation<Object, Error, FormData>({
    mutationFn: addAdmin,
    onSuccess: (data) => {
      toast.success("Admin added successfully");
    },

    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to add admin");
    },
  });

  return { addAdminAsync, isPending, data, isError, isSuccess, error };
};

export const useVerifyAdmin = () => {
  const queryClient = useQueryClient();
  const verifyAdmin = async (userData: FormData): Promise<Object> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/verify-admin`, {
      method: "POST",
      body: userData,
      credentials: "include", // ← this is required to send/receive cookies
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to verify admin");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: verifyAdminAsync,
    isPending,
    isError,
    isSuccess,
    error,
  } = useMutation<Object, Error, FormData>({
    mutationFn: verifyAdmin,
    onSuccess: (data) => {
      queryClient.setQueryData(["currentVoter"], data);
      toast.success("Admin verified successfully");
    },

    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to verify admin");
    },
    onSettled: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["currentVoter"] });
    },
  });

  return { verifyAdminAsync, isPending, isError, isSuccess, error };
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  const deleteAdmin = async (id: string): Promise<Object> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/admin/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to delete admin");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: deleteAdminAsync,
    isPending,
    data,
    isError,
    isSuccess,
    error,
  } = useMutation<Object, Error, string>({
    mutationFn: deleteAdmin,
    onSuccess: (data) => {
      toast.success("Admin deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admins"] }); // ✅ Ensure latest data
    },

    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to delete admin");
    },
  });

  return { deleteAdminAsync, isPending, data, isError, isSuccess, error };
};

type AdminTableResponse = {
  success: boolean;
  data: AdminTableProps[];
  message: string;
}
export const useGetAllAdmins = (constituencyId: string) => {
  const getAllAdmins = async (): Promise<AdminTableResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/get-all-admins/${constituencyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.json() || "Failed to get all admins");
    }

    return response.json(); // ✅ Returns typed response
  };

  const { data, isError, error, isFetching, isPending, isSuccess } = useQuery<
    AdminTableResponse,
    Error
  >({
    queryKey: ["admins"], // ✅ Ensure proper caching per `id`
    queryFn: getAllAdmins,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  return { data, isError, error, isFetching, isPending, isSuccess };
};

export const useGetAdminOTP = () => {
  const getOTP = async (email: string): Promise<string> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/get-admin-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get admin otp");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: getAdminOTP,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<string, Error, string>({
    mutationFn: getOTP,
    onSuccess: (data) => {
      toast.success("OTP sent successfully to your phone number");
    },
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to get admin otp");
    },
  });

  return { getAdminOTP, isError, error, isPending, isSuccess };
};

export const useAddVotersInVoterlist = () => {
  const addVotersInVoterlist = async (data: FormData): Promise<Object[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/add-voters`, {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to add voters");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: addVoter,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<Object[], Error, FormData>({
    mutationFn: addVotersInVoterlist,
    onSuccess: (data) => {
      toast.success("Voters added successfully");
    },
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to add voters");
    },
  });

  return { addVoter, isError, error, isPending, isSuccess };
};

type GetAllVotersResponse = {
  success: boolean;
  data: Voter[];
  message: string
}

export const useGetAllVoters = (electionID: string) => {
  const getAllVoters = async (): Promise<GetAllVotersResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/get-all-voters/${electionID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get all voters");
    }

    return response.json(); // ✅ Returns typed response
  };

  const { data, isError, error, isFetching, isPending, isSuccess } = useQuery({
    queryKey: ["voters"], // ✅ Ensure proper caching per `id`
    queryFn: getAllVoters,
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!electionID,
  });

  return { data, isError, error, isFetching, isPending, isSuccess };
};

enum ApprovalStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export enum ApprovalRequestType {
  AddAdmin = "addAdmin",
  RemoveAdmin = "removeAdmin",
  AddConstituency = "addConstituency",
  RemoveConstituency = "removeConstituency",
  ToggleElection = "toggleElection",
  AddElection = "addElection",
  RemoveElection = "removeElection",
  AddVoter = "addVoter",
  RemoveVoter = "removeVoter",
  AddCandidate = "addCandidate",
  RemoveCandidate = "removeCandidate",
}
export type ApprovalRequest = {
  _id: string
  request: ApprovalRequestType
  constituency: string
  approvals: string[],
  rejections: string[],
  requestedBy: string,
  status: ApprovalStatus,
  createdAt: Date,
  updatedAt: Date
}

type ApprovalRequestResponse = {
  success: boolean;
  data: ApprovalRequest[];
  message: string
}

type AddApprovalRequestData = {
  request: ApprovalRequestType
  constituency: string
}

type AddApprovalRequestResponse = {
  success: boolean;
  data: ApprovalRequest;
  message: string
}
export const useAddApprovalRequest = () => {
  const addApprovalRequest = async (data: AddApprovalRequestData): Promise<AddApprovalRequestResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/approval-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to add approval request");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: addVoter,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<AddApprovalRequestResponse, Error, AddApprovalRequestData>({
    mutationFn: addApprovalRequest,
    onSuccess: (data) => {
      toast.success("Approval request added successfully");
    },
    onError: (error) => {
      toast.error(
        error.message ? error.message : "Failed to add approval request"
      );
    },
  });

  return { addVoter, isError, error, isPending, isSuccess };
};
export const useApproveApprovalRequest = () => {
  const approveApprovalRequest = async (id: string): Promise<Object> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/approval-request/${id}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to approve approval request");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: approveVoter,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<Object, Error, string>({
    mutationFn: approveApprovalRequest,
    onSuccess: (data) => {
      toast.success("Approval request approved successfully");
    },
    onError: (error) => {
      toast.error(
        error.message ? error.message : "Failed to approve approval request"
      );
    },
  });

  return {
    approveVoter,
    isError,
    error,
    isPending,
    isSuccess,
  }
}
export const useRejectApprovalRequest = () => {
  const rejectApprovalRequest = async (id: string): Promise<Object> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/approval-request/${id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to reject approval request");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: rejectVoter,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<Object, Error, string>({
    mutationFn: rejectApprovalRequest,
    onSuccess: (data) => {
      toast.success("Approval request rejected successfully");
    },
    onError: (error) => {
      toast.error(
        error.message ? error.message : "Failed to reject approval request"
      );
    },
  });

  return { rejectVoter, isError, error, isPending, isSuccess };
}
export const useGetApprovalRequest = () => {
  const getApprovalRequest = async (): Promise<ApprovalRequestResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/approval-request`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get approval requests");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    data: approvalRequests,
    isLoading,
    isError,
    error,
  } = useQuery<ApprovalRequestResponse, Error>({
    queryKey: ["approvalRequests"],
    queryFn: getApprovalRequest,
  });

  return { approvalRequests, isLoading, isError, error };
}

type LogoutResponse = { message: string, success: boolean, data: string };
export const useLogout = () => {

  const logout = async (): Promise<LogoutResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/log-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to logout");
    }

    return response.json(); // ✅ Returns typed response
  }
  const {
    mutateAsync: logoutAsync,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onSuccess: (data) => {
      toast.success("Logout successful");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message ? error.message : "Failed to logout");
    },
  });

  return { logoutAsync, isError, error, isPending, isSuccess };

}

export const useGetCandidateWorks = () => {
  const getCandidateWorks = async (data: FormData): Promise<Object> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/candidate/works`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get candidate works");
    }

    return response.json(); // ✅ Returns typed response
  };

  const {
    mutateAsync: getCandidateWork,
    isError,
    error,
    isPending,
    isSuccess,
  } = useMutation<Object, Error, FormData>({
    mutationFn: getCandidateWorks,
    onSuccess: (data) => {
      toast.success("Candidate works fetched successfully");
    },
    onError: (error) => {
      toast.error(
        error.message ? error.message : "Failed to get candidate works"
      );
    },
  });

  return { getCandidateWork, isError, error, isPending, isSuccess };
};
