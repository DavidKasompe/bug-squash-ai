
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/auth/AuthLayout";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignUpFormValues) => {
    // This will be integrated with your Django backend
    console.log("Sign up data:", data);
    toast({
      title: "Sign Up Attempt",
      description: "Backend integration pending",
    });
  };

  return (
    <AuthLayout title="Join BugSquash.AI">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <FormControl>
                    <Input 
                      placeholder="Full name" 
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
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm password" 
                      className="pl-10" 
                      {...field} 
                    />
                  </FormControl>
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            Create Account
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link to="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
