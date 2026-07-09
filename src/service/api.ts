import type { Contestant } from '@/lib/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({baseUrl: "http://localhost:3030/api"}),
  tagTypes: [],
  endpoints: (build) => ({
    getVotes: build.query({
      query: () => ({
        url: "",
        method: "GET"
      })
    }),

    getContestant: build.query<Contestant, void>({
      query: () => ({
        url: "/contestants",
        method: "GET"
      })
    }),

    triggerQuickVote: build.mutation({
      query: ({contestantId, electionId}) => ({
        url: "/votes/quick",
        method: "POST",
        body: {contestantId, electionId}
      })
    }),

    triggerQrVote: build.mutation({
      query: () => ({
        url: "/votes/quick",
        method: "POST"
      })
    }),

    triggerEmailVote: build.mutation({
      query: () => ({
        url: "/votes/quick",
        method: "POST"
      })
    }),

    triggerSmsVote: build.mutation({
      query: () => ({
        url: "/votes/quick",
        method: "POST"
      })
    }),

    verifyOtpAndVote: build.mutation({
      query: (credential) => ({
        url: "/votes/otp/verify",
        method: "POST",
        body: credential
      })
    }),

    otpRequest: build.mutation({
      query: (credentials) => ({
        url: "/votes/otp/request",
        method: "POST",
        body: credentials
      })
    })

  })
})

export const {
  useGetVotesQuery,
  useGetContestantQuery,
  useTriggerQuickVoteMutation,
  useTriggerQrVoteMutation,
  useTriggerEmailVoteMutation,
  useTriggerSmsVoteMutation,
  useVerifyOtpAndVoteMutation,
  useOtpRequestMutation
} = apiSlice