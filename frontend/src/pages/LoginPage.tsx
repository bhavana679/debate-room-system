import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api/auth';
import type { LoginDTO } from '../types/auth';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDTO>();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: LoginDTO) => {
    mutation.mutate(data);
  };

  return (
    <div className="theme-app min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform">D</div>
            <span className="text-3xl font-black text-slate-950 tracking-tighter">Arena.</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-950 mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium italic">Enter the halls of digital parliament.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-premium bg-white border-slate-200 shadow-2xl shadow-slate-200/50 p-10 space-y-8 rounded-[2.5rem]">
          {mutation.isError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest text-center">
              Authorization Failed: Invalid Credentials
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Universal Identity (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-slate-950 font-bold"
                placeholder="name@provider.com"
                type="email"
              />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Passcode</label>
              <a href="#" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">Forgot?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-slate-950 font-bold"
                placeholder="********"
                type="password"
              />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-5 flex items-center justify-center gap-3 group disabled:opacity-70 shadow-2xl shadow-blue-600/30 font-black uppercase tracking-[0.2em] text-xs"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Initiate Session <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest pt-2">
            New Initiate? <Link to="/register" className="text-blue-600 hover:underline">Register Identity</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
