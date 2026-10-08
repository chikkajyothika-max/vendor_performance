import { Link } from 'react-router-dom';
import { Target, Eye, Users, TrendingUp, Award, ShieldCheck } from 'lucide-react';
import { HomeHeaderExport, Footer } from './Home';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      <HomeHeaderExport />
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">About VendorAI</h1>
          <p className="mt-4 text-lg text-gray-600">
            VendorAI is an AI-powered vendor performance and risk prediction system that helps organizations
            make data-driven decisions about their suppliers and vendors.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-8">
              <div className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Target className="h-6 w-6" /></div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-3 text-gray-600">
                To empower organizations with AI-driven insights that transform how they evaluate, monitor,
                and select vendors. We believe every procurement decision should be backed by data, not guesswork.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-8">
              <div className="inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600"><Eye className="h-6 w-6" /></div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Our Vision</h2>
              <p className="mt-3 text-gray-600">
                A world where every business can instantly identify reliable vendors, predict supply chain
                risks before they happen, and build stronger, more resilient supplier relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900">What We Offer</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <TrendingUp />, title: 'Performance Tracking', desc: 'Monitor vendor delivery, quality, cost, and reliability in real-time.' },
              { icon: <ShieldCheck />, title: 'Risk Prediction', desc: 'AI-powered risk classification: Low, Medium, or High for every vendor.' },
              { icon: <Users />, title: 'Multi-Role Access', desc: 'Dedicated dashboards for admins, procurement managers, and vendors.' },
              { icon: <Award />, title: 'Smart Recommendations', desc: 'AI-generated suggestions to help you choose the best vendors.' },
              { icon: <Target />, title: 'Vendor Comparison', desc: 'Compare up to 4 vendors side-by-side with detailed metrics.' },
              { icon: <TrendingUp />, title: 'Trend Analysis', desc: 'Track performance trends over time with interactive charts.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600">{item.icon}</div>
                <h3 className="mt-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-blue-600 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">Want to learn more?</h2>
          <Link to="/contact" className="mt-4 inline-flex rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
            Contact Us
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
