import { Link } from 'react-router-dom';
import { BarChart3, ShieldAlert, Scale, Lightbulb, FileText, Users, TrendingUp, Package } from 'lucide-react';
import { HomeHeaderExport, Footer } from './Home';

export function Features() {
  const features = [
    { icon: <BarChart3 />, title: 'Performance Analysis', desc: 'Comprehensive analysis of vendor delivery times, product quality, cost efficiency, and reliability scores. Weighted scoring formula combines multiple metrics into a single performance score.', color: 'bg-blue-50 text-blue-600', points: ['Delivery score tracking', 'Quality assessment', 'Cost efficiency analysis', 'Reliability metrics'] },
    { icon: <ShieldAlert />, title: 'AI Risk Prediction', desc: 'Machine learning model analyzes historical vendor data to predict risk levels. Classifies vendors as Low, Medium, or High Risk with detailed factor breakdown.', color: 'bg-emerald-50 text-emerald-600', points: ['Risk score calculation', 'Risk factor analysis', 'AI-generated recommendations', 'Historical trend tracking'] },
    { icon: <Scale />, title: 'Vendor Comparison', desc: 'Compare 2-4 vendors side-by-side across all key metrics. The system automatically highlights the best-performing vendor with AI-based recommendations.', color: 'bg-amber-50 text-amber-600', points: ['Side-by-side metrics', 'Best vendor highlighting', 'Comparison reports', 'Export capabilities'] },
    { icon: <Lightbulb />, title: 'Smart Recommendations', desc: 'AI-powered recommendations help procurement managers choose the right vendors for different order types, from high-value to regular orders.', color: 'bg-indigo-50 text-indigo-600', points: ['Vendor ranking', 'Use-case matching', 'Risk-based suggestions', 'Actionable insights'] },
    { icon: <Package />, title: 'Order Management', desc: 'Complete order tracking from placement to delivery. Monitor order status, delivery times, and quality outcomes across all vendors.', color: 'bg-purple-50 text-purple-600', points: ['Order tracking', 'Delivery monitoring', 'Quality records', 'Status management'] },
    { icon: <Users />, title: 'Multi-Role Dashboards', desc: 'Three distinct interfaces for Admins, Procurement Managers, and Vendors, each with role-specific features and views.', color: 'bg-cyan-50 text-cyan-600', points: ['Admin full access', 'Manager tools', 'Vendor self-service', 'Role-based security'] },
    { icon: <FileText />, title: 'Reports & Analytics', desc: 'Generate detailed reports on vendor performance, risk, delivery, quality, and complaints. Export data for further analysis.', color: 'bg-rose-50 text-rose-600', points: ['Performance reports', 'Risk reports', 'Delivery reports', 'Export to CSV'] },
    { icon: <TrendingUp />, title: 'Trend Analysis', desc: 'Track vendor performance trends over time with interactive line charts and monthly performance history.', color: 'bg-teal-50 text-teal-600', points: ['Monthly trends', 'Delivery patterns', 'Quality trends', 'Risk evolution'] },
  ];

  return (
    <div className="min-h-screen bg-white">
      <HomeHeaderExport />
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Features</h1>
          <p className="mt-4 text-lg text-gray-600">Comprehensive tools for vendor performance and risk management</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 p-6 transition hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className={`inline-flex rounded-xl p-3 ${f.color}`}>{f.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                    <ul className="mt-4 grid grid-cols-2 gap-1.5">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="h-1 w-1 rounded-full bg-blue-500" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="bg-blue-600 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">Start using these features today</h2>
          <Link to="/register" className="mt-4 inline-flex rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
            Get Started
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
