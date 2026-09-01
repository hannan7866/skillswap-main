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
import { LogIn, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        let errorMessage = "Invalid email or password. Please try again.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please verify your credentials or register a new account.";
        } else if (error.message.includes("Email not confirmed") || (error as any).code === "email_not_confirmed") {
          errorMessage = "Your email is not confirmed yet. Please check your inbox for the confirmation email, or disable 'Confirm email' in your Supabase Dashboard.";
        } else if (error.message.includes("rate limit") || (error as any).status === 429) {
          errorMessage = "Too many attempts. Please wait a few moments before trying again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        toast({
          title: "Welcome Back!",
          description: "Signing in to your SkillSwap dashboard...",
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your SkillSwap account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link href="/register">Register here</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
