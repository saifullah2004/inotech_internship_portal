'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import Logo from '@/components/ui/Logo';
import { Mail, Phone, Globe, Target, Eye, Shield, Users, Award, BookOpen, Clock, BarChart3, HelpCircle } from 'lucide-react';

const SLIDES = [
  {
    path: '/images/slide1.jpg',
    title: 'We Use Latest Technology for the Latest World',
    subtitle: 'Driving innovation and technology forward to meet global demands.'
  },
  {
    path: '/images/slide2.jpg',
    title: 'Empowering Next Generation Talents',
    subtitle: 'Nurturing skills, expertise, and professional growth through hands-on experience.'
  },
  {
    path: '/images/slide3.jpg',
    title: 'Streamlined Internship Workflows',
    subtitle: 'An all-in-one portal for students, supervisors, and administrators.'
  },
  {
    path: '/images/slide4.jpg',
    title: 'Building Careers with Industry Leaders',
    subtitle: 'Work on real-world projects under the mentorship of senior engineers.'
  }
];

export default function RootPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-brand selection:text-white">
      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo href="/" />
          
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white font-semibold text-sm transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
          >
            Login
          </Link>
        </div>
      </header>

      <section className="relative w-full h-[380px] sm:h-[500px] md:h-[620px] lg:h-[680px] bg-slate-950 overflow-hidden flex items-center">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.path}
              alt={`Slide ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-brand scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Main Informational Content */}
      <main className="flex-1">
        {/* About Sections */}
        <section id="about" className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
              
              {/* About Inotech Solutions Card */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Award className="w-3.5 h-3.5" />
                    <span>About Inotech Solutions</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Pioneering Innovation & Quality
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Inotech Solutions (Pvt) Ltd is a premier technology services and consulting provider committed to delivering innovative, reliable, and high-performance software products. We specialize in building cutting-edge web applications, corporate systems, and digital ecosystems that empower organizations to scale and succeed.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Our professional team of software engineers, architects, and designers work closely with industry leaders and academic partners to bridge the gap between academic theory and practical technology implementation.
                  </p>
                </div>
              </div>

              {/* About the Internship Management System Card */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-100">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Internship Management System</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Bridging Academy & Industry
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    The Internship Management System at Inotech Solutions is designed to streamline the lifecycle of student internships. From registration and secure documentation submission to project monitoring and evaluations, this portal ensures a smooth experience for students and supervisors.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    By providing a structured workflow, the platform helps interns focus on learning and developing real-world project experience while ensuring that supervisors and administrators can easily track and evaluate progress.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Mission Card */}
              <div className="group bg-white p-8 rounded-2xl shadow-xs border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex gap-5 items-start animate-fade-in-up">
                <div className="p-3 bg-brand-light text-brand rounded-lg shrink-0 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    To deliver premium-quality, secure, and robust technology solutions while nurturing next-generation developer talent. We aim to establish a pathway for students to learn best engineering practices and successfully transition into professional software roles.
                  </p>
                </div>
              </div>

              {/* Vision Card */}
              <div className="group bg-white p-8 rounded-2xl shadow-xs border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex gap-5 items-start animate-fade-in-up animation-delay-100">
                <div className="p-3 bg-brand-light text-brand rounded-lg shrink-0 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    To be a leading center of technological excellence and software innovation, recognized globally for producing world-class tech products and mentoring outstanding engineering professionals who drive the digital future.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Key Services & Features Section */}
        <section className="py-16 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Key Services & Portal Features</h2>
              <p className="mt-4 text-slate-600">
                Our Internship Management System is equipped with robust tools designed to support each participant during their professional development journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Student & Supervisor Management</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Easy registration, profile setup, and secure role-based access for students and industry mentors.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-100">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Internship Registration</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Complete online registration and document submission (CVs, letters, CNIC, and police verification) through a secure dashboard.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-200">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Attendance & Progress</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Log hours, track daily attendance, and upload weekly tasks to ensure structural learning and compliance.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Project & Task Assignment</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Assign tasks, manage group projects, and share technical documentation seamlessly inside the system.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-100">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Reports & Evaluations</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Generate periodic performance reviews, administrative summaries, and completion certificates directly.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-200">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Performance Benchmarking</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Standardized metrics for grading and tracking technical competency growth over the internship duration.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight mb-12">Portal Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* For Students */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 animate-fade-in-up">
                <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  1
                </div>
                <h3 className="text-lg font-bold text-brand mb-4">For Students</h3>
                <ul className="space-y-3 text-sm text-slate-650">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Structured registration workflow</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Real-time updates on status</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Secure document storage</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Direct interaction with mentors</span>
                  </li>
                </ul>
              </div>

              {/* For Supervisors */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 animate-fade-in-up animation-delay-100">
                <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  2
                </div>
                <h3 className="text-lg font-bold text-brand mb-4">For Supervisors</h3>
                <ul className="space-y-3 text-sm text-slate-650">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Simplified student verification</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Centralized task assignment</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Transparent review history</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Effortless grading and feedback</span>
                  </li>
                </ul>
              </div>

              {/* For Administrators */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 animate-fade-in-up animation-delay-200">
                <div className="w-10 h-10 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold mb-4 transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  3
                </div>
                <h3 className="text-lg font-bold text-brand mb-4">For Administrators</h3>
                <ul className="space-y-3 text-sm text-slate-650">
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Overview of all active applications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Granular status management</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>System audits and logs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 transition-colors duration-300 group-hover:bg-brand" />
                    <span>Automated report compilation</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white border-t-2 border-brand py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-8 mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white mb-2">Inotech Solutions (Pvt) Ltd</h3>
            <p className="text-sm text-slate-350 max-w-sm font-light leading-relaxed">
              Empowering organization growth through premium software systems and expert professional development programs.
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-300 font-light">
            <p className="font-semibold text-white">Contact Information</p>
            <p>Email: <a href="mailto:info@inotechsoln.com" className="hover:text-brand hover:underline">info@inotechsoln.com</a></p>
            <p>Phone: 051-8778995</p>
            <p>Website: <a href="https://www.inotechsoln.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">www.inotechsoln.com</a></p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-450">
          <span>&copy; 2020 Inotech Solutions (Pvt) Ltd. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-brand hover:underline text-slate-300">Login Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
