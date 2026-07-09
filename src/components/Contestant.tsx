import {
  ChevronLeft,
  Mail,
  MessageSquare,
  Share2,
  Vote,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  useGetContestantQuery,
  useOtpRequestMutation,
  useTriggerQrVoteMutation,
  useTriggerQuickVoteMutation,
  useVerifyOtpAndVoteMutation,
} from "@/service/api";
import { Progress } from "./ui/progress";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import VotingMethod, { voteMethods } from "./VotingMethod";
import { useRealtimeVotes } from "@/hook/useRealtimeVote";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

const Contestant = () => {
  const { data: contestant, isLoading } = useGetContestantQuery();

  const [triggerQuickVote] =
    useTriggerQuickVoteMutation();
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
  const totalVote = totalVotesPool ? totalVotesPool : 0

  return (
    <div className="w-full bg-zinc-50/50 min-h-screen pb-20">
      <VotingMethod />

      <div className="max-w-6xl mx-auto px-6 pt-12">
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
      <Dialog
        open={!!selectedContestant}
        onOpenChange={(open) => !open && resetModal()}
      >
        <DialogContent className="max-w-[460px] w-full p-6 rounded-3xl border-0 bg-white shadow-2xl overflow-hidden gap-0">
          {/* STEP 1: 2x2 METHODS */}
          <DialogTitle></DialogTitle>
          {activeSubStep === "methods" && (
            <>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedContestant?.image?.url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-100"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 tracking-wide">
                      Voting for
                    </p>
                    <h3 className="text-base font-bold text-zinc-900 leading-tight">
                      {selectedContestant?.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  className="p-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-semibold text-zinc-500 mb-4">
                Choose how you want to cast your vote:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {voteMethods.map((method) => (
                  <div
                    key={method.name}
                    onClick={() =>
                      handleVoteAction(
                        method.id,
                        selectedContestant._id,
                        selectedContestant.election._id,
                      )
                    }
                    className="flex flex-col items-start p-4 rounded-2xl border bg-white hover:bg-zinc-50/50 hover:shadow-sm cursor-pointer transition-all border-zinc-100 group"
                  >
                    <div
                      className={`p-2 rounded-xl mb-4 border ${method.bg} group-hover:scale-105 transition-transform`}
                    >
                      <method.icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-800 mb-0.5">
                      {method.name}
                    </h4>
                    <p className="text-[11px] font-medium text-zinc-400 leading-tight">
                      {method.title}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: EMAIL COLLECTION */}
          {activeSubStep === "email" && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setActiveSubStep("methods")}
                  className="text-xs font-bold text-zinc-400 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h3 className="text-base font-bold text-zinc-900 absolute left-1/2 -translate-x-1/2">
                  Email Verification
                </h3>
                <button
                  type="button"
                  onClick={resetModal}
                  className="p-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-zinc-800">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border-2 border-zinc-100 bg-zinc-50/50 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:border-purple-300 focus:bg-white transition-all"
                />
                <p className="text-xs font-medium text-zinc-400 pt-1">
                  We'll send a one-time code to verify your email.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isOtpRequesting}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-5 rounded-xl shadow-md"
              >
                <Mail className="w-4 h-4 mr-2 inline" />{" "}
                {isOtpRequesting ? <Spinner /> : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* STEP 3: SMS COLLECTION */}
          {activeSubStep === "sms" && (
            <form onSubmit={handleSmsSubmit} className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setActiveSubStep("methods")}
                  className="text-xs font-bold text-zinc-400 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h3 className="text-base font-bold text-zinc-900 absolute left-1/2 -translate-x-1/2">
                  SMS Verification
                </h3>
                <button
                  type="button"
                  onClick={resetModal}
                  className="p-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-sm font-bold text-zinc-800">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full border-2 border-zinc-100 bg-zinc-50/50 rounded-xl px-4 py-3 text-sm font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:border-purple-300 focus:bg-white transition-all"
                />
                <p className="text-xs font-medium text-zinc-400 pt-1">
                  We'll text a one-time code to verify your number.
                </p>
              </div>
              <Button
                type="submit"
                disabled={isOtpRequesting}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-5 rounded-xl shadow-md"
              >
                <MessageSquare className="w-4 h-4 mr-2 inline" />{" "}
                {isOtpRequesting ? <Spinner /> : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* 👑 NEW STEP 4 & 5: REPLICATED GRAPHICAL OTP PANEL VIEWPORT */}
          {(activeSubStep === "email-otp" || activeSubStep === "sms-otp") && (
            <form
              onSubmit={handleOtpVerificationSubmit}
              className="flex flex-col items-center text-center"
            >
              {/* Header Navigation Options */}
              <div className="w-full flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() =>
                    setActiveSubStep(
                      activeSubStep === "email-otp" ? "email" : "sms",
                    )
                  }
                  className="text-xs font-bold text-zinc-400 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <h3 className="text-base font-bold text-zinc-900">
                  {activeSubStep === "email-otp"
                    ? "Email Verification"
                    : "SMS Verification"}
                </h3>
                <button
                  type="button"
                  onClick={resetModal}
                  className="p-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sub Navigation Link */}
              <button
                type="button"
                onClick={() =>
                  setActiveSubStep(
                    activeSubStep === "email-otp" ? "email" : "sms",
                  )
                }
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mb-6 self-start"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Change{" "}
                {activeSubStep === "email-otp" ? "email" : "number"}
              </button>

              {/* Envelope Notification Medallion */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-500 border border-indigo-100/50 mb-4 animate-bounce">
                {activeSubStep === "email-otp" ? (
                  <Mail className="w-6 h-6" />
                ) : (
                  <MessageSquare className="w-6 h-6" />
                )}
              </div>

              <h4 className="text-lg font-bold text-zinc-800 mb-1">
                Enter the 6-digit code
              </h4>
              <p className="text-xs font-medium text-zinc-400 mb-6">
                Sent to{" "}
                <span className="font-bold text-zinc-700">
                  {getMaskedTarget()}
                </span>
              </p>

              {/* 6 Grid Separated Inputs Box row layout */}
              <div className="flex gap-2.5 justify-center mb-8">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => {
                      inputRefs.current[index] = el!;
                    }}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e.target as any, index)}
                    className="w-12 h-14 border-2 rounded-2xl text-center text-xl font-bold bg-white text-zinc-800 outline-none transition-all focus:border-indigo-500 border-zinc-100 shadow-sm focus:ring-4 focus:ring-indigo-50"
                  />
                ))}
              </div>

              {/* Action Form Confirmation button */}
              <Button
                type="submit"
                disabled={otp.join("").length < 6 || isOtpVerifying}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-semibold py-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mb-5"
              >
                <CheckCircle2 className="w-4 h-4" /> {isOtpVerifying ? <Spinner/> : "Verify & Submit Vote"}
              </Button>

              <p className="text-xs font-medium text-zinc-400 tracking-normal">
                Didn't receive a code?{" "}
                <span className="text-zinc-800 font-bold cursor-pointer hover:underline">
                  Resend in 25s
                </span>
              </p>
              <p className="text-[10px] font-medium text-zinc-300 max-w-xs mt-3 leading-normal">
                Check your spam folder if you don't see it within a minute.
              </p>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contestant;
