import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-landing-background selection:bg-blue-100 font-sans">
      {/* Header / Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">D</div>
            <span className="text-xl font-bold text-landing-heading tracking-tight">DebateRoom</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-landing-body hover:text-blue-600 transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-landing-body hover:text-blue-600 transition-colors">Protocols</a>
            <a href="#" className="text-sm font-medium text-landing-body hover:text-blue-600 transition-colors">Community</a>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-landing-heading px-4 py-2 hover:bg-slate-50 rounded-lg transition-all"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn-primary py-2 text-sm"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Next Generation Debate Platform</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] text-landing-heading">
              Where Critical Thinking Meets <span className="text-gradient">Structured Discourse</span>
            </h1>
            <p className="text-xl text-landing-body mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the first digital parliament designed for formal debates. 
              Enforce rules, manage timers, and evaluate insights - all in one secure environment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 rounded-lg font-semibold text-landing-heading border border-landing-card hover:bg-white transition-all w-full sm:w-auto">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-100/30 blur-3xl rounded-full -z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/30 blur-3xl rounded-full -z-0"></div>
      </section>

      {/* Explanation Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">The Rules of Engagement, <span className="text-landing-body font-normal italic">Simplified.</span></h2>
              <p className="text-lg text-landing-body mb-8">
                Traditional debate suffers from noise and interruptions. Our platform uses a server-side state machine to ensure every participant knows exactly when to speak, when to listen, and how to win.
              </p>
              <ul className="space-y-4">
                {[
                  'Server-authoritative timers for every round',
                  'Strict PRO/CON alternation enforcement',
                  'Moderator-led phase transitions',
                  'Immutable voting windows'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-landing-heading font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-premium h-[400px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200">
              <span className="text-slate-400 font-medium italic">[ Interactive Debate UI Preview ]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Debate Section */}
      <section className="py-24 bg-landing-background">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">Why Global Leaders <span className="text-gradient">Debate</span></h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { title: 'Critical Analysis', icon: BookOpen, desc: 'Break down complex issues into logical arguments.' },
              { title: 'Persuasive Speech', icon: MessageSquare, desc: 'Master the art of convincing through structure and tone.' },
              { title: 'Civic Duty', icon: Shield, desc: 'Engage in the democratic process with respect and logic.' },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-landing-body leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">A Four-Step <span className="text-gradient">Discourse.</span></h2>
            <p className="text-landing-body italic">Our platform automates the formal debate workflow so you can focus on your words.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: '01', title: 'Define', desc: 'Moderators set the topic and invite speakers to their corners.' },
              { id: '02', title: 'Prepare', desc: 'Speakers gather evidence before the server unlocks the round.' },
              { id: '03', title: 'Debate', desc: 'Timed opening statements and rebuttals in a strict, fair sequence.' },
              { id: '04', title: 'Evaluate', desc: 'The audience casts votes as the results are calculated in real-time.' },
            ].map((feature, i) => (
              <div key={i} className="card-premium hover:border-blue-200 hover:-translate-y-1 group">
                <span className="text-4xl font-black text-slate-100 group-hover:text-blue-50 transition-colors mb-4 block leading-none">{feature.id}</span>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-landing-body text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Win Your First <span className="text-blue-400">Argument?</span></h2>
              <p className="text-slate-400 text-lg mb-10">Join 3,000+ debaters and moderators sharpening their minds today.</p>
              <button 
                onClick={() => navigate('/register')}
                className="btn-accent px-12 py-4 text-lg"
              >
                Sign Up & Create a Room
              </button>
            </div>
            {/* Background Blob for CTA */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-landing-background border-t border-slate-200 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">D</div>
            <span className="text-xl font-bold text-landing-heading tracking-tight">DebateRoom</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-landing-body hover:text-landing-heading lowercase transition-colors">
            <a href="#">About</a>
            <a href="#">Protocols</a>
            <a href="#">Community</a>
            <a href="#">Support</a>
            <a href="#">Legal</a>
          </div>
          <div className="text-landing-body text-sm">
            (c) {new Date().getFullYear()} No Noise, Just Discourse.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
