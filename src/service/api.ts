import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Contestants {
  id: string
}
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

    getContestant: build.query<Contestants[], void>({
      query: () => ({
        url: "/contestants",
        method: "GET"
      })
    })

  })
})

export const {
  useGetVotesQuery,
  useGetContestantQuery
} = apiSlice