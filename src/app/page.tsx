'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import Logo from '@/components/ui/Logo';
import { Target, Eye, Users, Award, BookOpen } from 'lucide-react';

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
    subtitle: 'An all-in-one portal for interns, supervisors, and administrators.'
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

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white font-semibold text-sm transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer text-center min-w-[90px]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-lg bg-white border border-brand text-brand hover:text-brand-hover font-semibold text-sm transition-all duration-200 shadow-xs hover:shadow-[0_0_12px_rgba(226,99,33,0.4)] active:scale-95 cursor-pointer text-center min-w-[90px]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <section className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] lg:h-[580px] bg-slate-950 overflow-hidden flex items-center">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <Image
              src={slide.path}
              alt={`Slide ${idx + 1}`}
              fill
              sizes="100vw"
              priority={idx === 0}
              className="object-cover"
            />
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-brand scale-125' : 'bg-white/50 hover:bg-white/80'
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
                  <p className="text-slate-600 leading-relaxed text-sm text-justify">
                    Welcome to Inotech Solutions Pvt Ltd, One of the few IT system integration, professional service and software companies in South Asia that works with Enterprise system and companies. As a privately owned company, Inotech Solutions provides IT Consultancy, software design and development as well as professional services and hardware deployment and maintenance to the Government, Semi Government, Defense, and Private Sectors, ERP Solutions, Data Centre Management and cloud computing, Cyber Security, Health Care with State of the art HMIS software, eLearning, eEnrollment and eExam etc.
                  </p>
                </div>
              </div>

              {/* About the Internship Management System Card */}
              <div className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up animation-delay-100">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold uppercase tracking-wider transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>About the Internship Documentation Portal</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed text-sm text-justify">
                    The Internship Documentation Portal is designed to streamline and manage the intern onboarding and documentation process efficiently. It provides a platform for interns to submit their necessary documents and for administrators to review, verify, approve, or reject these submissions seamlessly. The system ensures that all required documentation is collected and processed accurately, facilitating smooth batch allocation and a well-organized internship management workflow.
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
                  <p className="text-slate-600 leading-relaxed text-sm text-justify">
                    To deliver premium-quality, secure, and robust technology solutions while nurturing next-generation developer talent. We aim to establish a pathway for interns to learn best engineering practices and successfully transition into professional software roles.
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
                  <p className="text-slate-600 leading-relaxed text-sm text-justify">
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
                Our Internship Documentation Portal is equipped with robust tools designed to support each participant during their professional development journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

              {/* Feature 1 */}
              <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_0_30px_rgba(226,99,33,0.15)] hover:bg-brand-light/10 flex flex-col justify-between animate-fade-in-up">
                <div className="space-y-4">
                  <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Intern Documentation Management</h3>
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    Manage and upload all required internship documents, including CV, CNIC, cover letter, and verification certificates, through a secure and user-friendly portal. Track the status of submitted documents in real time.
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
                  <p className="text-sm text-slate-600 leading-relaxed text-justify">
                    Register for the internship by completing the online application and submitting the required documents. Once verified by the administrator, approved interns are assigned to their respective internship batches.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white border-t-2 border-brand py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-slate-800 pb-8 mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white mb-2">Inotech Solutions (Pvt) Ltd</h3>
            <p className="text-sm text-slate-350 max-w-sm font-light leading-relaxed">
              Empowering organization growth through premium software systems and expert professional development programs.
            </p>
          </div>
          <div className="space-y-2 text-sm text-slate-300 font-light md:justify-self-center">
            <p className="font-semibold text-white">Contact Information</p>
            <p>Email: <a href="mailto:info@inotechsoln.com" className="hover:text-brand hover:underline">info@inotechsoln.com</a></p>
            <p>Phone: 051-8778995</p>
            <p>Website: <a href="https://www.inotechsoln.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand hover:underline">www.inotechsoln.com</a></p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <Logo href="https://www.inotechsoln.com" className="bg-white px-2 py-1 rounded transition-transform hover:scale-105" width={110} height={30} />
            <div className="flex items-center gap-4 text-slate-400">
              <a href="https://pk.linkedin.com/company/inotechsolutions" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.facebook.com/InotechSolutions1/" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.instagram.com/inotech_soln/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.14.054 1.662.242 2.073.402.546.213.937.467 1.348.878.411.411.665.802.878 1.348.16.41.348.93.402 2.073.044.926.054 1.28.054 3.71s-.01 2.784-.054 3.71c-.054 1.14-.242 1.662-.402 2.073-.213.546-.467.937-.878 1.348-.411.411-.802.665-1.348.878-.41.16-.93.348-2.073.402-.926.044-1.28.054-3.71.054s-2.784-.01-3.71-.054c-1.14-.054-1.662-.242-2.073-.402-.546-.213-.937-.467-1.348-.878-.411-.411-.665-.802-.878-1.348-.16-.41-.348-.93-.402-2.073-.044-.926-.054-1.28-.054-3.71s.01-2.784.054-3.71c.054-1.14.242-1.662.402-2.073.213-.546.467-.937.878-1.348.411-.411.802-.665 1.348-.878.41-.16.93-.348 2.073-.402.926-.044 1.28-.054 3.71-.054zm0-1.8c-2.475 0-2.785.01-3.757.054-1.166.054-1.962.24-2.66.51-.722.28-1.334.656-1.944 1.266a5.86 5.86 0 00-1.266 1.944c-.27.698-.456 1.494-.51 2.66C2.01 9.215 2 9.525 2 12s.01 2.785.054 3.757c.054 1.166.24 1.962.51 2.66.28.722.656 1.334 1.266 1.944a5.86 5.86 0 001.944 1.266c.698.27 1.494.456 2.66.51.972.044 1.282.054 3.757.054s2.785-.01 3.757-.054c1.166-.054 1.962-.24 2.66-.51a5.86 5.86 0 001.944-1.266c.61-.61.986-1.222 1.266-1.944.27-.698.456-1.494.51-2.66.044-.972.054-1.282.054-3.757s-.01-2.785-.054-3.757c-.054-1.166-.24-1.962-.51-2.66a5.86 5.86 0 00-1.266-1.944c-.61-.61-1.222-.986-1.944-1.266-.698-.27-1.494-.456-2.66-.51C15.215 2.01 14.905 2 12 2zm0 4.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-8.205a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center gap-1 text-xs text-slate-400">
          <span>&copy; 2026 Inotech Solutions (Pvt) Ltd. All rights reserved.</span>
          <span className="text-slate-500 italic mt-0.5">In the Supervision of Ma'am Samavia Rasool</span>
        </div>
      </footer>
    </div>
  );
}
