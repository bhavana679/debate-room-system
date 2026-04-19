import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api/auth';
import { type RegisterDTO, UserRole } from '../types/auth';
import { Mail, Lock, Loader2, ArrowRight, UserCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterDTO>({
    defaultValues: { role: UserRole.AUDIENCE }
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: RegisterDTO) => {
    mutation.mutate(data);
  };

  return (
    <div className="theme-app min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform">D</div>
            <span className="text-3xl font-black text-slate-950 tracking-tighter">Arena.</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-950 mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 font-medium italic">Join the next generation of digital parliament.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-premium bg-white border-slate-200 shadow-2xl shadow-slate-200/50 p-10 space-y-8 rounded-[2.5rem]">
          {mutation.isError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest text-center">
              Registration Failed: Identity Conflict
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Initial Role</label>
              <div className="relative group">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <select
                  {...register('role')}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all appearance-none text-slate-950 font-bold text-sm"
                >
                  <option value={UserRole.AUDIENCE}>Audience</option>
                  <option value={UserRole.MODERATOR}>Moderator</option>
                  <option value={UserRole.SPEAKER}>Speaker</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Passcode</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6' } })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-slate-950 font-bold"
                  placeholder="********"
                  type="password"
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <input type="checkbox" className="mt-1 w-4 h-4 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" required />
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
              I authorize the <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span> and pledge adherence to the Code of Conduct.
            </p>
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
                Confirm Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest pt-2">
            Already Initiated? <Link to="/login" className="text-blue-600 hover:underline">Sign In Instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
