import React from 'react';
import { useNavigate } from 'react-router-dom';


const HERO_ILLU = "/images/hero.png";
const CLOUD_ILLU = "/images/cloud.png";
const GLOBE_ILLU = "/images/globe.png";
const STUDENT_ILLU = "/images/student.png";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased overflow-x-hidden selection:bg-blue-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl">D</div>
            <span className="text-xl font-bold tracking-tight text-slate-950">Arena</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all rounded-lg px-4 py-2"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-32 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] text-slate-950">
              A place <br />
              to debate <br />
              online
            </h1>
            <div className="flex items-center justify-center gap-6 text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-slate-400">
              <span>practice</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span>compete</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
              <span>improve</span>
            </div>
          </div>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed italic">
            Empowering individuals through structured discourse and critical reasoning in a dedicated digital environment.
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase italic">Try debate club today!</p>
            <button 
              onClick={() => navigate('/register')}
              className="px-12 py-4 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <h2 className="text-5xl font-black text-slate-950 tracking-tight leading-tight">
                  This House <br /> believes...
                </h2>
                <div className="space-y-6 text-slate-500 font-medium text-lg leading-relaxed">
                  <p className="font-bold text-slate-400 italic">British Parliamentary Discourse</p>
                  <p>It should be easy to perform formal debates online without the noise of unstructured conferencing.</p>
                  <p>Unlike general video conferencing applications, Arena is specifically designed to support the debate process with authoritative rule enforcement.</p>
                  <p>We automatically manage each phase of the debate — gather, prepare, debate and evaluate — so you don't have to worry about it.</p>
                </div>
             </div>
             <div className="flex justify-center p-8 bg-slate-50 rounded-[3rem]">
                <img src={CLOUD_ILLU} className="w-full max-w-sm opacity-80" alt="Cloud Illustration" />
             </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-16">
          <h2 className="text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Why <br /> debate online?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-xl">
                 <img src={GLOBE_ILLU} className="w-20 h-20 opacity-80" alt="Globe" />
              </div>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                 Practice debating with anyone across the globe, whether from home or on the go.
              </p>
            </div>
            
            <div className="flex items-center gap-8 md:flex-row-reverse">
              <div className="w-32 h-32 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-xl">
                 <img src={HERO_ILLU} className="w-20 h-20 opacity-60" alt="Analysis" />
              </div>
              <p className="text-slate-500 font-medium text-lg leading-relaxed text-right">
                We make it simple to track your performance and analyze data to identify opportunities for improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y border-slate-50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          {[
            { title: "Define the Motion", desc: "Create a debate session by defining the motion and inviting your partners with a shareable link. Assign the roles easily and start the preparation once everyone has joined the lobby." },
            { title: "Prepare", desc: "We create the preparation rooms for each team and automatically assign team members. Judges can join any team room to provide help upon request." },
            { title: "Debate", desc: "Focus on the speeches — no more juggling with video tiles. We handle everything to make sure the debate process runs smoothly." },
            { title: "Evaluate", desc: "Receive feedback from judges and teammates. Track your progress with historical data and detailed statistics." }
          ].map((item, i) => (
            <div key={i} className="bg-slate-100 hover:bg-slate-200 transition-all rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 group">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                  <h3 className="text-3xl font-black text-slate-950 tracking-tighter">{item.title}</h3>
                </div>
                <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">{item.desc}</p>
              </div>
              <div className="w-full md:w-64 h-40 bg-white/50 rounded-[2rem] shadow-inner flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all">
                 <img src={CLOUD_ILLU} className="w-full opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <h2 className="text-4xl font-light text-slate-950">Would you like to know more?</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-16">
            <div className="w-64">
              <img src={STUDENT_ILLU} alt="Curiosity" className="w-full opacity-80" />
            </div>
            <div className="text-left space-y-10">
              <p className="text-xl text-slate-500 font-medium italic">
                You can read more about our product features <span className="text-blue-600 font-bold border-b-2 border-blue-600 cursor-pointer">here</span>.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="px-10 py-5 bg-blue-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-blue-600/40 hover:scale-105 transition-all"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl">D</div>
              <span className="text-2xl font-black tracking-tighter text-white">Arena</span>
            </div>
          </div>

          {[
            { title: 'Company', links: ['Product', 'Contact'] },
            { title: 'Resources', links: ['Docs', 'Motion Ideas', 'History of debate'] },
            { title: 'Privacy', links: ['Privacy Policy', 'Cookie Policy', 'Terms of Service', 'Acceptable Use Policy', 'Online Preferences', 'Data Access Request'] }
          ].map((col) => (
            <div key={col.title} className="space-y-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
