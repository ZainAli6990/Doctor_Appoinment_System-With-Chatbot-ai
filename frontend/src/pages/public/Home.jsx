import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUserDoctor, FaArrowRight, FaStar } from "react-icons/fa6";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import SearchSection from "../../components/common/SearchSection";
import FeaturedDoctors from "../../components/common/FeaturedDoctors";
import StatsSection from "../../components/common/StatsSection";
import Departments from "../../components/common/Departments";
import WhyChooseUs from "../../components/common/WhyChooseUs";
import Testimonials from "../../components/common/Testimonials";

export default function Home() {
  const [filters, setFilters] = useState({
    search: "",
    specialization: "",
  });

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden bg-primary pt-32 pb-28 md:pt-40 md:pb-36"
      >
        {/* Ambient shapes */}
        <div className="pointer-events-none absolute -top-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-accent/20 blur-3xl float-slow" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative">
          {/* Left */}
          <div className="reveal-up">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              <FaUserDoctor className="text-accent" />
              Trusted Healthcare Platform
            </span>

            <h1 className="font-display text-5xl lg:text-6xl font-semibold text-white mt-7 leading-[1.08]">
              Book your doctor,
              <br />
              <span className="text-accent italic">on your time.</span>
            </h1>

            <p className="text-white/70 text-lg mt-6 leading-8 max-w-md">
              Find experienced specialists, compare qualifications and
              secure an appointment online — no waiting rooms, no phone
              calls.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/doctors">
                <button className="btn-accent">
                  Find Doctors
                  <FaArrowRight />
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-outline">Create Account</button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-12">
              <div className="flex -space-x-3">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex text-accent gap-0.5">
                  {[...Array(5)].map((_, i) => <FaStar key={i} className="text-xs" />)}
                </div>
                <p className="text-white/60 text-xs mt-1">
                  Loved by 10,000+ patients
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center reveal-up" style={{ animationDelay: "150ms" }}>
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-[2.5rem] bg-white/10 backdrop-blur-lg border border-white/15 flex items-center justify-center shadow-2xl float-slow">
                <FaUserDoctor className="text-white/90 text-[180px]" />
              </div>

              <div className="absolute -bottom-6 -left-6 card px-5 py-4 hidden sm:block">
                <p className="text-xs text-muted font-medium">Next Available</p>
                <p className="font-semibold text-ink">Today, 4:30 PM</p>
              </div>

              <div className="absolute -top-6 -right-4 bg-accent text-white rounded-2xl px-5 py-4 shadow-lg hidden sm:block">
                <p className="font-mono text-2xl font-semibold leading-none">500+</p>
                <p className="text-xs mt-1 opacity-90">Verified Doctors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Heartbeat pulse divider */}
        <svg
          className="absolute bottom-0 left-0 w-full h-10 text-white/15"
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
        >
          <polyline
            className="pulse-dash"
            points="0,20 250,20 280,4 310,36 340,20 1200,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </section>

      <StatsSection />

      <section id="search">
        <SearchSection onSearch={setFilters} />
      </section>

      <section id="featured-doctors">
        <FeaturedDoctors filters={filters} />
      </section>

      <section id="departments">
        <Departments />
      </section>

      <section id="why">
        <WhyChooseUs />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="contact">
        <Footer />
      </section>
    </>
  );
}
