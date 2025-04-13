import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

type RegisterVoterRequest = {
  aadhaarId: string;
  image: string;
  otp: string;
};

export type Voter = {
  _id: string;
  name: string;
  image: string;
  permanentAddress: string;
  age: string;
  phone: string;
  email: string;
  aadhaarID: string;
};

type RegisterVoterResponse = {
  success: boolean;
  message: string;
  voter: Voter; // Adjust based on API response
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient(); // ✅ Get query client

  const registerUser = async (
    userData: FormData
  ): Promise<RegisterVoterResponse> => {
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
    RegisterVoterResponse,
    Error,
    FormData
  >({
    mutationKey: ["registerUser"],
    mutationFn: registerUser,
    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["currentVoter"], data.voter); // ✅ Update cache
      toast.success(data.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentVoter"] }); // ✅ Ensure latest data
    },
  });

  return { registerVoter, isPending };
};

export const useGetUserOtp = () => {
  const getUserOtp = async (aadhaarID: string): Promise<string> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/voters/get-user-otp/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aadhaarID }),
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
export type CurrentVoter = {
  _id: string;
  name: string;
  image: string;
  permanentAddress: string;
  age: string;
  phone: string;
  email: string;
  role: string;
  isVerifiedAdmin: boolean;
  date: string;
  WorkingAddress?: string
  __v: number;
};

export const useGetCurrentVoter = () => {
  const getCurrentVoter = async (): Promise<CurrentVoter> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', // 👈 this is important for sending cookies
    });

    const res = await response.json();

    if (!response.ok) {
      toast.error(res.message || "Failed to get current voter");
      throw new Error(res.message || "Failed to get current voter");
    }

    return res.data; // ✅ Just the voter
  };

  const {
    data,
    isError,
    error,
    isFetching,
    isPending,
    isSuccess,
  } = useQuery<CurrentVoter, Error>({
    queryKey: ["currentVoter"],
    queryFn: getCurrentVoter,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { data, isError, error, isFetching, isPending, isSuccess };
};


export const useGetAdmin = (id: string) => {
  const getAdmin = async (): Promise<Voter> => {
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
    Voter,
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
  const addAdmin = async (userData: FormData): Promise<Voter> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/add-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  } = useMutation<Voter, Error, FormData>({
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

export type VerifyAdminRequest = {
  email: string;
  otp: string;
  image: string;
};

export const useVerifyAdmin = () => {
  const queryClient = useQueryClient();
  const verifyAdmin = async (userData: FormData): Promise<Voter> => {
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
  } = useMutation<Voter, Error, FormData>({
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
  const queryClient = useQueryClient()
  const deleteAdmin = async (id: string): Promise<Voter> => {
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
  } = useMutation<Voter, Error, string>({
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

export const useGetAllAdmins = () => {
  const getAllAdmins = async (): Promise<Voter[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/get-all-admins`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.json() || "Failed to get all admins");
    }

    return response.json(); // ✅ Returns typed response
  };

  const { data, isError, error, isFetching, isPending, isSuccess } = useQuery<
    Voter[],
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
  const addVotersInVoterlist = async (data: FormData): Promise<Voter[]> => {
    console.log(data)
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

  const { mutateAsync: addVoter, isError, error, isPending, isSuccess } = useMutation<
    Voter[],
    Error,
    FormData
  >({
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

export const useGetAllVoters = (electionID: string) => {
  const getAllVoters = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/voters/get-all-voters/${electionID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

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
      enabled: !!electionID
    });

  return { data, isError, error, isFetching, isPending, isSuccess };
};

// TODO: router.route("/candidate/works").get(GetCandidateWorks);
