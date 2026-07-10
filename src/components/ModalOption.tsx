import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { CheckCircle2, ChevronLeft, Mail, MessageSquare, X } from "lucide-react";
import { voteMethods } from "./VotingMethod";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import type { Dispatch, FC, FormEvent, KeyboardEvent, RefObject, SetStateAction } from "react";

interface Props {
  selectedContestant: any;
  resetModal(): void;
  activeSubStep: "methods" | "email" | "sms" | "email-otp" | "sms-otp";
  handleVoteAction(method: string, contestant: string, election: string): void;
  handleEmailSubmit: (e: FormEvent<Element>) => Promise<void>
  handleSmsSubmit: (e: FormEvent<Element>) => Promise<void>
  setActiveSubStep: Dispatch<SetStateAction<"methods" | "email" | "sms" | "email-otp" | "sms-otp">>
  isOtpRequesting: boolean
  emailInput: string;
  setEmailInput(value: string): void;
  phoneInput: string;
  setPhoneInput(value: string): void;
  handleOtpVerificationSubmit: (e: FormEvent<Element>) => Promise<void>
  getMaskedTarget(): React.ReactNode
  otp: string[]
  inputRefs: RefObject<HTMLInputElement[]>
  handleOtpChange(value: any, index: number): void
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void
  isOtpVerifying: boolean
}
const ModalOption: FC<Props> = ({
  selectedContestant,
  activeSubStep,
  handleEmailSubmit,
  handleSmsSubmit,
  setActiveSubStep,
  handleVoteAction,
  resetModal,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  isOtpRequesting,
  handleOtpVerificationSubmit,
  getMaskedTarget,
  otp,
  inputRefs,
  handleOtpChange,
  handleKeyDown,
  isOtpVerifying
}) => {
  return (
    <div>
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
                <CheckCircle2 className="w-4 h-4" />{" "}
                {isOtpVerifying ? <Spinner /> : "Verify & Submit Vote"}
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

export default ModalOption;
