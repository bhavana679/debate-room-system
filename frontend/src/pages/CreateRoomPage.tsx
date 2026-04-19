import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../services/api/roomApi';
import { MessageSquare, ArrowLeft, ArrowRight, ShieldCheck, Timer } from 'lucide-react';

interface CreateRoomForm {
  topic: string;
  openingDuration: number;
  rebuttalDuration: number;
  closingDuration: number;
  isPrivate: boolean;
}

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateRoomForm>({
    defaultValues: {
      openingDuration: 180,
      rebuttalDuration: 120,
      closingDuration: 60,
      isPrivate: false
    }
  });

  const mutation = useMutation({
    mutationFn: (data: CreateRoomForm) => roomApi.create({ 
      topic: data.topic,
      openingDuration: data.openingDuration,
      rebuttalDuration: data.rebuttalDuration,
      closingDuration: data.closingDuration
    }),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(`/room/${newRoom.id}`);
    },
  });

  const onSubmit = (data: CreateRoomForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="theme-app min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group font-bold text-sm tracking-tight"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
 
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold text-slate-950 mb-2">Create New <span className="text-blue-600">Arena</span></h1>
          <p className="text-slate-500 italic font-medium">Define the topic and set the rules for your digital parliament.</p>
        </header>
 
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="card-premium bg-white border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black uppercase tracking-wider text-slate-400">Debate Topic</label>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border border-blue-100">Required</span>
              </div>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  {...register('topic', { required: 'Topic is mandatory', minLength: { value: 10, message: 'Make the topic descriptive (min 10 chars)' } })}
                  className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-950 text-lg font-bold placeholder:text-slate-400 shadow-sm"
                  placeholder="e.g., Should AI have legal personhood?"
                />
              </div>
              {errors.topic && <p className="text-xs text-red-500 font-bold ml-1">{errors.topic.message}</p>}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-black uppercase tracking-wider text-slate-400">Duration Protocols (Seconds)</label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: 'openingDuration' as const, label: 'Opening', icon: ArrowRight },
                  { id: 'rebuttalDuration' as const, label: 'Rebuttal', icon: ArrowRight },
                  { id: 'closingDuration' as const, label: 'Closing', icon: ArrowRight }
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">{field.label}</label>
                    <input
                      type="number"
                      {...register(field.id, { required: true, min: 30, max: 600, valueAsNumber: true })}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-slate-950 font-black text-center shadow-sm transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors border border-slate-100">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Private Arena</h4>
                    <p className="text-xs text-slate-500 italic font-medium">Only users with a direct link can join.</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('isPrivate')} className="sr-only peer" />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl shadow-blue-600/30"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> INITIALIZING ARENA...</span>
            ) : (
              <>
                Launch Debate Arena <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomPage;
