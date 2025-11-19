"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type CastRequest = {
  voterID: string;
  candidateID: string;
};

type CastResponse = {
  message: string;
  success: boolean;
  data: {
    electionID: string;
    voterID: string;
    candidateID: string;
    assemblyID: string;
    date?: Date;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const useCastVote = () => {
  const castVote = async (data: CastRequest): Promise<CastResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/vote`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include", // ← this is required to send/receive cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to cast vote");
    }

    return response.json();
  };

  const {
    mutateAsync: castVoteAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation<CastResponse, Error, CastRequest>({
    mutationFn: castVote,
    onSuccess: (data) => {
      toast.success("Vote cast successfully");
    },
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to cast vote");
    },
  });

  return { castVoteAsync, isPending, error, isError, isSuccess };
}; // used

export const useGetElectionByLocation = (location: string) => {
  const getElectionByLocation = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/get-election/${location}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.json();
      toast.error(errorMessage.message);
      throw new Error(
        errorMessage.message || "Failed to get election by location"
      );
    }
    return response.json();
  };

  const {
    data: election,
    isPending,
    error,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ["election"],
    queryFn: getElectionByLocation,
    enabled: !!location,
    staleTime: 60 * 60 * 1000, // 1 hour,
    retry: false,
  });

  return { election, isPending, error, isError, isSuccess };
}; // used

export const useGetTotalVoteCount = (electionID: string) => {
  const getTotalVoteCount = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/total/${electionID}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.json();
      toast.error(errorMessage.message);
      throw new Error(errorMessage.message || "Failed to get total vote count");
    }
    return response.json();
  };

  const {
    data: totalVoteCount,
    isPending,
    error,
    isError,
    isSuccess,
  } = useQuery<string, Error>({
    queryKey: ["totalVoteCount"],
    queryFn: getTotalVoteCount,
    enabled: !!electionID,
    staleTime: 60 * 60 * 1000,
  });

  return { totalVoteCount, isPending, error, isError, isSuccess };
};

export const useGetElectionByLocationAdmin = (location: string) => {
  const getElectionByLocationAdmin = async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/vote/get-election-admin/${location}`,
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
        toast.error(errorMessage.message);
        throw new Error(
          errorMessage.message || "Failed to get election by location"
        );
      }
      return response.json();
    };
  
    const {
      data: election,
      isPending,
      error,
      isError,
      isSuccess,
    } = useQuery({
      queryKey: ["election"],
      queryFn: getElectionByLocationAdmin,
      enabled: !!location,
      staleTime: 60 * 60 * 1000, // 1 hour,
      retry: false,
    });
  
    return { election, isPending, error, isError, isSuccess };
  }

export const useToggleElection = () => {
  const queryClient = useQueryClient();
  const toggleElection = async (electionID: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/toggle-election/${electionID}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to toggle election");
    }
    return response.json();
  };

  const {
    mutateAsync: toggleElectionAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: toggleElection,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to toggle election");
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.setQueryData(["election"], data);
      toast.success(data.message);
    },
    retry: false,
  });

  return { toggleElectionAsync, isPending, error, isError, isSuccess };
}; //used

type ElectionData = {
  location: string;
  name: string;
};

export const useCreateElection = () => {
  const queryClient = useQueryClient();
  const createElection = async (data: ElectionData) => {
    console.log(data);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/create-election`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        method: "POST",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to create election");
    }
    return response.json();
  };

  const {
    mutateAsync: createElectionAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: createElection,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to create election");
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Election created successfully");
      queryClient.setQueryData(["election"], data);
    },
  });

  return { createElectionAsync, isPending, error, isError, isSuccess };
}; // used

export const useGetAllEvents = () => {
  const getAllEvents = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/vote/get-all-event`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to get all events");
    }
    return response.json();
  };

  const {
    data: Events,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["events"],
    queryFn: getAllEvents,
    staleTime: 60 * 60 * 1000,
  });

  return {
    Events,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  };
}; // used

export const useGetElectionProgress = (electionID: string) => {
  const getElectionProgress = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/get-election-progress/${electionID}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to get election progress");
    }
    return response.json();
  };

  const {
    data: electionProgress,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["electionProgress"],
    queryFn: getElectionProgress,
    staleTime: 60 * 60 * 1000,
    enabled: !!electionID,
    // retry: 5,
    // retryDelay: 2000, // 1 minute
  });

  return {
    electionProgress,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  };
}; // used

export const useDeleteElection = () => {
  const queryClient = useQueryClient();
  const deleteElection = async (electionID: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/delete-election/${electionID}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to delete election");
    }
    return response.json();
  };

  const {
    mutateAsync: deleteElectionAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: deleteElection,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to delete election");
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Election deleted successfully");
      queryClient.setQueryData(["election"], data);
    },
  });

  return { deleteElectionAsync, isPending, error, isError, isSuccess };
};

export const useGetAllVotes = (electionID: string) => {
  const getAllVotes = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/get-all-votes/${electionID}`,
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
      throw new Error(errorMessage.message || "Failed to get all votes");
    }
    return response.json();
  };

  const {
    data: votes,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["votes"],
    queryFn: getAllVotes,
    staleTime: 60 * 60 * 1000,
    enabled: !!electionID,
  });

  return {
    votes,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  };
}; //used
