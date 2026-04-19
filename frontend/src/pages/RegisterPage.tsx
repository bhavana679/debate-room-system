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
    <div className="min-h-screen bg-landing-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">D</div>
            <span className="text-2xl font-bold text-landing-heading tracking-tight">DebateRoom</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-landing-heading mb-2">Create Account</h1>
          <p className="text-landing-body italic">Join the next generation of digital parliament.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card-premium bg-white space-y-6">
          {mutation.isError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              Registration failed. This email might be taken.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-landing-heading block ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="name@company.com"
                type="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-landing-heading block ml-1">Initial Role</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  {...register('role')}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value={UserRole.AUDIENCE}>Audience</option>
                  <option value={UserRole.MODERATOR}>Moderator</option>
                  <option value={UserRole.SPEAKER}>Speaker</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-landing-heading block ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6' } })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="********"
                  type="password"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input type="checkbox" className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" required />
            <p className="text-xs text-landing-body leading-relaxed">
              I agree to the <span className="text-blue-600 font-bold hover:underline cursor-pointer">Terms of Service</span> and acknowledge the Code of Conduct.
            </p>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-landing-body font-medium">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in instead</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
