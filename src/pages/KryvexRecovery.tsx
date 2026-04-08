"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  ClipboardCopy,
  Upload,
  CheckCircle,
  Shield,
  Lock,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Phone,
  Building2,
  DollarSign,
  Fingerprint,
  AlertCircle,
  Sparkles,
  Coins,
  Zap,
  ArrowRight,
  ExternalLink,
  Download
} from "lucide-react";

const steps = [
  "Identity",
  "Verification",
  "Calculation",
  "Payment",
  "Complete"
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
    selectedAddress: "",
  });
  const [fee, setFee] = useState(0);
  const [net, setNet] = useState(0);
  const [requestId, setRequestId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  // Calculate fee whenever total amount changes
  useEffect(() => {
    if (form.total && Number(form.total) > 0) {
      const total = Number(form.total);
      const feeCalc = total * 0.2;
      setFee(feeCalc);
      setNet(total);
    } else {
      setFee(0);
      setNet(0);
    }
  }, [form.total]);

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
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max size is 10 MB", variant: "destructive" });
        return;
      }
      const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Allowed: PNG, JPG, PDF", variant: "destructive" });
        return;
      }
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
    setForm((prev) => ({ ...prev, [key]: file }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        // Identity step - validate all required fields
        const isIdentityValid = (
          form.fullName.trim() &&
          form.email.trim() &&
          form.email.includes('@') &&
          form.phone.trim() &&
          form.phone.length >= 10 &&
          form.platform.trim() &&
          form.total &&
          Number(form.total) > 0
        );
        
        if (!isIdentityValid) {
          let errorMessage = "Please fill all required fields:";
          if (!form.fullName.trim()) errorMessage += " Full name,";
          if (!form.email.trim() || !form.email.includes('@')) errorMessage += " Valid email,";
          if (!form.phone.trim() || form.phone.length < 10) errorMessage += " Valid phone number,";
          if (!form.platform.trim()) errorMessage += " Trading platform,";
          if (!form.total || Number(form.total) <= 0) errorMessage += " Total amount,";
          
          toast({ 
            title: errorMessage.replace(/,$/, ''), 
            variant: "destructive" 
          });
          return false;
        }
        return true;
        
      case 1:
        // Verification step - require proof of funds file
        if (!form.proofFile) {
          toast({ 
            title: "Please upload proof of funds document", 
            description: "This document is required to verify your claim",
            variant: "destructive" 
          });
          return false;
        }
        
        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!allowedTypes.includes(form.proofFile.type)) {
          toast({ 
            title: "Invalid file format", 
            description: "Please upload JPG, PNG, or PDF files only",
            variant: "destructive" 
          });
          return false;
        }
        
        if (form.proofFile.size > maxSize) {
          toast({ 
            title: "File too large", 
            description: "Maximum file size is 10MB",
            variant: "destructive" 
          });
          return false;
        }
        
        return true;
        
      case 2:
        // Calculation step - no validation needed, just display
        return true;
        
      case 3:
        // Payment step - require either transaction ID OR payment proof, AND selected address
        const hasTransactionId = form.transactionId.trim();
        const hasPaymentProof = form.paymentProof !== null;
        const hasSelectedAddress = form.selectedAddress.trim();
        
        if (!hasSelectedAddress) {
          toast({ 
            title: "Please select a payment address", 
            variant: "destructive" 
          });
          return false;
        }
        
        if (!hasTransactionId && !hasPaymentProof) {
          toast({ 
            title: "Payment verification required", 
            description: "Please enter transaction ID OR upload payment proof",
            variant: "destructive" 
          });
          return false;
        }
        
        // Validate payment proof file if uploaded
        if (hasPaymentProof) {
          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          const maxSize = 10 * 1024 * 1024; // 10MB
          
          if (!allowedTypes.includes(form.paymentProof.type)) {
            toast({ 
              title: "Invalid payment proof format", 
              description: "Please upload JPG, PNG, or PDF files only",
              variant: "destructive" 
            });
            return false;
          }
          
          if (form.paymentProof.size > maxSize) {
            toast({ 
              title: "Payment proof file too large", 
              description: "Maximum file size is 10MB",
              variant: "destructive" 
            });
            return false;
          }
        }
        
        return true;
        
      default:
        return true;
    }
  };

  const next = () => {
    if (!validateStep()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const total = Number(form.total);
    const feeCalc = total * 0.2;
    setFee(feeCalc);
    setNet(total);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmPayment = async () => {
    setIsProcessing(true);
    try {
      const id = Math.random().toString(36).substring(2, 10).toUpperCase();
      const total = Number(form.total);
      const feeCalc = total * 0.2;
      
      setRequestId(id);
      setFee(feeCalc);
      setNet(total);
      setIsProcessing(false);
      setCurrentStep(4);
      
      toast({ 
        title: "Success!", 
        description: "Your recovery request has been submitted successfully." 
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
      setIsProcessing(false);
    }
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setForm(prev => ({ ...prev, selectedAddress: addr }));
    toast({ title: "Address copied to clipboard", description: "Selected address for payment" });
  };

  const downloadFormData = () => {
    const formData = {
      requestId: requestId,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      platform: form.platform,
      totalAmount: form.total,
      feeAmount: fee.toFixed(2),
      netAmount: net.toFixed(2),
      transactionId: form.transactionId,
      selectedAddress: form.selectedAddress,
      status: 'Payment Verification Initiated',
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kryvex-recovery-${requestId}.json`;
    link.click();
  };

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ 
        title: "Popup Blocked", 
        description: "Please allow popups for this site to download PDF", 
        variant: "destructive" 
      });
      return;
    }

    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Kryvex Trading - Recovery Summary</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #fbbf24; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .header h1 { 
            color: #1f2937; 
            margin: 0;
            font-size: 24px;
        }
        .section { 
            margin-bottom: 25px; 
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #f9fafb;
        }
        .section h2 { 
            color: #1f2937; 
            border-bottom: 2px solid #fbbf24; 
            padding-bottom: 5px; 
            margin-top: 0;
            font-size: 18px;
        }
        .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
            padding: 4px 0;
        }
        .info-label { 
            font-weight: bold; 
            color: #374151;
        }
        .info-value { 
            color: #1f2937;
        }
        .highlight { 
            background-color: #fef3c7; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #fbbf24;
            margin: 20px 0;
        }
        .address-box {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 5px 0;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 12px; 
            color: #6b7280;
        }
        .signature-line {
            border-bottom: 1px solid #374151;
            width: 300px;
            margin-top: 50px;
        }
        @media print {
            body { margin: 10px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>KRYVEX TRADING - FUNDS RECOVERY SUMMARY</h1>
        <p>Professional Digital Asset Recovery Service</p>
    </div>

    <div class="section">
        <h2>REQUEST INFORMATION</h2>
        <div class="info-row">
            <span class="info-label">Request ID:</span>
            <span class="info-value">${requestId}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">Payment Verification Initiated</span>
        </div>
        <div class="info-row">
            <span class="info-label">Timestamp:</span>
            <span class="info-value">${new Date().toISOString()}</span>
        </div>
    </div>

    <div class="section">
        <h2>USER INFORMATION</h2>
        <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span class="info-value">${form.fullName}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${form.email}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${form.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Original Platform:</span>
            <span class="info-value">${form.platform}</span>
        </div>
    </div>

    <div class="section">
        <h2>FINANCIAL DETAILS</h2>
        <div class="info-row">
            <span class="info-label">Total Amount:</span>
            <span class="info-value">${Number(form.total).toLocaleString()} USDT</span>
        </div>
        <div class="info-row">
            <span class="info-label">Service Fee (20%):</span>
            <span class="info-value">${fee.toLocaleString()} USDT</span>
        </div>
        <div class="highlight">
            <div class="info-row">
                <span class="info-label">You Will Receive:</span>
                <span class="info-value" style="font-size: 18px; font-weight: bold; color: #059669;">${net.toLocaleString()} USDT</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>PAYMENT INFORMATION</h2>
        <div class="info-row">
            <span class="info-label">Selected Network:</span>
            <span class="info-value">${form.selectedAddress.includes('TRC20') ? 'TRON (TRC20)' : form.selectedAddress.includes('ERC20') ? 'Ethereum (ERC20)' : 'Bitcoin (BTC)'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${form.transactionId || 'N/A'}</span>
        </div>
    </div>

    <div class="section">
        <h2>CRYPTOCURRENCY ADDRESSES</h2>
        <div class="info-row">
            <span class="info-label">USDT (TRC20):</span>
        </div>
        <div class="address-box">TYdFjAfhWL9DjaDBAe5LS7zUjBqpYGkRYB</div>
        
        <div class="info-row" style="margin-top: 10px;">
            <span class="info-label">USDT (ERC20):</span>
        </div>
        <div class="address-box">0xd5fffaa3740af39c265563aec8c14bd08c05e838</div>
        
        <div class="info-row" style="margin-top: 10px;">
            <span class="info-label">BTC (Bitcoin):</span>
        </div>
        <div class="address-box">1FTUbAx5QNTWbxyerMPpxRbwqH3XnvwKQb</div>
    </div>

    <div class="section">
        <h2>NEXT STEPS</h2>
        <div style="margin-bottom: 10px;">1. Your payment verification is now in progress</div>
        <div style="margin-bottom: 10px;">2. Create your Kryvex TRADING account at: <a href="https://www.kryvextrading.com/">https://www.kryvextrading.com/</a></div>
        <div style="margin-bottom: 10px;">3. Once verified, your funds will be credited to your account</div>
        <div>4. Keep this summary for your records</div>
    </div>

    <div class="section">
        <h2>DISCLAIMER</h2>
        <p>This is a fund recovery fee. The 20% includes withdrawal, recovery, insurance & tax. This fee is non-refundable once paid.</p>
    </div>

    <div class="footer">
        <div class="info-row">
            <span class="info-label">Generated:</span>
            <span class="info-value">${new Date().toLocaleString()}</span>
        </div>
        <div style="margin-top: 30px;">
            <div style="margin-bottom: 5px;">Signature:</div>
            <div class="signature-line"></div>
        </div>
    </div>
</body>
</html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (or after print dialog is closed)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20 shadow-xl sm:shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 via-transparent to-orange-500/3 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
              
              <CardHeader className="relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/25 flex-shrink-0">
                      <span className="text-slate-900 font-bold text-lg sm:text-xl">K</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-base sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Kryvex Trading
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Professional Digital Asset Recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 sm:px-3 py-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-[10px] sm:text-xs font-medium">SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 sm:px-3 py-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                      <span className="text-blue-400 text-[10px] sm:text-xs font-medium">256-bit</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-white text-base sm:text-xl font-semibold">Account Information</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            step < currentStep
                              ? 'bg-green-500'
                              : step === currentStep
                              ? 'bg-yellow-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">Step {currentStep + 1} of 5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4 px-4 sm:px-6 pb-4">
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <p className="text-blue-300 text-xs sm:text-sm flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      All fields marked with * are required to proceed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> Full Name *
                    </Label>
                    <Input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name as on ID"
                      className={`bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all h-11 sm:h-12 text-sm sm:text-base ${
                        !form.fullName.trim() && currentStep === 0 ? 'border-red-500/50' : ''
                      }`}
                    />
                    {!form.fullName.trim() && currentStep === 0 && (
                      <p className="text-red-400 text-xs">Full name is required</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> Email Address *
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> Phone Number
                    </Label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> Trading Platform *
                    </Label>
                    <Input
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                      placeholder="e.g., Binance, Coinbase, Kraken"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all h-11 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> Total Recovery Amount (USDT) *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 font-bold text-base sm:text-lg">$</div>
                    <Input
                      name="total"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.total}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all h-12 sm:h-14 pl-8 text-base sm:text-lg font-semibold"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Fingerprint className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> ID Document Upload *
                  </Label>
                  <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-4 sm:p-6 text-center hover:border-yellow-400/50 transition-colors cursor-pointer"
                    onClick={() => idInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-slate-300 text-sm sm:text-base mb-1">Upload ID or Passport</p>
                    <p className="text-slate-500 text-xs">PNG, JPG, PDF (Max 10MB)</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      ref={idInputRef}
                      onChange={(e) => handleFile(e, "idUpload")}
                      className="hidden"
                    />
                  </div>
                  {form.idUpload && (
                    <div className="mt-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[250px]">{form.idUpload.name}</span>
                      </div>
                      {uploadProgress < 100 && uploadProgress > 0 && (
                        <div className="w-20 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-800/30 border-t border-slate-700">
                <div className="text-slate-400 text-xs text-center sm:text-left order-2 sm:order-1">
                  <span className="font-medium">Note:</span> All fields marked with * are required
                </div>
                <Button 
                  onClick={next} 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold px-6 py-2 sm:px-8 sm:py-3 shadow-lg shadow-yellow-400/25 transition-all duration-200 hover:scale-105 w-full sm:w-auto order-1 sm:order-2"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 1:
        return (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20 shadow-xl sm:shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 via-transparent to-orange-500/3 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
              
              <CardHeader className="relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/25 flex-shrink-0">
                      <span className="text-slate-900 font-bold text-lg sm:text-xl">K</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-base sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Kryvex Trading
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Professional Digital Asset Recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 sm:px-3 py-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-[10px] sm:text-xs font-medium">SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 sm:px-3 py-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                      <span className="text-blue-400 text-[10px] sm:text-xs font-medium">256-bit</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-white text-base sm:text-xl font-semibold">Proof of Funds</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            step < currentStep
                              ? 'bg-green-500'
                              : step === currentStep
                              ? 'bg-yellow-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">Step {currentStep + 1} of 5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6 px-4 sm:px-6 pb-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-lg sm:text-2xl font-bold">Upload Proof of Funds</h4>
                    <p className="text-slate-400 text-xs sm:text-sm">Documentation showing your frozen or lost funds</p>
                  </div>
                </div>
                
                <div 
                  className="border-2 border-dashed border-slate-600 rounded-xl p-6 sm:p-10 text-center hover:border-yellow-400 transition-all duration-300 bg-slate-800/30 cursor-pointer"
                  onClick={() => proofInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium text-base sm:text-lg mb-1">Click to upload documents</p>
                  <p className="text-slate-500 text-xs sm:text-sm">PNG, JPG, PDF (Max 10MB)</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,application/pdf"
                    ref={proofInputRef}
                    onChange={(e) => handleFile(e, "proofFile")}
                    className="hidden"
                  />
                </div>
                
                {form.proofFile && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <FileCheck className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm font-medium break-all">{form.proofFile.name}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-400 font-bold text-base sm:text-xl">1</span>
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">Account Statement</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs mt-1">Balance & history</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-400 font-bold text-base sm:text-xl">2</span>
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">Transaction Records</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs mt-1">Deposit/withdrawal</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4 text-center">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-400 font-bold text-base sm:text-xl">3</span>
                    </div>
                    <p className="text-white text-xs sm:text-sm font-medium">Communication</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs mt-1">Support screenshots</p>
                  </div>
                </div>
              </CardContent>
              
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3 bg-slate-800/30 border-t border-slate-700">
                <Button 
                  onClick={prev} 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-2 sm:px-8 sm:py-3 order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={next} 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold px-6 py-2 sm:px-10 sm:py-3 shadow-lg shadow-yellow-400/25 transition-all duration-200 hover:scale-105 order-1 sm:order-2"
                >
                  Verify & Calculate <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 2:
        return (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20 shadow-xl sm:shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 via-transparent to-orange-500/3 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
              
              <CardHeader className="relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/25 flex-shrink-0">
                      <span className="text-slate-900 font-bold text-lg sm:text-xl">K</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-base sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Kryvex Trading
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Professional Digital Asset Recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 sm:px-3 py-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-[10px] sm:text-xs font-medium">SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 sm:px-3 py-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                      <span className="text-blue-400 text-[10px] sm:text-xs font-medium">256-bit</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-white text-base sm:text-xl font-semibold">Fee Calculation</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            step < currentStep
                              ? 'bg-green-500'
                              : step === currentStep
                              ? 'bg-yellow-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">Step {currentStep + 1} of 5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6 px-4 sm:px-6 pb-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-yellow-400 text-2xl sm:text-3xl font-bold">%</span>
                  </div>
                  <div>
                    <h4 className="text-white text-lg sm:text-2xl font-bold">Service Fee Calculation</h4>
                    <p className="text-slate-400 text-xs sm:text-sm">Transparent pricing with no hidden costs</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <span className="text-slate-400 text-xs sm:text-sm">Total Recovery Amount</span>
                    <span className="text-white font-bold text-base sm:text-xl">${Number(form.total).toLocaleString()} USDT</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700 flex-wrap gap-2">
                    <span className="text-slate-400 text-xs sm:text-sm">Service Fee (20%)</span>
                    <span className="text-yellow-400 font-bold text-base sm:text-xl">${fee.toLocaleString()} USDT</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 flex justify-between items-center flex-wrap gap-2">
                    <span className="text-green-400 text-xs sm:text-sm font-medium">You Will Receive</span>
                    <span className="text-green-400 font-bold text-lg sm:text-2xl">${net.toLocaleString()} USDT</span>
                  </div>
                </div>
              </CardContent>
              
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3 bg-slate-800/30 border-t border-slate-700">
                <Button 
                  onClick={prev} 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-2 sm:px-8 sm:py-3 order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={next} 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold px-6 py-2 sm:px-10 sm:py-3 shadow-lg shadow-yellow-400/25 transition-all duration-200 hover:scale-105 order-1 sm:order-2"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 3:
        return (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20 shadow-xl sm:shadow-2xl shadow-yellow-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/3 via-transparent to-orange-500/3 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
              
              <CardHeader className="relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/25 flex-shrink-0">
                      <span className="text-slate-900 font-bold text-lg sm:text-xl">K</span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-base sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Kryvex Trading
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Professional Digital Asset Recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 sm:px-3 py-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-[10px] sm:text-xs font-medium">SSL Secured</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 sm:px-3 py-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                      <span className="text-blue-400 text-[10px] sm:text-xs font-medium">256-bit</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-white text-base sm:text-xl font-semibold">Make Payment</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            step < currentStep
                              ? 'bg-green-500'
                              : step === currentStep
                              ? 'bg-yellow-400'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm">Step {currentStep + 1} of 5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6 px-4 sm:px-6 pb-4">
                <div className="space-y-4">
                  {/* USDT TRC20 */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                    <Label className="text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> USDT (TRC20)
                    </Label>
                    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-600 rounded-lg p-2 sm:p-3">
                      <span className="flex-1 text-slate-300 text-[10px] sm:text-sm font-mono truncate">TYdFjAfhWL9DjaDBAe5LS7zUjBqpYGkRYB</span>
                      <Button size="sm" onClick={() => copyAddress("TYdFjAfhWL9DjaDBAe5LS7zUjBqpYGkRYB")} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400">
                        <ClipboardCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* USDT ERC20 */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                    <Label className="text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> USDT (ERC20)
                    </Label>
                    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-600 rounded-lg p-2 sm:p-3">
                      <span className="flex-1 text-slate-300 text-[10px] sm:text-sm font-mono truncate">0xd5fffaa3740af39c265563aec8c14bd08c05e838</span>
                      <Button size="sm" onClick={() => copyAddress("0xd5fffaa3740af39c265563aec8c14bd08c05e838")} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400">
                        <ClipboardCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* BTC */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4">
                    <Label className="text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-2 mb-2">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" /> BTC (Bitcoin)
                    </Label>
                    <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-600 rounded-lg p-2 sm:p-3">
                      <span className="flex-1 text-slate-300 text-[10px] sm:text-sm font-mono truncate">1FTUbAx5QNTWbxyerMPpxRbwqH3XnvwKQb</span>
                      <Button size="sm" onClick={() => copyAddress("1FTUbAx5QNTWbxyerMPpxRbwqH3XnvwKQb")} className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400">
                        <ClipboardCopy className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {form.selectedAddress && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <p className="text-green-400 text-xs sm:text-sm">Address selected for payment</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs sm:text-sm font-medium">Transaction ID (Hash)</Label>
                  <Input
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleChange}
                    placeholder="Enter your transaction hash"
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-yellow-400 h-11 sm:h-12 text-sm"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-slate-400 text-xs sm:text-sm font-medium">Proof of Payment</Label>
                  <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:border-yellow-400 transition-colors cursor-pointer"
                    onClick={() => paymentInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs sm:text-sm">Upload payment screenshot</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,application/pdf"
                      ref={paymentInputRef}
                      onChange={(e) => handleFile(e, "paymentProof")}
                      className="hidden"
                    />
                  </div>
                  {form.paymentProof && (
                    <div className="mt-2 bg-green-500/10 border border-green-500/30 rounded-lg p-2 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-xs truncate">{form.paymentProof.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3 bg-slate-800/30 border-t border-slate-700">
                <Button 
                  onClick={prev} 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-6 py-2 sm:px-8 sm:py-3 order-2 sm:order-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={confirmPayment} 
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-2 sm:px-10 sm:py-3 shadow-lg shadow-green-500/25 transition-all duration-200 hover:scale-105 disabled:opacity-50 order-1 sm:order-2"
                >
                  {isProcessing ? "Processing..." : "Confirm Payment"}
                </Button>
              </div>
            </Card>
          </div>
        );
      
      case 4:
        return (
          <div className="w-full max-w-3xl mx-auto px-2 sm:px-4">
            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-green-500/20 shadow-xl sm:shadow-2xl shadow-green-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-transparent to-emerald-500/3 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400"></div>
              
              <CardHeader className="relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-400/25 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-base sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        Kryvex Trading
                      </CardTitle>
                      <p className="text-slate-400 text-xs sm:text-sm hidden sm:block">Professional Digital Asset Recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 sm:px-3 py-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-[10px] sm:text-xs font-medium">VERIFIED</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 sm:px-3 py-1">
                      <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                      <span className="text-blue-400 text-[10px] sm:text-xs font-medium">256-bit</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-white text-base sm:text-xl font-semibold">Verification Complete</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            step <= currentStep ? 'bg-green-500' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-green-400 text-xs sm:text-sm">Step {currentStep + 1} of 5</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-6 px-4 sm:px-6 pb-4">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white text-xl sm:text-3xl font-bold">Payment Initiated!</h4>
                    <p className="text-slate-400 text-sm sm:text-base">Your recovery request is being processed</p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                  <p className="text-slate-400 text-xs sm:text-sm mb-1">Request ID</p>
                  <p className="text-yellow-400 text-lg sm:text-2xl font-mono font-bold break-all">{requestId || "KRX-" + Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-white font-semibold text-sm sm:text-base">Next Steps</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-400 text-xs font-bold">1</span>
                      </div>
                      <span>Create your Kryvex Trading account</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-400 text-xs font-bold">2</span>
                      </div>
                      <span>Complete verification process</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                      <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-yellow-400 text-xs font-bold">3</span>
                      </div>
                      <span>Funds credited to your wallet</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.open("https://www.kryvextrading.com/", "_blank")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-900 font-bold py-3"
                  >
                    Go to Kryvex Trading <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={downloadPDF}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 py-3"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Kryvex
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">TRADING</p>
          <p className="text-slate-400 text-[10px] sm:text-xs mt-1">Funds Recovery System</p>
        </div>
        
        {/* Step Indicators */}
        <div className="mb-4 sm:mb-6 px-1">
          <div className="flex justify-between mb-1">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center flex-1">
                <div className={`text-[9px] sm:text-xs ${idx <= currentStep ? 'text-yellow-400' : 'text-slate-600'}`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-1 sm:h-2 bg-slate-800" />
        </div>
        
        {/* Step Content */}
        {renderStep()}
        
        {/* Security Badges */}
        <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 text-[10px] sm:text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1">
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <FileCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            <span>NFA Member</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KryvexRecovery;