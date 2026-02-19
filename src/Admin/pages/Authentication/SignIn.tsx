import AuthContext from "@/Admin/context/authContext";
import React, { useContext, useState } from "react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "raxitsanghani21@gmail.com" && password.trim() === "raxit2112") {
      login("login-token");
    } else {
      alert("Unauthorized Access Detected: Invalid Credentials");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Visual Branding */}
        <div className="hidden md:flex md:w-1/2 bg-slate-900 p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-green-500/20">N</div>
              <span className="text-white font-black uppercase tracking-[0.3em] text-sm">Nexura Control</span>
            </div>
            <h1 className="text-5xl font-black text-white leading-tight tracking-tighter">
              Orchestrating <br />
              <span className="text-slate-500">Global Excellence.</span>
            </h1>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-all"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Environment Active</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                "Precision in administration is the blueprint for operational dominance."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Authority Verification</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Restricted Access Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Credential ID</label>
              <div className="relative group">
                <input
                  type="email"
                  placeholder="admin@nexura.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  📧
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Access Key</label>
              <div className="relative group">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  🔒
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-slate-200 hover:bg-black hover:-translate-y-1 active:scale-95 transition-all"
            >
              Initialize Command
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-300">
            <span>System v4.2.0</span>
            <div className="flex gap-4">
              <span className="hover:text-slate-400 cursor-help">Support</span>
              <span className="hover:text-slate-400 cursor-help">Protocols</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
