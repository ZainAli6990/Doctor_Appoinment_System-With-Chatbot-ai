import { Link } from "react-router-dom";
import { FaHeartPulse } from "react-icons/fa6";
import { FaFacebookF, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#0b1f1c] text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <FaHeartPulse className="text-lg" />
            </span>
            <span className="font-display text-xl font-semibold text-white">
              Sehat<span className="text-accent">Care</span>
            </span>
          </div>
          <p className="text-sm leading-6">
            Connecting patients with trusted, experienced doctors — book
            appointments in minutes, not hours.
          </p>
          <div className="flex gap-3 mt-6">
            {[FaFacebookF, FaTwitter, FaInstagram].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:text-white transition-colors cursor-pointer"
              >
                <Icon className="text-sm" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-white text-lg mb-5">Quick Links</h3>
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/doctors" className="hover:text-accent transition-colors">Find Doctors</Link>
            <Link to="/login" className="hover:text-accent transition-colors">Admin Login</Link>
            <Link to="/register" className="hover:text-accent transition-colors">Register</Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-white text-lg mb-5">Departments</h3>
          <div className="flex flex-col gap-3 text-sm">
            <span>Cardiology</span>
            <span>Neurology</span>
            <span>Dentistry</span>
            <span>Pediatrics</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-white text-lg mb-5">Get in Touch</h3>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <FaLocationDot className="text-accent" /> Multan, Punjab, Pakistan
            </div>
            <div className="flex items-center gap-3">
              <FaPhone className="text-accent" /> +92 300 0000000
            </div>
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-accent" /> support@sehatcare.app
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © 2026 SehatCare Doctor Booking System. All rights reserved.
      </div>
    </footer>
  );
}
