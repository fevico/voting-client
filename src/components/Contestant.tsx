import { Mail, MessageSquare, QrCode, Vote } from "lucide-react"

const voteMethods = [
    {
        name: "Quick Vote",
        title: "One click",
        icon: Vote
    }, 
    {
        name: "QR Code",
        title: "Scan & Vote",
        icon: QrCode
    }, 
    {
        name: "Email",
        title: 'Verified',
        icon: Mail
    }, 
    {
        name: "SMS",
        title: "Text to vote",
        icon: MessageSquare
    }
]
const VotingMethods = () => {
  return (
    /* 1. This container goes edge-to-edge with the background color */
    <div className="w-full bg-gradient-to-b from-purple-50 to-pink-50/50 py-8 flex flex-col items-center justify-center">
      
      {/* 2. This container keeps our content centered and safe from hitting the screen edges */}
      <div className="max-w-7xl w-full px-6 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Vote for Excellence 
        </h1>
        <p className="text-base text-zinc-600 max-w-2xl mx-auto">
          Support outstanding individuals making a difference. Multiple voting methods available.
        </p>
      </div>

      {/* 3. This container holds the voting method cards */}
      <div className="max-w-7xl w-full px-6 py-8">
        {/* Voting method cards will go here! */}
      </div>

    </div>
  )
}

const Contestant = () => {
  return (
    <div className="w-full">
      <VotingMethods/>
    </div>
  )
}

export default Contestant