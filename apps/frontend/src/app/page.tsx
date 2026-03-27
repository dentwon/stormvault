import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), { ssr: false })

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">StormVault</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
              <a href="#about" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">About</a>
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
              <Link href="/signup" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></span>
            Now in Beta — First 100 users get 3 months free
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Find More Roofing Jobs with{' '}
            <span className="text-gradient">Storm Intelligence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            StormVault combines storm damage data, property insights, and lead management 
            into one powerful platform. Stop wasting hours researching leads.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent text-base w-full sm:w-auto">
              Start Free Trial
            </Link>
            <Link href="/demo" className="flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full sm:w-auto py-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Hero Visual - Real Map */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-card">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700/50">
              <div className="w-3 h-3 bg-red-500/80 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500/80 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500/80 rounded-full"></div>
              <div className="flex-1 text-center text-sm text-slate-500">app.stormvault.com</div>
            </div>
            
            {/* Real Map - Road map fading into satellite with overlay */}
            <div className="relative h-[500px] overflow-hidden rounded-b-xl">
              {/* Road map - darkened, zoomed in 30%, and at bottom layer */}
              <img 
                src="/maps/road-map-new.webp" 
                alt="Road Map" 
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 1, filter: 'brightness(0.5) contrast(1.1)', transform: 'scale(1.3)', transformOrigin: 'center' }}
              />
              
              {/* Dark gradient overlay on satellite side - darker for lightning visibility */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  zIndex: 2,
                  background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%)',
                  transform: 'scale(1.3)',
                  transformOrigin: 'center'
                }}
              />
              
              {/* Satellite - on top, masked to fade from left (road map) to right (satellite) */}
              <img 
                src="/maps/satellite-new.webp" 
                alt="Satellite View" 
                className="absolute inset-0 w-full h-full object-cover"
                style={{ 
                  zIndex: 3,
                  maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.4) 50%, black 75%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.4) 50%, black 75%)',
                  transform: 'scale(1.3)',
                  transformOrigin: 'center'
                }}
              />
              
              {/* Reverse starfield rain - angled streaming away from viewer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 10 }}>
                {/* Thin rain drops, all similar size, angled to stream away */}
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '5%', left: '12%', animationDelay: '0s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '8%', left: '25%', animationDelay: '0.3s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '3%', left: '38%', animationDelay: '0.6s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '10%', left: '52%', animationDelay: '0.1s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '6%', left: '65%', animationDelay: '0.4s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '12%', left: '78%', animationDelay: '0.7s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '4%', left: '88%', animationDelay: '0.2s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '9%', left: '18%', animationDelay: '0.5s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '7%', left: '42%', animationDelay: '0.8s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '11%', left: '55%', animationDelay: '0.15s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '5%', left: '32%', animationDelay: '0.45s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '8%', left: '72%', animationDelay: '0.75s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '6%', left: '8%', animationDelay: '0.25s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-5 animate-rain-away" style={{ top: '10%', left: '95%', animationDelay: '0.55s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.25) 100%)', transform: 'rotate(15deg)' }}></div>
                <div className="absolute w-0.5 h-6 animate-rain-away" style={{ top: '3%', left: '58%', animationDelay: '0.85s', background: 'linear-gradient(to bottom, rgba(147, 197, 253, 0) 0%, rgba(147, 197, 253, 0.3) 100%)', transform: 'rotate(15deg)' }}></div>
              </div>
              
              {/* Lightning flash overlay */}
              <div className="absolute inset-0 bg-white/10 animate-lightning pointer-events-none" style={{ zIndex: 11 }}></div>
              
              {/* Leads sparkle wave - 47 dots representing new leads with random sizes and wave shimmer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
                {[
                  { top: 15, left: 20, size: 1.6 }, { top: 25, left: 45, size: 0.7 }, { top: 30, left: 70, size: 0.8 },
                  { top: 18, left: 55, size: 0.9 }, { top: 40, left: 30, size: 0.6 }, { top: 35, left: 85, size: 0.7 },
                  { top: 22, left: 10, size: 0.8 }, { top: 45, left: 60, size: 0.6 }, { top: 28, left: 35, size: 0.9 },
                  { top: 50, left: 15, size: 0.7 }, { top: 32, left: 75, size: 0.6 }, { top: 38, left: 50, size: 0.8 },
                  { top: 55, left: 40, size: 0.9 }, { top: 42, left: 80, size: 0.7 }, { top: 20, left: 65, size: 0.8 },
                  { top: 48, left: 25, size: 0.6 }, { top: 33, left: 90, size: 0.7 }, { top: 58, left: 55, size: 0.6 },
                  { top: 25, left: 38, size: 0.9 }, { top: 52, left: 72, size: 0.8 }, { top: 36, left: 12, size: 1.4 },
                  { top: 60, left: 85, size: 0.7 }, { top: 30, left: 48, size: 0.9 }, { top: 44, left: 20, size: 0.6 },
                  { top: 65, left: 35, size: 0.8 }, { top: 38, left: 62, size: 0.7 }, { top: 28, left: 78, size: 0.9 },
                  { top: 55, left: 8, size: 0.6 }, { top: 42, left: 55, size: 0.8 }, { top: 70, left: 68, size: 0.7 },
                  { top: 33, left: 25, size: 0.6 }, { top: 48, left: 42, size: 0.9 }, { top: 62, left: 18, size: 0.8 },
                  { top: 36, left: 88, size: 0.7 }, { top: 50, left: 35, size: 1.5 }, { top: 72, left: 52, size: 0.6 },
                  { top: 40, left: 70, size: 0.8 }, { top: 58, left: 28, size: 0.7 }, { top: 45, left: 92, size: 0.6 },
                  { top: 68, left: 15, size: 0.9 }, { top: 35, left: 55, size: 0.7 }, { top: 75, left: 78, size: 0.8 },
                  { top: 52, left: 45, size: 0.6 }, { top: 38, left: 32, size: 0.9 }, { top: 63, left: 60, size: 0.7 },
                  { top: 47, left: 18, size: 0.6 }
                ].map((dot, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full animate-diamond-flash"
                    style={{
                      top: `${dot.top}%`,
                      left: `${dot.left}%`,
                      width: `${dot.size * 8}px`,
                      height: `${dot.size * 8}px`,
                      animationDelay: `${i * 0.02}s`,
                      backgroundColor: 'rgb(52, 211, 153)',
                      boxShadow: '0 0 3px 1px rgba(52, 211, 153, 0.4)',
                    }}
                  />
                ))}
              </div>
              
              {/* Floating UI overlay */}
              <div className="absolute top-4 left-4 right-4 pointer-events-none" style={{ zIndex: 15 }}>
                <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-700/50 px-4 py-2 flex items-center gap-4 shadow-lg max-w-xl mx-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                    </div>
                    <span className="text-white font-medium text-sm">StormVault</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-slate-700/50 rounded-md px-3 py-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-slate-400 text-sm">Huntsville, AL area</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-red-500/20 px-2 py-1 rounded border border-red-500/30">5 Active Storms</span>
                </div>
              </div>
              
              {/* Custom storm markers overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 16 }}>
                <div className="absolute top-[35%] left-[55%] w-6 h-6 bg-red-500 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center animate-pin-hit" style={{ animationDelay: '0.2s' }}>
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div className="absolute top-[45%] left-[25%] w-6 h-6 bg-red-500 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center animate-pin-hit" style={{ animationDelay: '0.4s' }}>
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="absolute top-[60%] left-[70%] w-6 h-6 bg-orange-500 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center animate-pin-hit" style={{ animationDelay: '0.6s' }}>
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="absolute top-[25%] left-[75%] w-6 h-6 bg-red-500 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center animate-pin-hit" style={{ animationDelay: '0.3s' }}>
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div className="absolute top-[50%] left-[40%] w-6 h-6 bg-yellow-500 rounded-full border-2 border-white/50 shadow-lg flex items-center justify-center animate-pin-hit" style={{ animationDelay: '0.5s' }}>
                  <span className="text-white text-xs font-bold">5</span>
                </div>
              </div>
              
              {/* Stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none" style={{ zIndex: 15 }}>
                <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-slate-700/50 px-4 py-3 shadow-lg flex items-center justify-between max-w-md mx-auto">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-400">47</p>
                      <p className="text-xs text-slate-400">New Leads</p>
                    </div>
                    <div className="w-px h-8 bg-slate-600"></div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-400">203</p>
                      <p className="text-xs text-slate-400">Properties</p>
                    </div>
                    <div className="w-px h-8 bg-slate-600"></div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-accent-400">12</p>
                      <p className="text-xs text-slate-400">Priority</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-slate-500 text-sm mb-8 uppercase tracking-wider font-medium">Trusted by roofing professionals across the U.S.</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            <div className="text-slate-400 font-semibold text-lg">Huntsville, AL</div>
            <div className="text-slate-400 font-semibold text-lg">Denver, CO</div>
            <div className="text-slate-400 font-semibold text-lg">Oklahoma City</div>
            <div className="text-slate-400 font-semibold text-lg">Phoenix, AZ</div>
            <div className="text-slate-400 font-semibold text-lg">Minneapolis</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How StormVault Works
            </h2>
            <p className="text-slate-400 text-lg">
              Find high-quality leads in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">1</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Storm Strikes</h3>
                <p className="text-slate-400 text-sm">
                  When a storm hits your area, StormVault instantly maps the damage path using NOAA data and radar imagery.
                </p>
              </div>
            </div>

            {/* Connector Line */}
            <div className="hidden md:block absolute top-16 left-[33%] w-[34%] h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"></div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">2</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">We Find Properties</h3>
                <p className="text-slate-400 text-sm">
                  We cross-reference storm paths with property records to identify homes most likely damaged, even before they file claims.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">3</div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">You Close Deals</h3>
                <p className="text-slate-400 text-sm">
                  Get homeowner contact info, property details, and roof age data. Knock doors with confidence and win more jobs.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="btn-primary inline-flex items-center gap-2">
              Start Finding Leads
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to Find More Jobs
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              StormVault integrates the data you need into one simple platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Storm Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                View historical hail and storm events overlaid on property maps. Know exactly which neighborhoods were hit and when.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Property Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Get instant access to property details including year built, roof age estimates, and ownership information.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lead Management</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create, organize, and track leads from first contact to signed contract. Never lose a potential customer again.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Maps</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Beautiful, easy-to-use map interface with parcel overlays, storm zones, and lead pins all in one view.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Track your performance with real-time metrics on leads generated, storms hit, and jobs closed.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-6">
              <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Export & Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Export leads to CSV, share team assignments, and integrate with your existing CRM tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-800/30 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How StormVault Works
            </h2>
            <p className="text-slate-400 text-lg">
              Three simple steps to more roofing jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Storm Hits</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When a hail or wind storm passes through an area, StormVault automatically captures the data and maps the affected neighborhoods.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">We Research</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                StormVault instantly pulls property records, roof age estimates, and ownership information for every affected address.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">You Close</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Review prioritized leads in your dashboard, assign to your team, and start knocking doors with all the info you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 text-lg">
              Start for free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="card p-8 flex flex-col">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-1">Starter</h3>
                <p className="text-slate-500 text-sm mb-4">Perfect for solo roofers</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  First 3 months at 50% off ($24.50/mo)
                </p>
                <ul className="space-y-3 mb-6">
                  {['1 user account', '1 metro area', '500 property lookups/month', 'Basic storm data', 'Email support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                      <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/signup?plan=starter" className="block text-center bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors text-sm mt-auto">
                Get Started
              </Link>
            </div>

            {/* Professional Plan - Larger and more prominent */}
            <div className="card p-10 border-primary-500/50 relative flex flex-col" style={{ overflow: 'visible' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium z-50 whitespace-nowrap shadow-lg">Most Popular</div>
              <div className="flex-grow -mt-2">
                <h3 className="text-lg font-semibold text-white mb-1">Professional</h3>
                <p className="text-slate-500 text-sm mb-4">For growing teams</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$149</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  First 3 months at 50% off ($74.50/mo)
                </p>
                <ul className="space-y-3 mb-6">
                  {['5 user accounts', '3 metro areas', '2,500 property lookups/month', 'Full storm + property data', 'Lead scoring', 'Priority support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                      <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/signup?plan=professional" className="block text-center btn-primary text-sm mt-auto">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card p-8 flex flex-col">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-1">Enterprise</h3>
                <p className="text-slate-500 text-sm mb-4">For large organizations</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">$499</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  First 3 months at 50% off ($249.50/mo)
                </p>
                <ul className="space-y-3 mb-6">
                  {['Unlimited users', 'Nationwide coverage', '10,000 lookups/month', 'API access', 'Custom integrations', 'Dedicated support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                      <svg className="w-4 h-4 text-accent-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/signup?plan=enterprise" className="block text-center bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors text-sm mt-auto">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Ready to Find More Jobs?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join the beta program today and get 3 months free. No credit card required.
          </p>
          <Link href="/signup" className="btn-accent inline-block">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to know about StormVault
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">How does StormVault track storm damage?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                We integrate with NOAA storm data and national weather radar to map historical and real-time storm events. When hail or high winds occur, we overlay the damage path on property maps, allowing you to see exactly which neighborhoods were affected and when.
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">Where does your property data come from?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                We aggregate data from county assessor records, building permit databases, satellite imagery, and public records. This includes property ownership, year built, square footage, roof age estimates, and more - all in one place.
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">Is the homeowner contact data DNC compliant?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                Yes. Our contact data is DNC-scrubbed and compliant with federal regulations. We provide phone numbers and addresses for direct mail purposes. We don't facilitate unsolicited calls or texts to numbers on the DNC registry.
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">What markets do you currently cover?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                We're currently in beta with full coverage for Huntsville, AL and expanding to Nashville, TN. We're building out coverage for Phoenix, Denver, Oklahoma City, and Minneapolis. Enterprise customers can request early access to additional markets.
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">How accurate is the roof age data?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                We estimate roof age based on permit records, satellite imagery analysis, and public records. While we can't guarantee 100% accuracy (roofs may have been replaced without permits), our estimates are typically within 2-3 years of actual age. We show "confidence scores" to help you prioritize leads.
              </div>
            </details>

            {/* FAQ 6 */}
            <details className="bg-slate-800/50 border border-slate-700 rounded-lg group">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-medium text-white">Can I import my existing leads?</span>
                <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-slate-400 text-sm">
                Yes! Professional and Enterprise plans include CSV import functionality. Upload your existing lead lists and we'll enrich them with property data, storm history, and contact information. Your existing data stays private and is never shared.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Roofers Across Alabama
            </h2>
            <p className="text-slate-400 text-lg">
              See what contractors are saying about StormVault
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-4">
                "StormVault changed how we find leads. After the March storms, we found 47 potential jobs in Madison County alone. Booked 12 jobs in one week."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <span className="text-primary-400 font-semibold">JM</span>
                </div>
                <div>
                  <p className="font-medium text-white">James Mitchell</p>
                  <p className="text-sm text-slate-500">Mitchell Roofing, Huntsville</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-4">
                "Finally, a tool that actually works for roofers. The storm overlay makes it so easy to see exactly where damage happened. We've increased our close rate by 30%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-500/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-400 font-semibold">SR</span>
                </div>
                <div>
                  <p className="font-medium text-white">Sarah Rodriguez</p>
                  <p className="text-sm text-slate-500">Precision Roofing, Madison</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-slate-300 mb-4">
                "The property data is incredible. We used to spend hours on county assessor websites. Now we have everything in one place - roof age, owner info, everything."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 font-semibold">TK</span>
                </div>
                <div>
                  <p className="font-medium text-white">Tommy Kennedy</p>
                  <p className="text-sm text-slate-500">Kennedy Construction, Athens</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-slate-500">Roofers Onboarded</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">12K+</p>
              <p className="text-slate-500">Leads Generated</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">$2.1M</p>
              <p className="text-slate-500">Revenue Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">4.9/5</p>
              <p className="text-slate-500">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">StormVault</span>
              </div>
              <p className="text-slate-500 text-sm">
                Roofing intelligence for the modern contractor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-slate-500 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/demo" className="text-slate-500 hover:text-white transition-colors">Demo</a></li>
                <li><a href="/changelog" className="text-slate-500 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-slate-500 hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="text-slate-500 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/careers" className="text-slate-500 hover:text-white transition-colors">Careers</a></li>
                <li><a href="/contact" className="text-slate-500 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/security" className="text-slate-500 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">2026 StormVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
