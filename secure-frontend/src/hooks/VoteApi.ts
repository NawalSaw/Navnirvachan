"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type } from "os";
import toast from "react-hot-toast";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";


type CastVoteInput = {
  constituency: string;
  vote: string;
  tokenId: string;
};

export const useCastVote = (electionID: string) => {
  const castVote = async (data: CastVoteInput) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/vote/add-vote/${electionID}`, {
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
  } = useMutation<Response, Error, CastVoteInput>({
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

type ElectionResponse = {
  success: boolean;
  data: ElectionData;
  message: string;
}
export const useGetElectionByConstituency = (constituency: string) => {
  const getElectionByConstituency = async (): Promise<ElectionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/get-election/${constituency}`,
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
    queryFn: getElectionByConstituency,
    enabled: !!constituency,
    staleTime: 60 * 60 * 1000, // 1 hour,
    retry: false,
  });

  return { election, isPending, error, isError, isSuccess };
}; // used

type TotalVoteCountResponse = {
  success: boolean;
  data: TotalVoteCountData[];
  message: string;
}

type TotalVoteCountData = {
  id: string;
  name: string;
  party: string;
  description: string;
  location: string;
  image: string;
  votes: number;
}

export const useGetTotalVoteCount = (electionID: string) => {
  const getTotalVoteCount = async (): Promise<TotalVoteCountResponse> => {
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
  } = useQuery<TotalVoteCountResponse, Error>({
    queryKey: ["totalVoteCount"],
    queryFn: getTotalVoteCount,
    enabled: !!electionID,
    staleTime: 60 * 60 * 1000,
  });

  return { totalVoteCount, isPending, error, isError, isSuccess };
};

type ElectionData = {
  _id?: string;
  status?: string;
  code: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  constituenciesNames: string[];
  createdAt?: string;
  updatedAt?: string;
}
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

export type EventData = {
  _id?: string;
  timestamp: Date,
  eventType: string
  payloadHash: string,
  prevHash: string,
  meta: Object,
  entryHash: string,
  signature: string,
}
type EventResponse = {
  success: boolean;
  data: EventData[];
  message: string;
}
export const useGetAllEvents = () => {
  const getAllEvents = async (): Promise<EventResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/vote/get-all-logs`, {
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

type BulletinResponse = {
  success: boolean;
  data: Bulletin[];
  message: string;
}

type Bulletin = {
  electionID: string;
  ballotHash: string;
  publishedAt: Date;
}

export const useGetAllBulletins = (electionID: string) => {
  console.log("electionID", electionID);
  const getAllBulletins = async (): Promise<BulletinResponse> => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/vote/get-all-bulletins/${electionID}`,
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
      throw new Error(errorMessage.message || "Failed to get all bulletins");
    }
    return response.json();
  };

  const {
    data: bulletins,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["bulletins", electionID],
    queryFn: getAllBulletins,
    enabled: !!electionID,
    staleTime: 60 * 60 * 1000,
  });

  return {
    bulletins,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
  };
}; //used

export const useIssueToken = (electionID: string, voterId: string) => {
  const queryClient = useQueryClient();
  const issueToken = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/vote/issue-token/${electionID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ electionId: electionID, voterId }),
      credentials: "include",
    });
    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to issue token");
    }
    return response.json();
  };

  const {
    mutateAsync: issueTokenAsync,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: issueToken,
    onError: (error) => {
      toast.error(error.message ? error.message : "Failed to issue token");
    },
    onSuccess: (data) => {
      console.log(data);
      toast.success("Token issued successfully");
      queryClient.setQueryData(["election"], data);
    },
  });

  return { issueTokenAsync, isPending, error, isError, isSuccess };
};

export const useGetToken = (electionID: string, voterId: string) => {
  const getToken = async () => {
    const response = await fetch(
       `${API_BASE_URL}/api/v1/vote/get-tokenId/${voterId}/${electionID}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || "Failed to get token");
    }
    return response.json();
  };

  return useQuery({
    queryKey: ["token", electionID, voterId],
    queryFn: getToken,
    enabled: true,
    staleTime: 60 * 60 * 1000,
  });
};
