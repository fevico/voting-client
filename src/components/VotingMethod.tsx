import type { FC } from "react";
import Divider, { type Lead } from "./Divider";
import { Card } from "./ui/card";
import { Mail, MessageSquare, QrCode, Vote } from "lucide-react";

export const voteMethods = [
  {id: "quick", name: "Quick Vote", title: "One click, no verification", icon: Vote, bg: "bg-purple-50/60 border-purple-100 text-purple-700" },
  {id: "qr", name: "QR Code", title: "Scan from mobile device", icon: QrCode, bg: "bg-fuchsia-50/60 border-fuchsia-100 text-fuchsia-700" },
  {id: "email", name: "Email Verify", title: "Verify with your email OTP", icon: Mail, bg: "bg-blue-50/60 border-blue-100 text-blue-700" },
  {id: "sms", name: "SMS Verify", title: "Verify with a text message", icon: MessageSquare, bg: "bg-emerald-50/60 border-emerald-100 text-emerald-700" }
];

interface Props {
    leadPoint: Lead
}

const VotingMethod: FC<Props> = ({leadPoint}) => {
  return (
    <div className="w-full bg-gradient-to-b from-purple-50/60 to-pink-50/30 pt-16 pb-12 flex flex-col items-center justify-center">
      {/* 1. Header Text Container */}
      <div className="max-w-3xl w-full px-6 text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-[42px]">
          Vote for <span className="text-indigo-600 font-bold">Excellence</span>
        </h1>
        <p className="text-sm font-medium text-zinc-400 max-w-xl mx-auto tracking-normal">
          Support outstanding individuals making a difference. Multiple voting
          methods available.
        </p>
      </div>

      {/* 2. Cards Wrapper: We shrunked max-w-7xl to max-w-4xl to squeeze the grid inward */}
      <div className="max-w-5xl w-full px-6 pt-10 flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full justify-center">
          {voteMethods.map((method) => (
            <Card
              key={method.name}
              className="flex w-full flex-col items-center justify-center border-zinc-100 bg-white px-4 py-7 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center group"
            >
              {/* Icon Section */}
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100/50 mb-5 group-hover:scale-105 transition-transform">
                <method.icon className="h-5 w-5 text-indigo-600 stroke-[1.8]" />
              </div>

              {/* Text Details */}
              <h2 className="text-[15px] font-bold text-zinc-800 tracking-tight mb-1">
                {method.name}
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                {method.title}
              </p>
            </Card>
          ))}
        </div>
      </div>
      <Divider leadingPoint={leadPoint}/>
    </div>
  );
};

export default VotingMethod;
