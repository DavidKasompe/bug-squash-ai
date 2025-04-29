
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/auth/AuthLayout";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormValues) => {
    // This will be integrated with your Django backend
    console.log("Sign in data:", data);
    toast({
      title: "Sign In Attempt",
      description: "Backend integration pending",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout title="Welcome back to BugSquash.AI">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <FormControl>
                    <Input 
                      placeholder="Email address" 
                      className="pl-10" 
                      {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      className="pl-10" 
                      {...field} 
                    />
                  </FormControl>
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            Sign In
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link to="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
