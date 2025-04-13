import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const useGetAllCandidatesByLocation = (location: string) => {
  const queryClient = useQueryClient();
  const getAllCandidatesByLocation = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/candidate/${location}`,
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
    queryKey: ["candidates", location],
    queryFn: getAllCandidatesByLocation,
    staleTime: 60 * 60 * 1000,
    enabled: !!location,
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

type Candidate = {
  name: string;
  party: string;
  description: string;
  image: string;
  location: string;
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
        queryKey: ["candidates", data.location],
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
        queryKey: ["candidates", data.location],
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

type AssemblyBody = {
  areasUnder: string[];
  name: string;
  state: string;
  location: string;
};

export const useCreateAssembly = () => {
  const queryClient = useQueryClient();
  const createAssembly = async (data: AssemblyBody) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/assembly`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to set candidate");
    }
    return response.json();
  };

  const {
    mutateAsync: createAssemblyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: createAssembly,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to set assembly");
    },
    onSuccess: (data) => {
      console.log("Assembly set successfully");
      queryClient.invalidateQueries({
        queryKey: ["candidates", data.location],
      });
    },
  });

  return {
    createAssemblyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};

export const useGetAllAssembliesByState = (state: string) => {
  const getAllAssembliesByState = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/candidate/get-all-assembly/${state}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get assemblies");
    }
    return response.json();
  };

  const {
    data: assemblies,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["assemblies", state],
    queryFn: getAllAssembliesByState,
    enabled: !!state,
  });

  return {
    assemblies,
    isLoading,
    isError,
    error,
  };
};

export const useDeleteAssembly = () => {
  const queryClient = useQueryClient();
  const deleteAssembly = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/candidate/assembly/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to delete assembly");
    }
    return response.json();
  };

  const {
    mutateAsync: deleteAssemblyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: deleteAssembly,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to delete assembly");
    },
    onSuccess: (data) => {
      console.log("Assembly deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["assemblies", data.state],
      });
    },
  });

  return {
    deleteAssemblyAsync,
    isPending,
    error,
    isError,
    isSuccess,
  };
};



/**
router.route("/assembly/:id").delete(JWTCheck, isVerifiedAdmin, deleteAssembly); //
router.route("/get-all-assembly").get(getAllCandidatesByLocation);
**/
