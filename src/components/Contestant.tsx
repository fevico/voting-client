import { Card } from "./ui/card";
import {
  useGetContestantQuery,
  useOtpRequestMutation,
  useTriggerQrVoteMutation,
  useTriggerQuickVoteMutation,
  useVerifyOtpAndVoteMutation,
} from "@/service/api";
import { Progress } from "./ui/progress";
import { useState, useRef } from "react";
import VotingMethod from "./VotingMethod";
import { useRealtimeVotes } from "@/hook/useRealtimeVote";
import { toast } from "sonner";
import ModalOption from "./ModalOption";
import { Share2, Vote } from "lucide-react";
import { Button } from "./ui/button";

const Contestant = () => {
  const { data: contestant, isLoading } = useGetContestantQuery();

  const [triggerQuickVote] = useTriggerQuickVoteMutation();
  const [triggerQrVote] = useTriggerQrVoteMutation();
  const [otpRequest, { isLoading: isOtpRequesting }] = useOtpRequestMutation();
  const [verifyOtpAndVote, { isLoading: isOtpVerifying }] =
    useVerifyOtpAndVoteMutation();

  const [selectedContestant, setSelectedContestant] = useState<any>(null);

  const activeElectionId = contestant?.contestants?.[0]?.election?._id;
  useRealtimeVotes(activeElectionId);

  // ── UPDATED SUB-STEPS FOR OTP VIEWS ────────────────────────────────────────
  const [activeSubStep, setActiveSubStep] = useState<
    "methods" | "email" | "sms" | "email-otp" | "sms-otp"
  >("methods");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  // 6-digit OTP handling state arrays
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleVoteAction = async (
    methodId: string,
    contestantId: string,
    electionId: string,
  ) => {
    try {
      const payload: any = { contestantId, electionId };

      switch (methodId) {
        case "quick":
          await triggerQuickVote(payload).unwrap();
          setSelectedContestant(null);
          break;
        case "qr":
          await triggerQrVote(payload).unwrap();
          setSelectedContestant(null);
          break;
        case "email":
          setActiveSubStep("email");
          break;
        case "sms":
          setActiveSubStep("sms");
          break;
        default:
          console.warn("Unknown voting method passed.");
      }
    } catch (err) {
      console.error("Failed to complete action request:", err);
    }
  };

  // ── OTP INPUT TEXT FIELD UTILITIES ──────────────────────────────────────────
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, ""); // Keep numeric values only
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Extract final value typed
    setOtp(newOtp);

    // Dynamic focus shifting to neighboring elements automatically
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      // Shift back layout focus
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // ── SEND ROUTINES (PROGRESSED LAYER OUT TO OTP VIEWPORTS) ───────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    try {
      await otpRequest({
        target: emailInput,
        contestantId: selectedContestant._id,
        electionId: selectedContestant.election._id,
        method: "email",
      }).unwrap();

      toast.success("OTP Request!", {
        description: `OTP sent  successfully.`,
        duration: 4000,
      });

      // Transition to OTP Input block layout instead of resetting out!
      setActiveSubStep("email-otp");
    } catch (err: any) {
      toast.error("Request otp error!", {
        description: `${err.data.error}`,
        duration: 4000,
      });
    }
  };

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    try {
      await otpRequest({
        contestantId: selectedContestant._id,
        electionId: selectedContestant.election._id,
        target: phoneInput,
        method: "sms",
      }).unwrap();

      // Transition to OTP Input block layout instead of resetting out!
      toast.success("OTP Request!", {
        description: `OTP sent  successfully.`,
        duration: 4000,
      });
      setActiveSubStep("sms-otp");
    } catch (err: any) {
      toast.error("Request otp error!", {
        description: `${err.data.error}`,
        duration: 4000,
      });
    }
  };

  // ── FINALIZE CODE SUMMATION ROUTINES ────────────────────────────────────────
  const handleOtpVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = otp.join("");
    if (finalCode.length < 6) return;

    try {
      console.log(
        `Submitting Verification Token: ${finalCode} for mode ${activeSubStep}`,
      );
      if (activeSubStep === "email-otp") {
        // Execute your API mutation here, e.g.:
        await verifyOtpAndVote({
          target: emailInput,
          contestantId: selectedContestant._id,
          electionId: selectedContestant.election._id,
          method: "email",
          otp: finalCode,
        }).unwrap();
      } else {
        await verifyOtpAndVote({
          target: phoneInput,
          contestantId: selectedContestant._id,
          electionId: selectedContestant.election._id,
          method: "sms",
          otp: finalCode,
        }).unwrap();
      }

      resetModal();
    } catch (err) {
      console.error("Invalid verification payload", err);
    }
  };

  const resetModal = () => {
    setSelectedContestant(null);
    setActiveSubStep("methods");
    setEmailInput("");
    setPhoneInput("");
    setOtp(new Array(6).fill(""));
  };

  // Mask string display helpers (e.g., matching 'aj***@gmail.com')
  const getMaskedTarget = () => {
    if (activeSubStep === "email-otp") {
      const [name, domain] = emailInput.split("@");
      return `${name.substring(0, 2)}***@${domain}`;
    }
    return `***-***-${phoneInput.substring(phoneInput.length - 4)}`;
  };

  if (isLoading)
    return <div className="text-center py-20">Loading Contestants...</div>;

  const totalVotesPool = contestant?.totalVotes;
  const totalVote = totalVotesPool ? totalVotesPool : 0;

