"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.name.trim(),
          }
        }
      });

      if (error) {
        console.error("Supabase registration error:", error);
        let errorMessage = error.message || "An unexpected error occurred during registration.";
        
        if (error.message.includes("rate limit") || error.code === "over_email_send_rate_limit" || (error as any).status === 429) {
          errorMessage = "Supabase Email Rate Limit reached. Please disable 'Confirm email' in your Supabase Dashboard under Authentication -> Providers -> Email, or try again in a few minutes.";
        } else if (error.message.includes("invalid") || error.code === "email_address_invalid" || error.message.includes("Unable to validate email")) {
          errorMessage = "The email address appears invalid. Please use a standard email provider like Gmail or Outlook.";
        } else if (error.message.includes("User already registered") || error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please log in instead.";
        } else if (error.message.includes("Password should be at least 6 characters")) {
          errorMessage = "The password is too weak. Please choose a password with at least 6 characters.";
        }

        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Attempt to ensure profile row exists immediately
        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            name: values.name.trim(),
            email: values.email.trim(),
            time_balance: 12.00,
            reserved_hours: 0.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
        } catch (profileErr) {
          console.warn("Could not insert initial profile record:", profileErr);
        }

        if (data.session) {
          toast({
            title: "Welcome to SkillSwap!",
            description: "Your account is ready with 12 Time Bank hours.",
          });
          router.push("/dashboard");
          router.refresh();
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email inbox to confirm your account, or disable 'Confirm email' in Supabase to log in immediately.",
            duration: 9000,
          });
          router.push("/login");
        }
      } else {
        toast({
          title: "Registration Incomplete",
          description: "Could not create user account. Please check your Supabase configuration.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Join SkillSwap to start exchanging skills and banking time.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isLoading} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/login">Login here</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
