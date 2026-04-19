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
    mutationFn: (data: CreateRoomForm) => roomApi.create({ topic: data.topic }),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(`/room/${newRoom.id}`);
    },
  });

  const onSubmit = (data: CreateRoomForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="theme-app min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Navigation Back */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Create New <span className="text-gradient">Arena</span></h1>
          <p className="text-slate-400 italic font-medium">Define the topic and set the rules for your digital parliament.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="card-premium bg-slate-900 border-slate-800 space-y-8">
            {/* Topic Field */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black uppercase tracking-wider text-slate-500">Debate Topic</label>
                <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-black uppercase tracking-widest border border-blue-500/20">Required</span>
              </div>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  {...register('topic', { required: 'Topic is mandatory', minLength: { value: 10, message: 'Make the topic descriptive (min 10 chars)' } })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-white text-lg font-medium placeholder:text-slate-700"
                  placeholder="e.g., Should AI have legal personhood?"
                />
              </div>
              {errors.topic && <p className="text-xs text-red-500 font-medium ml-1">{errors.topic.message}</p>}
            </div>

            {/* Duration Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-500" />
                <label className="text-sm font-black uppercase tracking-wider text-slate-500">Duration Protocols (Seconds)</label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: 'openingDuration' as const, label: 'Opening', icon: ArrowRight },
                  { id: 'rebuttalDuration' as const, label: 'Rebuttal', icon: ArrowRight },
                  { id: 'closingDuration' as const, label: 'Closing', icon: ArrowRight }
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block ml-1">{field.label}</label>
                    <input
                      type="number"
                      {...register(field.id, { required: true, min: 30, max: 600, valueAsNumber: true })}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 outline-none text-white font-mono text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="pt-4 border-t border-slate-800">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Private Room</h4>
                    <p className="text-xs text-slate-500 italic">Only users with the direct link can join.</p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" {...register('isPrivate')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> INITIALIZING ARENA...</span>
            ) : (
              <>
                Create Debate Room <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomPage;
