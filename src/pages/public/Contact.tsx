import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { HomeHeaderExport, Footer } from './Home';
import { Input } from '@/components/UI';
import { showToast } from '@/components/Toast';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Your message has been sent. We will get back to you soon.');
    setName(''); setEmail(''); setSubject(''); setMessage('');
  };

  return (
    <div className="min-h-screen bg-white">
      <HomeHeaderExport />
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1>
          <p className="mt-4 text-lg text-gray-600">Have questions? We are here to help.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mt-3 text-gray-600">Reach out to us through any of these channels.</p>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-lg bg-blue-50 p-3 text-blue-600"><Mail className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@vendorai.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-lg bg-emerald-50 p-3 text-emerald-600"><Phone className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-lg bg-amber-50 p-3 text-amber-600"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">123 Business District, Suite 100, New York, NY 10001</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <h2 className="text-xl font-bold text-gray-900">Send a Message</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input label="Your Name" value={name} onChange={setName} required placeholder="John Doe" />
                <Input label="Email" value={email} onChange={setEmail} type="email" required placeholder="john@example.com" />
                <Input label="Subject" value={subject} onChange={setSubject} required placeholder="How can we help?" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                  Send Message <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
