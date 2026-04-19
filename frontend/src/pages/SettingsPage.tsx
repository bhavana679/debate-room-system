import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { LayoutDashboard, MessageSquare, Trophy, Settings, LogOut, Menu, X, User, Bell, Shield, Palette, Save, Camera, Check, Loader2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const addNotification = useAppStore(state => state.addNotification);
  const [isSaving, setIsSaving] = React.useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    addNotification('Identity records synchronized successfully.', 'success');
    setIsSaving(false);
  };

  return (
    <div className="theme-app min-h-screen bg-slate-50 flex transition-colors duration-500 overflow-hidden">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-950">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-500 lg:translate-x-0 lg:static lg:inset-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center text-white font-black text-2xl">D</div>
            <span className="text-2xl font-black text-slate-950 tracking-tighter">Arena.</span>
          </div>

          <nav className="flex-1 space-y-3">
             {[
               { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
               { icon: MessageSquare, label: 'Debates', path: '/debates' },
               { icon: Trophy, label: 'Rankings', path: '/rankings' },
               { icon: Settings, label: 'Settings', path: '/settings', active: true },
             ].map((item, i) => (
               <button
                 key={i}
                 onClick={() => navigate(item.path)}
                 className={cn(
                   "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm",
                   item.active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 {item.label}
               </button>
             ))}
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto text-sm group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      <main className={cn(
        "flex-1 p-6 lg:p-12 overflow-y-auto transition-all duration-500",
        isSidebarOpen && "blur-sm lg:blur-none opacity-50 lg:opacity-100"
      )}>
        <header className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 mb-2 leading-tight">System Settings</h1>
          <p className="text-slate-500 font-medium italic tracking-wide">Customize your interface and identity.</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1 space-y-2">
            {[
              { label: 'Profile', icon: User, active: true },
              { label: 'Security', icon: Shield },
              { icon: Bell, label: 'Notifications' },
              { icon: Palette, label: 'Appearance' },
            ].map((tab, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm",
                  tab.active ? "bg-white text-blue-600 border border-blue-100" : "text-slate-400 hover:text-slate-950 hover:bg-white"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-8 max-w-2xl">
            <div className="card-premium bg-white border-slate-200 shadow-xl shadow-slate-200/50 space-y-10">
              <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl font-black text-slate-950 border-2 border-slate-100 group-hover:border-blue-600 transition-all overflow-hidden relative shadow-inner">
                    {currentUser.email?.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-950 mb-1">Avatar & Identity</h3>
                  <p className="text-slate-500 text-sm font-medium">Update your public representation in the Arena.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Screen Name</label>
                  <input 
                    type="text" 
                    defaultValue={currentUser.email?.split('@')[0]}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-950 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={currentUser.email}
                    disabled
                    className="w-full bg-slate-100 border border-slate-100 rounded-2xl py-4 px-6 text-slate-400 text-sm font-bold cursor-not-allowed opacity-60"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bio / Philosophical Stance</label>
                  <textarea 
                    rows={4}
                    placeholder="Briefly describe your approach to logic and discourse..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-950 text-sm font-bold focus:outline-none focus:border-blue-600 transition-all resize-none shadow-inner"
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary py-4 px-10 flex items-center gap-3 shadow-xl shadow-blue-600/30 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Synchronizing...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="card-premium border-red-100 bg-red-50/30 p-8 space-y-4">
              <div>
                <h3 className="text-lg font-black text-red-600 uppercase tracking-tight">Danger Zone</h3>
                <p className="text-slate-500 text-sm font-medium">Deleting your account is permanent and will wipe your ranking history.</p>
              </div>
              <button className="text-red-600 font-black text-[10px] uppercase tracking-widest bg-white border border-red-200 px-6 py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
