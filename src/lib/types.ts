export type Contestant = {
    contestants: {
        id: string
        bio: string
        votes: number
        image: {id: string, url: string}
        name: string
        tag: string
        election: {
            _id: string
            status: string
            title: string
        },
    }[]
    totalVotes: number
}