const data = contestant?.contestants || [];
  
  // Find the contestant with the maximum votes using reduce
  const leadingContestant = data.reduce((prev, current) => {
    return (prev && prev.votes > current.votes) ? prev : current;
  }, null as any);

  return (
    <div className="w-full bg-zinc-50/50 min-h-screen pb-10">
      <VotingMethod leadPoint={leadingContestant} />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contestant?.contestants.map((item, index) => {
            const percentage = (item.votes / totalVote) * 100;

            return (
              <Card
                key={index}
                className="relative border-zinc-100 bg-white rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col p-0 group"
              >
                <div className="relative w-full h-[260px] overflow-hidden m-0 p-0">
                  <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {index === 0 && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Leading
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <span className="inline-block bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-lg mb-1.5">
                      {index === 0
                        ? "Community Builder"
                        : index === 1
                          ? "Social Impact"
                          : "Tech Pioneer"}
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight leading-none">
                      {item.name}
                    </h2>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between space-y-5">
                  <p className="text-sm font-medium text-zinc-500 line-clamp-2 leading-relaxed">
                    {item.bio}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-sm">
                      <span className="font-bold text-zinc-800">
                        {item.votes.toLocaleString()}{" "}
                        <span className="text-xs font-medium text-zinc-400 ml-0.5">
                          votes
                        </span>
                      </span>
                      <span className="font-bold text-zinc-500 text-xs">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2.5 bg-zinc-100"
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      onClick={() => setSelectedContestant(item)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 rounded-xl shadow-sm flex items-center justify-center gap-2"
                    >
                      <Vote className="w-4 h-4" /> Vote Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold py-5 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4 text-zinc-400" /> Share Link
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 📥 DYNAMIC MODAL MASTER COMPONENT */}
      {/* modal */}
      <ModalOption
        activeSubStep={activeSubStep}
        emailInput={emailInput}
        getMaskedTarget={getMaskedTarget}
        handleEmailSubmit={handleEmailSubmit}
        handleKeyDown={handleKeyDown}
        handleOtpChange={handleOtpChange}
        handleOtpVerificationSubmit={handleOtpVerificationSubmit}
        handleSmsSubmit={handleSmsSubmit}
        handleVoteAction={handleVoteAction}
        inputRefs={inputRefs}
        isOtpRequesting={isOtpRequesting}
        isOtpVerifying={isOtpVerifying}
        otp={otp}
        phoneInput={phoneInput}
        resetModal={resetModal}
        selectedContestant={selectedContestant}
        setActiveSubStep={setActiveSubStep}
        setEmailInput={setEmailInput}
        setPhoneInput={setPhoneInput}
      />
    </div>
  );
};

export default Contestant;