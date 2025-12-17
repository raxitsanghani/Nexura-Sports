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
import { zodResolver } from "@hookform/resolvers/zod";
import Images from "@/assets";
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

const Signup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    setLoading(true);
    form.reset();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: user.name });
      await createDoc(newUser, user.name);

      toast({ description: "User created!" });
      navigate("/");
    } catch (error) {
      const errorMessage =
        (error as Error).message || "An unknown error occurred";
      toast({ variant: "destructive", title: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  async function createDoc(user: any, name?: string) {
    if (!user) return;
    setLoading(true);

    const userRef = doc(db, "users", user.uid);
    const userData = await getDoc(userRef);
    if (!userData.exists()) {
      try {
        await setDoc(userRef, {
          name: name || user.displayName || "",
          email: user.email,
          photoUrl: user.photoURL || "",
          createdAt: new Date(),
        });
      } catch (error) {
        const errorMessage =
          (error as Error).message || "An unknown error occurred";
        toast({ variant: "destructive", title: errorMessage });
      }
    }
    setLoading(false);
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
        console.log(error);
        const errorMessage =
          (error as Error).message || "An unknown error occurred";
        toast({ variant: "destructive", title: errorMessage });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Form {...form}>
      <div className="flex flex-1 h-screen justify-center items-center flex-col py-10">
        <div className="sm:w-420 md:w-[24rem] flex-center flex-col">
          <img src={Images.LOGO} alt="logo" className="w-8" />
          <h2 className="text-2xl text-white">FinanceInsight</h2>

          <h2 className="h3-bold md:h2-bold pt-5 sm:pt-6">
            Create a new account
          </h2>

          <form
            onSubmit={form.handleSubmit(handleSignup)}
            className="flex flex-col gap-2 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={loading}
              type="submit"
              className="shad-button_primary mt-3"
            >
              {loading ? (
                <ReactLoading
                  type={"bars"}
                  height={30}
                  width={30}
                  color="black"
                />
              ) : (
                "Sign up"
              )}
            </Button>
            <h1 className="text-center">or</h1>
            <Button
              disabled={loading}
              onClick={googleAuth}
              type="button"
              className="shad-button_primary mt-3"
            >
              <FcGoogle size={"1.5rem"} className="mr-1" /> Sign Up With Google
            </Button>
            <p className="text-small-regular text-light-2 text-center mt-2">
              Already have an account?
              <Link
                to="/login"
                className="text-primary-500 text-small-semibold ml-1"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Form>
  );
};

export default Signup;
