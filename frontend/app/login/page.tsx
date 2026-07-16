'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/data/store';

const roleCards = [
  { role: 'patient', label: 'Patient', icon: '👤' },
  { role: 'ambulance_driver', label: 'Ambulance Driver', icon: '🚑' },
  { role: 'hospital_staff', label: 'Hospital Staff', icon: '🏥' },
  { role: 'emergency', label: 'Emergency Doctor', icon: '🚨' },
  { role: 'admin', label: 'Administrator', icon: '🔐' },
];

const roleRoutes: Record<string, string> = {
  patient: '/patient',
  ambulance_driver: '/ambulance',
  hospital_staff: '/hospital',
  emergency: '/emergency',
  admin: '/admin',
};

export default function LoginPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAppStore((s) => s.login);

  const slides = [
    {
      title: "Save Lives. Anywhere. Anytime.",
      desc: "Secure access portal for medical professionals, emergency responders, and patients within the sanctuary network."
    },
    {
      title: "Real-time Patient Telemetry",
      desc: "Monitor critical vitals, geolocation, and triage status continuously from the field to the ER."
    },
    {
      title: "Encrypted Data Transmission",
      desc: "Military-grade AES-128 encryption ensuring patient data sovereignty across decentralized mesh networks."
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!selectedCard || !username || !password) return;
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      const user = useAppStore.getState().user;
      const route = user?.role ? roleRoutes[user.role] || '/login' : '/login';
      router.push(route);
    } else {
      setError('Invalid credentials. Check admin panel for users.');
    }
  };

  const handleEmergencyOverride = () => {
    if (loading) return;
    setLoading(true);
    setError('🚨 EMERGENCY OVERRIDE PROTOCOL INITIATED... 🚨');
    
    // Simulate bypass delay for dramatic effect
    setTimeout(async () => {
      setError('OVERRIDE ACCEPTED. LOGGING IN AS EMERGENCY DOCTOR...');
      const success = await login('emergency1', 'er123'); // Hardcoded override credentials
      
      if (success) {
        setTimeout(() => router.push('/emergency'), 500);
      } else {
        setError('OVERRIDE FAILED. BACKEND UNREACHABLE.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-margin-mobile md:p-margin-desktop">
      <div className="flex flex-col md:flex-row w-full max-w-[960px] min-h-[600px] rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(38,22,20,0.5)]">
        
        {/* Left Branding Side */}
        <div className="w-full md:w-5/12 bg-surface-container-lowest p-10 flex flex-col justify-center items-center border-r border-surface-container-highest/20">
          <div className="z-10 relative w-full">
            <div className="flex flex-col items-center justify-center gap-6 mb-8 w-full text-center">
              <img src="/logo.png" alt="Pulse Grid OS Logo" className="w-64 h-64 object-contain drop-shadow-[0_0_20px_rgba(255,180,161,0.6)]" />
              <h1 className="text-on-surface text-headline-lg m-0 leading-none">Pulse Grid OS</h1>
            </div>
            
            <div className="overflow-hidden relative min-h-[120px] w-full">
              <div 
                className="flex transition-transform duration-700 ease-in-out w-full"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {slides.map((slide, idx) => (
                  <div key={idx} className="w-full shrink-0 pr-4">
                    <h2 className="text-on-surface text-body-lg font-semibold mb-2">{slide.title}</h2>
                    <p className="text-on-surface-variant text-body-md leading-relaxed">
                      {slide.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex gap-1.5">
              {slides.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    activeSlide === idx 
                      ? 'w-12 bg-secondary shadow-[0_0_10px_rgba(255,180,161,0.5)]' 
                      : 'w-2 bg-surface-container-highest hover:bg-surface-container-highest/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 bg-surface-container-low p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-headline-md text-on-surface mb-1">Initialize Session</h2>
            <p className="text-on-surface-variant text-body-md">Select your operational role and authenticate.</p>
          </div>

          <div className="mb-6">
            <label className="block text-secondary font-mono text-label-sm uppercase tracking-widest mb-3">
              OPERATIONAL ROLE
            </label>
            
            <div className="flex flex-col gap-3">
              {/* Top Row: Doctor, Paramedic, Staff */}
              <div className="flex gap-3">
                {[
                  { id: 'emergency', title: 'Doctor' },
                  { id: 'ambulance_driver', title: 'Paramedic' },
                  { id: 'hospital_staff', title: 'Staff' }
                ].map(btn => (
                  <button 
                    key={btn.id}
                    onClick={() => setSelectedCard(btn.id)}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded border transition-all ${
                      selectedCard === btn.id 
                        ? 'border-outline-variant bg-surface-container-highest text-secondary shadow-[0_0_15px_rgba(255,180,161,0.05)]' 
                        : 'border-surface-container-highest bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <div className={`material-symbols-outlined mb-1 text-[18px] ${selectedCard === btn.id ? 'text-secondary' : 'text-on-surface-variant'}`}>circle</div>
                    <div className="font-mono text-[10px] tracking-wider">{btn.title}</div>
                  </button>
                ))}
              </div>

              {/* Bottom Row: Admin, Patient */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedCard('admin')}
                  className={`w-[30%] flex flex-col items-center justify-center p-3 rounded border transition-all ${
                    selectedCard === 'admin' 
                      ? 'border-outline-variant bg-surface-container-highest text-secondary shadow-[0_0_15px_rgba(255,180,161,0.05)]' 
                      : 'border-surface-container-highest bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <div className={`material-symbols-outlined mb-1 text-[18px] ${selectedCard === 'admin' ? 'text-secondary' : 'text-on-surface-variant'}`}>admin_panel_settings</div>
                  <div className="font-mono text-[10px] tracking-wider">Admin</div>
                </button>
                <button 
                  onClick={() => setSelectedCard('patient')}
                  className={`w-[70%] flex flex-row items-center justify-center gap-2 p-3 rounded border transition-all ${
                    selectedCard === 'patient' 
                      ? 'border-outline-variant bg-surface-container-highest text-secondary shadow-[0_0_15px_rgba(255,180,161,0.05)]' 
                      : 'border-surface-container-highest bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <div className={`material-symbols-outlined text-[18px] ${selectedCard === 'patient' ? 'text-secondary' : 'text-on-surface-variant'}`}>person</div>
                  <div className="font-mono text-[10px] tracking-wider">Patient Portal Access</div>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-secondary font-mono text-label-sm mb-2">Grid ID Number</label>
              <input
                type="text"
                placeholder="PG-000-000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-container-lowest border-b border-surface-container-highest px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-outline-variant focus:bg-surface-container transition-colors rounded-t-sm"
              />
            </div>

            <div>
              <label className="block text-secondary font-mono text-label-sm mb-2">Secure Passkey</label>
              <input
                type="password"
                placeholder="........"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border-b border-surface-container-highest px-4 py-3 text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40 focus:outline-none focus:border-outline-variant focus:bg-surface-container transition-colors rounded-t-sm"
              />
            </div>
            
            {error && <p className="text-error text-label-sm animate-fade-in font-mono">{error}</p>}
            
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleLogin}
                disabled={loading || !selectedCard || !username || !password}
                className={`w-full bg-primary text-on-primary font-semibold py-3 rounded flex items-center justify-center gap-2 transition-all ${
                  loading ? 'opacity-70 cursor-wait' : 'hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(255,180,161,0.2)] active:scale-[0.99]'
                } ${(!selectedCard || !username || !password) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <span className="text-label-md">{loading ? 'Initializing...' : 'Initialize Session'}</span>
                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>

              <button 
                onClick={handleEmergencyOverride}
                disabled={loading}
                className={`w-full border border-outline-variant text-secondary font-mono text-[12px] py-3 rounded transition-colors active:scale-[0.99] ${loading ? 'opacity-50 cursor-wait' : 'hover:bg-surface-container-highest hover:border-secondary'}`}
              >
                Request Emergency Override
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center text-on-surface-variant font-mono text-[10px] tracking-widest">
            <div className="flex items-center gap-1.5 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              <span>GRID STATUS: NOMINAL</span>
            </div>
            <span>v2.4.1</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}