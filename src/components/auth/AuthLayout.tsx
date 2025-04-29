
import React from 'react';
import Footer from '../layout/Footer';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">B</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
          </div>

          <div className="bg-card rounded-lg border border-border/50 shadow-sm p-6 animate-fade-in">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthLayout;
