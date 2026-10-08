import { Link } from 'react-router-dom';
import { BarChart3, ShieldAlert, Scale, Lightbulb, ArrowRight, CheckCircle2 } from 'lucide-react';
import { RiskDonutChart, PerformanceBarChart } from '@/components/Charts';

export function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HomeHeader />
      <Hero />
      <Features />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}

function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">AI</div>
          <span className="text-lg font-bold text-gray-900">VendorAI</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600">About</Link>
          <Link to="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600">Features</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Login</Link>
          <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

export function HomeHeaderExport() { return <HomeHeader />; }

function Hero() {
  const previewData = [
    { name: 'ABC Suppliers', score: 92 },
    { name: 'TechNova', score: 88 },
    { name: 'GreenLeaf', score: 84 },
    { name: 'ApexComp', score: 86 },
    { name: 'MetalCraft', score: 82 },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              AI-Powered Vendor Intelligence
            </div>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              Make Smarter Vendor Decisions with AI
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Analyze vendor performance, identify potential risks, and choose reliable vendors using data-driven insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/features" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                Explore Features
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time analytics</div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-gray-200">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Vendor Performance Overview</p>
                  <p className="text-xs text-gray-500">Top performing vendors</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live</div>
              </div>
              <PerformanceBarChart data={previewData} />
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Low Risk</p>
                  <p className="text-lg font-bold text-emerald-600">75</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Medium Risk</p>
                  <p className="text-lg font-bold text-amber-600">30</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">High Risk</p>
                  <p className="text-lg font-bold text-red-600">15</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Performance Analysis', desc: 'Analyze vendor delivery, quality, cost, and reliability with detailed metrics.', color: 'bg-blue-50 text-blue-600' },
    { icon: <ShieldAlert className="h-6 w-6" />, title: 'AI Risk Prediction', desc: 'Predict whether a vendor has low, medium, or high risk using AI.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: <Scale className="h-6 w-6" />, title: 'Vendor Comparison', desc: 'Compare multiple vendors based on important performance metrics.', color: 'bg-amber-50 text-amber-600' },
    { icon: <Lightbulb className="h-6 w-6" />, title: 'Smart Recommendations', desc: 'Get recommendations based on vendor performance and risk analysis.', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Vendor Management</h2>
          <p className="mt-3 text-gray-600">Everything you need to evaluate, predict, and decide</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-gray-200 p-6 transition hover:shadow-lg hover:border-blue-200">
              <div className={`inline-flex rounded-xl p-3 ${f.color}`}>{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: '120+', label: 'Vendors Tracked' },
    { value: '1,250+', label: 'Orders Analyzed' },
    { value: '99%', label: 'Prediction Accuracy' },
    { value: '24/7', label: 'Real-time Monitoring' },
  ];
  return (
    <section className="bg-blue-600 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-blue-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">Ready to Make Better Vendor Decisions?</h2>
        <p className="mt-3 text-gray-600">Join organizations using VendorAI to optimize their vendor relationships</p>
        <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">AI</div>
            <span className="font-bold text-gray-900">VendorAI</span>
          </div>
          <p className="text-sm text-gray-500">AI-Powered Vendor Performance and Risk Prediction System</p>
        </div>
      </div>
    </footer>
  );
}
