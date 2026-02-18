import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { db, doc, setDoc, auth, provider } from "@/Database/firebase";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";

import ReactLoading from "react-loading";
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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getDoc } from "firebase/firestore";
const SignupValidation = z
  .object({
    name: z.string().min(1, { message: "Full name is required" }),
    phone: z.string().min(10, { message: "Invalid phone number" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm password must be at least 6 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

import { motion } from "framer-motion";

const Signup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: user.name });
      await createDoc(newUser, user.name, user.phone);

      toast({ description: "User created!" });
      form.reset();
      navigate("/");
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMessage = (error as Error).message || "An unknown error occurred";
      toast({ variant: "destructive", title: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  async function createDoc(user: any, name?: string, phone?: string) {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    try {
      const userData = await getDoc(userRef);
      if (!userData.exists()) {
        await setDoc(userRef, {
          name: name || user.displayName || "",
          email: user.email,
          phone: phone || "",
          photoUrl: user.photoURL || "",
          createdAt: new Date(),
          isBlocked: false,
        });
      }
    } catch (error) {
      console.error("Create Doc Error", error);
    }
  }

  function googleAuth() {
    setLoading(true);
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await createDoc(user);
        toast({ description: "Login Success!" });
        navigate("/");
      })
      .catch((error) => {
        console.log("Google Auth Error:", error);
        let errorMessage = (error as Error).message || "An unknown error occurred";

        if (errorMessage.includes("auth/unauthorized-domain")) {
          errorMessage = "Domain not authorized. Add 'nexura-sports.vercel.app' to Firebase Console > Authentication > Settings.";
        } else if (errorMessage.includes("auth/popup-closed-by-user")) {
          errorMessage = "Sign-in popup was closed before completion.";
        } else if (errorMessage.includes("auth/popup-blocked")) {
          errorMessage = "Sign-in popup was blocked by the browser. Please allow popups for this site.";
        }

        toast({ variant: "destructive", title: errorMessage });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="relative h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a]">
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

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[480px] bg-white/[0.07] backdrop-blur-xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/20 p-5 md:p-7 max-h-[98vh] flex flex-col justify-center"
      >
        <div className="flex flex-col items-center mb-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.05 }}
            className="mb-2 relative"
          >
            <video
              src="/images/Image_Animation copy.webm"
              autoPlay
              muted
              playsInline
              className="w-44 h-44 md:w-52 md:h-52 object-contain scale-[1.3] transform-gpu"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl font-premium text-white tracking-tight mb-1"
          >
            Join Nexura
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/60 font-medium text-center text-[10px] uppercase tracking-[0.3em]"
          >
            The Elite Athletic Club
          </motion.p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSignup)}
            className="space-y-1 md:space-y-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Full Name</FormLabel>
                    <FormControl>
                      <motion.div whileFocus={{ scale: 1.01 }}>
                        <Input
                          placeholder="John Doe"
                          className="h-11 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl transition-all font-semibold text-white placeholder:text-white/20"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Phone</FormLabel>
                    <FormControl>
                      <motion.div whileFocus={{ scale: 1.01 }}>
                        <Input
                          placeholder="+1 (555) 000-0000"
                          className="h-11 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl transition-all font-semibold text-white placeholder:text-white/20"
                          {...field}
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                  </FormItem>
                )}
              />
            </div>

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
                        className="h-11 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl transition-all font-semibold text-white placeholder:text-white/20"
                        {...field}
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <motion.div whileFocus={{ scale: 1.01 }}>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-11 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl pr-14 transition-all font-semibold text-white placeholder:text-white/20"
                            {...field}
                          />
                        </motion.div>
                        <button
                          type="button"
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] ml-2">Confirm</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <motion.div whileFocus={{ scale: 1.01 }}>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-11 bg-white/5 border-white/10 focus:border-white/40 focus:bg-white/10 focus:ring-0 rounded-2xl pr-14 transition-all font-semibold text-white placeholder:text-white/20"
                            {...field}
                          />
                        </motion.div>
                        <button
                          type="button"
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-2" />
                  </FormItem>
                )}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="pt-2"
            >
              <Button
                disabled={loading}
                type="submit"
                className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-lg transition-all shadow-sm active:scale-[0.98] uppercase tracking-widest backdrop-blur-sm"
              >
                {loading ? (
                  <ReactLoading type="bars" height={28} width={28} color="#fff" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </motion.div>

            <div className="relative my-2 text-center flex items-center justify-center gap-4">
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
                  className="w-full h-12 border border-white/10 bg-white/5 hover:bg-transparent rounded-2xl flex items-center justify-center gap-3 font-bold text-white transition-all shadow-sm text-sm"
                >
                  <FcGoogle size={20} />
                  <span className="uppercase tracking-[0.2em] text-[10px]">Continue with Google</span>
                </Button>
              </motion.div>
            </div>

            <p className="text-center text-[10px] text-white/40 pt-2 font-bold uppercase tracking-widest">
              Already a Member?{" "}
              <Link
                to="/login"
                className="text-white font-black hover:text-white/80 transition-all border-b border-white/20 hover:border-white pb-1"
              >
                Login
              </Link>
            </p>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default Signup;
