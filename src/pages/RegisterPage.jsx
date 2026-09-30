import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Setup profile and whitelist
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email: email,
        updated_at: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-20 flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-sm text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Registration Successful!</h1>
          <p className="text-muted-foreground mb-6">Your account has been created successfully. Redirecting to login...</p>
          <Link to="/login" className="text-primary hover:underline font-medium">Click here if not redirected</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-20 flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-sm">
        <h1 className="text-3xl font-display font-bold text-center mb-2">Create Account</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Join Samsarachoice today</p>

        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                className="w-full h-11 pl-10 pr-4 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
          
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
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
