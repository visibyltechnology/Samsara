import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container py-20 flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-sm">
        <h1 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Sign in to your account to continue</p>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                required
                className="w-full h-11 pl-10 pr-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                className="w-full h-11 pl-10 pr-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium mt-6 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
