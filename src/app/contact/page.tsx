"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Mail, MessageSquare, Send, CheckCircle2, Bot, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold mb-3">
            <MessageSquare className="w-4 h-4" />
            <span>24/7 SUPPORT & ASSISTANCE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Have questions about your AI Bot contracts, wallet transfers, or options settlements? Send us a message!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form */}
          <div className="md:col-span-7 glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl font-bold text-white">Send Us a Message</h2>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Received!</h3>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-slate-900 text-xs font-bold text-slate-300 rounded-xl border border-slate-800"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Deposit Inquiry / Bot Yield Question"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-sky-500"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Info Card */}
          <div className="md:col-span-5 glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Lukas Financial Support</h3>
              <p className="text-xs text-[#848e9c] leading-relaxed">
                Our support engineers monitor non-custodial transactions, bot contracts, and options settlements 24 hours a day, 7 days a week.
              </p>

              <div className="space-y-3 pt-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-4 h-4 text-[#f0b90b]" />
                  <span>support@lukasfinancial.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-[#0ecb81]" />
                  <span>100% Non-Custodial Encrypted Channel</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0b0e11] rounded border border-[#2b313a] text-[11px] text-[#848e9c]">
              Response SLA: Typical response time is under 1 hour for active traders.
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2b313a] py-6 text-center text-xs text-[#848e9c] font-mono">
        © {new Date().getFullYear()} Lukas Financial Ltd. All rights reserved.
      </footer>
    </div>
  );
}
