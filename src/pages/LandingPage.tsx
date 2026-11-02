import { Link } from 'react-router-dom'
import {
  Leaf, Sprout, ShoppingCart, Truck, Shield, ArrowRight,
  CheckCircle, Zap, Globe, Lock, BarChart3
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  { icon: Zap, title: 'AI-Powered Matching', desc: 'Explainable AI connects farmers to buyers using crop quality, price, and location scoring.', color: 'text-amber-500 bg-amber-50' },
  { icon: Globe, title: 'IVR / SMS Support', desc: 'Farmers with limited internet receive consent requests via voice call or SMS.', color: 'text-blue-600 bg-blue-50' },
  { icon: BarChart3, title: 'Sealed Auctions', desc: 'Transporters compete in sealed reverse auctions ensuring cost-effective logistics.', color: 'text-purple-600 bg-purple-50' },
  { icon: Lock, title: 'Escrow Payments', desc: 'Buyer funds held securely in escrow. Released only after quality inspection passes.', color: 'text-rose-600 bg-rose-50' },
  { icon: CheckCircle, title: 'QR Shipment Tracking', desc: 'Every shipment has a QR code for end-to-end real-time verification.', color: 'text-teal-600 bg-teal-50' },
]

const portals = [
  { role: 'farmer', icon: Sprout, title: 'Farmer Portal', desc: 'List crops, complete KYC, join pools, and get paid directly.', color: 'from-agri-700 to-agri-500', path: '/login' },
  { role: 'buyer', icon: ShoppingCart, title: 'Buyer Portal', desc: 'Create procurements, trigger AI matching, and confirm crop pools.', color: 'from-blue-700 to-blue-500', path: '/login' },
  { role: 'transporter', icon: Truck, title: 'Transporter Portal', desc: 'Bid in sealed auctions, manage shipments, update delivery status.', color: 'from-orange-700 to-orange-500', path: '/login' },
  { role: 'admin', icon: Shield, title: 'Admin / Inspector', desc: 'Verify KYC, inspect crops, manage escrow, view analytics.', color: 'from-purple-700 to-purple-500', path: '/login' },
]

const stats = [
  { value: '10,000+', label: 'Registered Farmers' },
  { value: '₹2.4Cr', label: 'Escrow Processed' },
  { value: '98%', label: 'Payment Success Rate' },
  { value: '15+', label: 'States Covered' },
]

export default function LandingPage() {
  return (
    <div className="landing-shell min-h-screen bg-white">
      <nav className="site-nav fixed top-0 left-0 right-0 z-50 border-b border-gray-100 px-5 py-3 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-agri shadow-agri">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-agri-800">AgriNex</span>
              <span className="ml-2 hidden text-xs text-gray-500 sm:inline">Agricultural marketplace</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="#portals" className="hidden px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-agri-800 sm:inline-flex">Portals</a>
            <a href="#platform" className="hidden px-3 py-2 text-sm font-medium text-gray-600 transition hover:text-agri-800 sm:inline-flex">Platform</a>
            <ThemeToggle />
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary py-2 text-sm">Join AgriNex</Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero relative flex items-center overflow-hidden bg-gradient-hero">
        <img
          className="landing-hero-image absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85"
          alt="Sunlit green fields stretching toward the horizon"
          fetchPriority="high"
        />
        <div className="landing-hero-shade absolute inset-0" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-black/20 px-3 py-2 text-xs font-semibold uppercase text-white backdrop-blur-sm">
              <Zap size={14} className="text-amber-300" />
              Built for the people who grow our food
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.04] text-white sm:text-7xl">
              AgriNex<span className="text-amber-300">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-medium leading-8 text-white sm:text-2xl">
              A fairer route from harvest to market.
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Farmers, buyers, and transporters work in one trusted marketplace, with AI matching, pooled produce, and transparent delivery.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex min-h-12 items-center gap-2 bg-white px-6 py-3 font-semibold text-agri-900 transition hover:bg-amber-100">
                Start trading <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="inline-flex min-h-12 items-center border border-white/60 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
          <div className="mt-12 grid max-w-4xl grid-cols-2 border-t border-white/30 pt-5 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="py-2 pr-4 sm:pr-8">
                <div className="font-display text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-xs leading-5 text-white/70 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="portals" className="landing-section py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">One marketplace, four roles</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl">Choose your portal</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-gray-500">Tools tailored to each part of the supply chain, connected from listing to settlement.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {portals.map(({ icon: Icon, title, desc, color, path }) => (
              <Link
                key={title}
                to={path}
                className={`portal-card group relative min-h-52 overflow-hidden border p-5 transition duration-200 hover:-translate-y-1 ${color}`}
              >
                <div className="relative flex h-full flex-col">
                  <div className="mb-7 flex items-center justify-between">
                    <span className="portal-icon grid h-11 w-11 place-items-center border border-white/25 bg-white/10">
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/65 transition group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-5 text-white/75">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="platform" className="landing-features py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="section-kicker">From first offer to final payment</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need in one platform</h2>
            <p className="mt-3 text-gray-500 sm:text-lg">
              From Aadhaar KYC to escrow settlement — every step of the agricultural supply chain, digitized.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px border border-gray-200 bg-gray-200 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="feature-row group bg-white p-5 sm:p-6">
                <div className={`mb-5 grid h-10 w-10 place-items-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="landing-workflow py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Complete End-to-End Workflow
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {['Register & KYC', 'Crop Listing', 'AI Matching', 'Crop Pooling', 'Farmer Consent (IVR)', 'Transport Auction', 'QR Shipment', 'Quality Inspection', 'Escrow Release', 'Payment to Farmers'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-agri-100">
                  <div className="w-5 h-5 bg-agri-700 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
                  <span className="text-gray-700 font-medium">{step}</span>
                </div>
                {i < 9 && <ArrowRight className="w-3.5 h-3.5 text-agri-400 hidden lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-agri-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-agri-300" />
              </div>
              <div>
                <div className="font-display font-bold text-xl">AgriNex</div>
                <div className="text-agri-400 text-xs">AI-Powered Agricultural Marketplace</div>
              </div>
            </div>
            <div className="text-agri-400 text-sm">
              Connecting Farmers and Markets with AI, Logistics and Trust
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-agri-500 text-xs">
            © 2026 AgriNex. Built with FastAPI + React + TypeScript + Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  )
}
