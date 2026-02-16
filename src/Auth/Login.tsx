import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import Images from "@/assets";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, doc, provider, setDoc } from "@/Database/firebase";
import ReactLoading from "react-loading";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getDoc } from "firebase/firestore";

const LoginValidation = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

import { motion } from "framer-motion";

// Validation schema

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginValidation>>({
    resolver: zodResolver(LoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (user: z.infer<typeof LoginValidation>) => {
    setLoading(true);
    if (user.email === "raxitsanghani21@gmail.com" && user.password === "raxit2112") {
      localStorage.setItem("authToken", "admin-token");
      toast({ description: "Admin Login Success!" });
      setLoading(false);
      window.location.href = "/admin";
      return;
    }

    signInWithEmailAndPassword(auth, user.email, user.password)
      .then(async (userCredential) => {
        const userRef = doc(db, "users", userCredential.user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().isBlocked) {
          await auth.signOut();
          throw new Error("Your account has been blocked by the administrator.");
        }

        toast({ description: "Login Success!" });
        form.reset();
        setLoading(false);
        navigate("/");
      })
      .catch((error) => {
        const errorMessage = error.message;
        if (errorMessage === "Your account has been blocked by the administrator.") {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Your account has been blocked by the administrator.",
            duration: 5000
          });
        } else {
          toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
        }
        setLoading(false);
      });
  };

  async function createDoc(user: any) {
    if (!user) return;
    setLoading(true);

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);
    if (!userData.exists()) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName ? user.displayName : name,
          email: user.email,
          photoUrl: user.photoUrl ? user.photoUrl : "",
          createdAt: new Date(),
          isBlocked: false,
        });
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        toast({ variant: "destructive", title: error });
      }
    } else {
      if (userData.data().isBlocked) {
        await auth.signOut();
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Your account has been blocked by the administrator.",
          duration: 5000
        });
        setLoading(false);
        return false;
      }
      setLoading(false);
    }
  }

  function googleAuth() {
    setLoading(true);
    try {
      signInWithPopup(auth, provider)
        .then(async (result) => {
          const user = result.user;
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().isBlocked) {
            await auth.signOut();
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "Your account has been blocked by the administrator.",
              duration: 5000
            });
            setLoading(false);
            return;
          }

          createDoc(user);
          toast({ description: "Login Success!" });
          navigate("/");
          setLoading(false);
        })
        .catch((error) => {
          const errorMessage = error.message;
          toast({ variant: "destructive", title: errorMessage });
          setLoading(false);
        });
    } catch (error: any) {
      setLoading(false);
      toast({ variant: "destructive", title: error.message });
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#0a0a0a]">
      {/* Background Layer with soft blur */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=2071')`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[460px] bg-white/10 backdrop-blur-md rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 p-12"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            className="p-5 rounded-[2rem] bg-white shadow-2xl mb-8"
          >
            <img
              src={Images.LOGO}
              alt="Nexura Logo"
              className="w-20 h-20 object-contain brightness-110"
            />
          </motion.div>
          <h1 className="text-5xl font-premium text-white tracking-tight mb-2 text-center">Nexura</h1>
          <p className="text-white/60 font-medium text-center text-sm uppercase tracking-[0.3em]">Elite Performance</p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Email Address</FormLabel>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.01 }}>
                      <Input
                        type="email"
                        placeholder="john@nexura.com"
                        className="h-14 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl transition-all font-semibold text-white placeholder:text-white/20"
                        {...field}
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Secure Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <motion.div whileFocus={{ scale: 1.01 }}>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-14 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl pr-14 transition-all font-semibold text-white placeholder:text-white/20"
                          {...field}
                        />
                      </motion.div>
                      <button
                        type="button"
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={22} /> : <FaEye size={22} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                </FormItem>
              )}
            />

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-4"
            >
              <Button
                disabled={loading}
                type="submit"
                className="w-full h-16 bg-white hover:bg-white/90 text-black rounded-2xl font-black text-lg transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] active:shadow-md uppercase tracking-widest"
              >
                {loading ? (
                  <ReactLoading type="bars" height={28} width={28} color="#000" />
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>

            <div className="relative my-8 text-center flex items-center justify-center gap-4">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">Auth Service</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  disabled={loading}
                  type="button"
                  onClick={googleAuth}
                  variant="outline"
                  className="w-full h-14 border border-white/10 bg-white/5 hover:bg-transparent rounded-2xl flex items-center justify-center gap-3 font-bold text-white transition-all shadow-sm"
                >
                  <FcGoogle size={24} />
                  <span className="uppercase tracking-[0.2em] text-xs">Continue with Google</span>
                </Button>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 text-white/40 hover:text-white hover:bg-transparent transition-colors font-bold text-[10px] uppercase tracking-[0.2em]"
                onClick={() => navigate("/checkout", { state: { isGuest: true } })}
              >
                Guest Checkout
              </Button>
            </motion.div>

            <p className="text-center text-xs text-white/40 pt-4 font-bold uppercase tracking-widest">
              No account?{" "}
              <Link
                to="/signup"
                className="text-white font-black hover:text-white/80 transition-all border-b border-white/20 hover:border-white pb-1 underline-offset-4"
              >
                Join Nexura
              </Link>
            </p>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default Login;
