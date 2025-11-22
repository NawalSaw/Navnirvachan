import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

export const useGetAllCandidatesByConstituency = (constituency: string) => {
  const queryClient = useQueryClient();
  const getAllCandidatesByConstituency = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/candidate/${constituency}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to get all candidates");
    }
    return response.json();
  };

  const {
    data: candidates,
    isError,
    error,
    isFetching,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ["candidates", constituency],
    queryFn: getAllCandidatesByConstituency,
    staleTime: 60 * 60 * 1000,
    enabled: !!constituency,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    candidates,
    isError,
    error,
    isFetching,
    isPending,
    isSuccess,
  };
};

export const useGetCandidateById = (id: string) => {
  const getCandidateById = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to get candidate");
    }
    return response.json();
  };

  const {
    data: candidate,
    isError,
    error,
    isFetching,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ["candidate", id],
    queryFn: getCandidateById,
    staleTime: 60 * 60 * 1000,
  });

  return {
    candidate,
    isError,
    error,
    isFetching,
    isPending,
    isSuccess,
  };
};

export const useSetCandidate = () => {
  const queryClient = useQueryClient();
  const setCandidate = async (data: FormData) => {
    console.log(data);
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate`, {
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: data,
    });
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to set candidate");
    }
    return response.json();
  };

  const {
    mutateAsync: setCandidateAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: setCandidate,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to set candidate");
    },
    onSuccess: (data) => {
      console.log("Candidate set successfully");
      toast.success("Candidate set successfully");
      queryClient.invalidateQueries({
        queryKey: ["candidates", data.constituency],
      });
    },
  });

  return {
    setCandidateAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  const deleteCandidate = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to delete candidate");
    }
    return response.json();
  };

  const {
    mutateAsync: deleteCandidateAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: deleteCandidate,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to delete candidate");
    },
    onSuccess: (data) => {
      console.log("Candidate deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["candidates", data.constituency],
      });
      toast.success("Candidate deleted successfully");
    },
  });

  return {
    deleteCandidateAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};

type ConstituencyType = {
  name: string
  code: string // e.g., "C001"
  region: string,   // optional, e.g., state/province
}
export const useCreateConstituency = () => {
  const queryClient = useQueryClient();
  const createConstituency = async (data: ConstituencyType) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/constituency`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to set constituency");
    }
    return response.json();
  };

  const {
    mutateAsync: createConstituencyAsync,
    isPending,
    error,
    isError,  
    isSuccess,
  } = useMutation({
    mutationFn: createConstituency,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to set constituency");
    },
    onSuccess: (data) => {
      console.log("Constituency set successfully");
      queryClient.invalidateQueries({
        queryKey: ["candidates", data.constituency],
      });
    },
  });

  return {
    createConstituencyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};

export const useDeleteConstituency = () => {
  const queryClient = useQueryClient();
  const deleteConstituency = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/constituency/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to delete constituency");
    }
    return response.json();
  };

  const {
    mutateAsync: deleteConstituencyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
        mutationFn: deleteConstituency,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to delete constituency");
    },
    onSuccess: (data) => {
      console.log("Constituency deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["constituencies", data.state],
      });
    },
  });

  return {
    deleteConstituencyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};

type Constituency = {
  _id: string,
  name: string
  code: string // e.g., "C001"
  region: string,   // optional, e.g., state/province
  createdAt: Date,
  updatedAt: Date
}
type ConstituencyResponse = {
  message: string,
  data: Constituency
  success: boolean
}

export const useGetConstituencyById = (name: string) => {
  const getConstituencyById = async (): Promise<ConstituencyResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/constituency/${name}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get constituency");
    }
    return response.json();
  };
  const {
    data: constituencies,
    isPending,
    error,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["constituency", name],
    queryFn: getConstituencyById,
  });

  return {
    constituencies,
    isPending,
    error,
    isError,
    isSuccess,
  };
};


/**
router.route("/assembly/:id").delete(JWTCheck, isVerifiedAdmin, deleteAssembly); //
router.route("/get-all-assembly").get(getAllCandidatesByConstituency);
**/
