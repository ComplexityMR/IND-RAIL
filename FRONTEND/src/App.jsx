import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import Rail from './Component/RAILWAY/Rail.jsx';
import LiveStatus from './Component/RAILWAY/LiveStatus.jsx';
import Trainbtwstation from './Component/RAILWAY/Trainbtwstation.jsx';
import Livetrainmap from './Component/RAILWAY/Livetrainmap.jsx';
import Pnr from './Component/RAILWAY/PNR.jsx';
import BookTicket from './Component/RAILWAY/BookTicket.jsx';
import Flight from './Component/FLIGHTS/Flight.jsx';
import FlightMAP from './Component/FLIGHTS/FlightMAP.jsx';
import FlightLiveStatus from './Component/FLIGHTS/FlightLiveStatus.jsx';
import Hotelpage from './Component/Hotel/Hotel.jsx';
import 'leaflet/dist/leaflet.css';
import Hotelcard from './Component/Hotel/Hotelcard.jsx';
import Hotelmoredetails from './Component/Hotel/Hotelmoredetails.jsx';
import AIchat from './Component/AI/Ui.jsx';
import { Train, Hotel, PlaneTakeoff } from 'lucide-react';

/* ── shimmer hook ── */
const usePageShimmer = () => {
  const [shimming, setShimming] = useState(false);
  const triggerShimmer = useCallback((cb) => {
    setShimming(true);
    setTimeout(() => {
      cb();
      setTimeout(() => setShimming(false), 500);
    }, 320);
  }, []);
  return { shimming, triggerShimmer };
};

/* ── shimmer overlay ── */
const ShimmerScreen = ({ visible }) => (
  <div className={`shimmer-screen ${visible ? 'visible' : ''}`}>
    <div className={`shimmer-sweep ${visible ? 'active' : ''}`} />
    <div className="shimmer-content">
      <div className="shimmer-bar w-80" />
      <div className="shimmer-bar w-50" />
      <div className="shimmer-bar w-65" />
      <div className="shimmer-grid">
        {[1, 2, 3].map(i => <div key={i} className="shimmer-card" />)}
      </div>
    </div>
  </div>
);

/* ── AI Coming Soon Popup ── */
const AIChatPopup = ({ onClose }) => (
  <div className="popup-overlay">
    <div className="popup-card">
      <div className="popup-glow-bar" />
      <div className="popup-orb" />
      <div className="popup-body">
        <div className="popup-icon">✦</div>
        <span className="popup-badge">Coming Soon</span>
        <div className="popup-text">
          <h2 className="popup-title">AI Travel Assistant</h2>
          <p className="popup-desc">
            We're crafting something extraordinary — an AI that plans routes, compares fares, and builds your entire itinerary in seconds.
          </p>
        </div>
        <div className="popup-features">
          {[
            { icon: '🗺️', text: 'Smart route suggestions across rail, air & stays' },
            { icon: '💬', text: 'Natural language travel planning chat' },
            { icon: '⚡', text: 'Real-time price comparisons & alerts' },
          ].map((f, i) => (
            <div key={i} className="popup-feature-item">
              <span className="popup-feature-icon">{f.icon}</span>
              <span className="popup-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="popup-close-btn">
          Got it, can't wait!
        </button>
      </div>
    </div>
  </div>
);

/* ── AI FAB ── */
const AIFab = ({ onClick }) => (
  <button onClick={onClick} aria-label="Open AI Chat" className="ai-fab">
    <span className="fab-ping" />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" fill="white" />
      <circle cx="8" cy="11" r="1.2" fill="#f59e0b" />
      <circle cx="12" cy="11" r="1.2" fill="#f59e0b" />
      <circle cx="16" cy="11" r="1.2" fill="#f59e0b" />
    </svg>
  </button>
);

/* ── card data ── */
const travelCards = [
  {
    name: "RAILWAY", path: "/railway", accent: "#f59e0b", tag: "Most Popular",
    desc: "Live status, PNR check, trains between stations & Live train map",
    icon: <Train size={30} color="#f59e0b" strokeWidth={1.5} />,
  },
  {
    name: "FLIGHTS", path: "/flights", accent: "#38bdf8", tag: "Real-time",
    desc: "Track live flights, compare fares, interactive sky maps",
    icon: <PlaneTakeoff size={30} color="#38bdf8" strokeWidth={1.5} />,
  },
  {
    name: "HOTELS", path: "/hotel", accent: "#a78bfa", tag: "Best Deals",
    desc: "Discover stays, compare prices",
    icon: <Hotel size={30} color="#a78bfa" strokeWidth={1.5} />,
  },
];

/* ── home ── */
const Home = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPopup, setAiPopup] = useState(false);
  const { shimming, triggerShimmer } = usePageShimmer();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const go = (path) => {
    setDrawerOpen(false);
    if (path === '/ai') { setAiPopup(true); return; }
    triggerShimmer(() => navigate(path));
  };

  return (
    <div className={`home-root ${mounted ? 'mounted' : ''}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── tokens ── */
        :root {
          --amber: #f59e0b;
          --orange: #fb923c;
          --sky: #38bdf8;
          --violet: #a78bfa;
          --bg: #080808;
          --nav-h: clamp(52px, 8vh, 72px);

          /* fluid spacing scale */
          --sp-xs: clamp(0.4rem, 1vw, 0.6rem);
          --sp-sm: clamp(0.6rem, 1.5vw, 1rem);
          --sp-md: clamp(1rem, 2.5vw, 1.5rem);
          --sp-lg: clamp(1.5rem, 4vw, 2.5rem);
          --sp-xl: clamp(2rem, 6vw, 4rem);
          --sp-2xl: clamp(3rem, 8vw, 6rem);

          /* fluid type */
          --text-xs:  clamp(0.62rem,  1.2vw, 0.75rem);
          --text-sm:  clamp(0.72rem,  1.5vw, 0.875rem);
          --text-base:clamp(0.82rem,  1.8vw, 1rem);
          --text-lg:  clamp(1rem,     2.2vw, 1.25rem);
          --text-xl:  clamp(1.1rem,   2.8vw, 1.5rem);
          --text-2xl: clamp(1.4rem,   3.5vw, 2rem);
          --text-hero:clamp(2rem,     6vw,   4.4rem);
        }

        /* ── base ── */
        .home-root {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          color: #fff;
          overflow-x: hidden;
          font-family: 'Syne', sans-serif;
          position: relative;
        }

        /* ── grain ── */
        .home-root::after {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          pointer-events: none; opacity: 0.022;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── ambient glows ── */
        .glow-top {
          position: fixed; top: -80px; left: 50%; transform: translateX(-50%);
          width: min(70%, 700px); height: 40vh; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse, rgba(245,158,11,0.065) 0%, transparent 68%);
        }
        .glow-bottom {
          position: fixed; bottom: 0; right: -5%;
          width: min(45%, 420px); height: 35vh; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse, rgba(56,189,248,0.045) 0%, transparent 68%);
        }

        /* ── shimmer screen ── */
        .shimmer-screen {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--bg); overflow: hidden;
          transition: opacity 0.3s;
          opacity: 0; pointer-events: none;
        }
        .shimmer-screen.visible { opacity: 1; pointer-events: auto; }
        .shimmer-sweep {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%);
          background-size: 250% 100%;
        }
        .shimmer-sweep.active { animation: shimmerSweep 0.7s ease forwards; }
        .shimmer-content {
          max-width: min(90%, 800px); margin: 0 auto;
          padding-top: 20vh; padding-left: 5%; padding-right: 5%;
          display: flex; flex-direction: column; gap: var(--sp-sm);
        }
        .shimmer-bar {
          height: clamp(12px, 2.5vh, 18px);
          border-radius: 10px; background: rgba(255,255,255,0.05);
          animation: pulse 1.5s ease-in-out infinite;
        }
        .w-80 { width: 80%; }
        .w-50 { width: 50%; }
        .w-65 { width: 65%; }
        .shimmer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--sp-sm); margin-top: var(--sp-lg);
        }
        .shimmer-card {
          height: clamp(80px, 15vh, 160px);
          border-radius: 16px; background: rgba(255,255,255,0.04);
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* ── AI popup ── */
        .popup-overlay {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          padding: 5%;
        }
        .popup-card {
          position: relative; width: 100%; max-width: min(90%, 440px);
          border-radius: clamp(16px, 3vw, 28px); overflow: hidden; color: #fff;
          background: linear-gradient(145deg, #0f0f0f, #1a1208);
          border: 1px solid rgba(245,158,11,0.25);
          box-shadow: 0 0 60px rgba(245,158,11,0.12), 0 20px 60px rgba(0,0,0,0.6);
        }
        .popup-glow-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #f59e0b, #fb923c, transparent);
        }
        .popup-orb {
          position: absolute; top: -10%; left: 50%; transform: translateX(-50%);
          width: 40%; padding-top: 40%; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
        }
        .popup-body {
          position: relative; padding: clamp(1.5rem, 5%, 2.5rem);
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--sp-md);
        }
        .popup-icon {
          width: clamp(48px, 8vw, 64px); height: clamp(48px, 8vw, 64px);
          border-radius: clamp(10px, 2vw, 16px);
          display: flex; align-items: center; justify-content: center;
          font-size: var(--text-xl);
          background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1));
          border: 1px solid rgba(245,158,11,0.3);
          box-shadow: 0 4px 20px rgba(245,158,11,0.2);
        }
        .popup-badge {
          font-size: var(--text-xs); font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          color: var(--amber);
        }
        .popup-title {
          font-size: var(--text-2xl); font-weight: 800;
          letter-spacing: -0.02em; line-height: 1.15;
        }
        .popup-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: var(--text-sm); color: rgba(255,255,255,0.4);
          line-height: 1.6; margin-top: 0.4em;
        }
        .popup-features { width: 100%; display: flex; flex-direction: column; gap: var(--sp-xs); text-align: left; }
        .popup-feature-item {
          display: flex; align-items: center; gap: var(--sp-sm);
          padding: clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px);
          border-radius: clamp(8px, 1.5vw, 12px);
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .popup-feature-icon { font-size: var(--text-base); }
        .popup-feature-text {
          font-family: 'DM Sans', sans-serif;
          font-size: var(--text-sm); color: rgba(255,255,255,0.6);
        }
        .popup-close-btn {
          width: 100%; padding: clamp(10px, 2vw, 14px) 0;
          border-radius: clamp(8px, 1.5vw, 12px);
          font-weight: 700; font-size: var(--text-sm);
          letter-spacing: 0.04em; cursor: pointer; border: none;
          background: linear-gradient(135deg, #f59e0b, #fb923c);
          color: #000; font-family: 'Syne', sans-serif;
          box-shadow: 0 4px 20px rgba(245,158,11,0.3);
          transition: transform 0.2s;
        }
        .popup-close-btn:hover { transform: scale(1.02); }
        .popup-close-btn:active { transform: scale(0.98); }

        /* ── FAB ── */
        .ai-fab {
          position: fixed; bottom: 5%; right: 4%; z-index: 200;
          width: clamp(44px, 7vw, 56px); height: clamp(44px, 7vw, 56px);
          border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--amber), var(--orange));
          box-shadow: 0 4px 24px rgba(245,158,11,0.4), 0 2px 8px rgba(0,0,0,0.5);
          transition: transform 0.3s cubic-bezier(.22,.68,0,1.3), box-shadow 0.3s;
        }
        .ai-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 36px rgba(245,158,11,0.6);
        }
        .fab-ping {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(245,158,11,0.3);
          animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        }

        /* ── mobile drawer ── */
        .drawer {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(8,8,8,0.97);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: clamp(1.5rem, 5vh, 2.5rem);
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.1);
          transform: translateX(-100%);
        }
        .drawer.open { transform: translateX(0); }
        .drawer-close {
          position: absolute; top: 4%; right: 5%;
          background: transparent; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); font-size: var(--text-xl);
          transition: color 0.2s;
        }
        .drawer-close:hover { color: #fff; }
        .drawer-link {
          font-size: clamp(1.6rem, 6vw, 2.2rem); font-weight: 800;
          letter-spacing: -0.02em; color: rgba(255,255,255,0.65);
          background: transparent; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif; transition: color 0.2s;
        }
        .drawer-link:hover { color: var(--amber); }
        .drawer-link-ai { color: var(--amber); }

        /* ── navbar ── */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1rem, 4%, 2.5rem);
          height: var(--nav-h);
          background: rgba(8,8,8,0.86);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .navbar-logo {
          display: flex; align-items: center; gap: clamp(6px, 1.5vw, 12px);
          cursor: pointer; text-decoration: none;
        }
        .navbar-logo img {
          height: clamp(30px, 5vw, 38px); width: clamp(30px, 5vw, 38px);
          border-radius: clamp(6px, 1vw, 10px);
        }
        .navbar-logo span {
          font-weight: 800; font-size: var(--text-base); letter-spacing: -0.02em;
        }
        .logo-accent { color: var(--amber); }
        .navbar-links {
          display: none;
          align-items: center; gap: clamp(1rem, 3vw, 2rem);
        }
        @media (min-width: 768px) { .navbar-links { display: flex; } }
        .nav-link {
          position: relative; color: rgba(255,255,255,0.5);
          font-size: var(--text-xs); letter-spacing: 0.1em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif; background: transparent; border: none;
          cursor: pointer; padding: 2px 0;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: ''; position: absolute; bottom: -2px; left: 0;
          height: 1px; width: 0; background: var(--amber);
          transition: width 0.2s;
        }
        .nav-link:hover { color: #fff; }
        .nav-link:hover::after { width: 100%; }
        .hamburger {
          display: flex; flex-direction: column; gap: 5px;
          background: transparent; border: none; cursor: pointer; padding: 4px;
        }
        @media (min-width: 768px) { .hamburger { display: none; } }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: rgba(255,255,255,0.65); border-radius: 2px;
        }

        /* ── hero ── */
        .hero {
          position: relative; z-index: 10;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: var(--sp-2xl) 5% var(--sp-xl);
          margin-top: calc(var(--nav-h) * -1);
          padding-top: calc(var(--nav-h) + var(--sp-xl));
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px; margin-bottom: var(--sp-md);
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          color: var(--amber); font-family: 'DM Sans', sans-serif;
          font-size: var(--text-xs); letter-spacing: 0.07em; text-transform: uppercase;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--amber); animation: pulse 1.5s ease-in-out infinite;
        }
        .hero-title {
          font-size: var(--text-hero); font-weight: 800;
          line-height: 1.07; letter-spacing: -0.035em;
          max-width: min(90%, 680px);
        }
        .hero-gradient {
          background: linear-gradient(90deg, var(--amber), var(--orange));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }

        /* ── cards section ── */
        .cards-section {
          position: relative; z-index: 10;
          padding: 0 5% var(--sp-xl);
          margin-top: calc(var(--sp-md) * -1);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
          gap: clamp(0.75rem, 2vw, 1.25rem);
          max-width: min(90%, 900px); margin: 0 auto;
        }
        .tcard {
          position: relative; overflow: hidden; text-align: left;
          width: 100%; border-radius: clamp(14px, 2.5vw, 20px);
          padding: clamp(1rem, 3%, 1.5rem);
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(.22,.68,0,1.15), border-color 0.25s, box-shadow 0.3s;
        }
        .tcard:hover { transform: translateY(-5px) scale(1.015); }
        .card-glow {
          position: absolute; top: 0; right: 0;
          width: 30%; padding-top: 30%; border-radius: 50%; pointer-events: none;
          animation: glowPulse 3.2s ease-in-out infinite;
        }
        .card-tag {
          display: inline-block; font-size: var(--text-xs);
          padding: 3px 10px; border-radius: 100px;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.05em;
          margin-bottom: clamp(8px, 1.5vw, 14px);
        }
        .card-icon { margin-bottom: clamp(6px, 1.5vw, 10px); }
        .card-name {
          font-weight: 700; letter-spacing: -0.02em;
          font-size: var(--text-base); margin-bottom: 6px;
        }
        .card-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: var(--text-xs); color: rgba(255,255,255,0.4);
          line-height: 1.6;
        }
        .card-cta {
          margin-top: clamp(10px, 2vw, 16px);
          font-family: 'DM Sans', sans-serif; font-size: var(--text-xs);
        }

        /* ── AI banner ── */
        .ai-banner-section {
          position: relative; z-index: 10;
          max-width: min(90%, 900px); margin: 0 auto;
          padding: 0 5% var(--sp-xl);
        }
        .ai-banner {
          border-radius: clamp(14px, 2.5vw, 20px);
          padding: clamp(1.25rem, 4%, 2.25rem);
          display: flex; flex-wrap: wrap;
          align-items: center; justify-content: space-between;
          gap: var(--sp-md);
          background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(249,115,22,0.05));
          border: 1px solid rgba(245,158,11,0.14);
        }
        .banner-title {
          font-weight: 700; font-size: var(--text-lg); letter-spacing: -0.02em; margin-bottom: 6px;
        }
        .banner-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: var(--text-sm); color: rgba(255,255,255,0.4);
        }
        .banner-btn {
          flex-shrink: 0;
          padding: clamp(8px, 1.5vw, 12px) clamp(1rem, 3vw, 1.5rem);
          border-radius: clamp(8px, 1.5vw, 12px);
          background: linear-gradient(135deg, var(--amber), var(--orange));
          border: none; color: #000; font-weight: 700;
          font-size: var(--text-sm); font-family: 'Syne', sans-serif;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 4px 18px rgba(245,158,11,0.28);
          transition: transform 0.2s;
        }
        .banner-btn:hover { transform: scale(1.05); }

        /* ── fade-up animation ── */
        .fade-up { opacity: 0; transform: translateY(22px); }
        .mounted .fade-up { animation: fadeUp 0.65s ease forwards; }
        .d1 { animation-delay: 0.04s; }
        .d2 { animation-delay: 0.11s; }
        .d3 { animation-delay: 0.32s; }
        .d4 { animation-delay: 0.44s; }

        /* ── keyframes ── */
        @keyframes shimmerSweep {
          0%   { background-position: 200% center; }
          100% { background-position: -100% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%     { opacity: 0.72; transform: scale(1.1); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* ambient glows */}
      <div className="glow-top" />
      <div className="glow-bottom" />

      <ShimmerScreen visible={shimming} />
      {aiPopup && <AIChatPopup onClose={() => setAiPopup(false)} />}

      {/* mobile drawer */}
      <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        {travelCards.map(c => (
          <button key={c.name} className="drawer-link" onClick={() => go(c.path)}>{c.name}</button>
        ))}
        <button className="drawer-link drawer-link-ai" onClick={() => go('/ai')}>✦ AI Chat</button>
      </div>

      {/* navbar */}
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => go('/')}>
          <img src="https://cdn-icons-png.flaticon.com/128/2200/2200326.png" alt="logo" />
          <span>Tripping<span className="logo-accent">BUDDY</span></span>
        </div>
        <div className="navbar-links">
          {travelCards.map(c => (
            <button key={c.name} className="nav-link" onClick={() => go(c.path)}>{c.name}</button>
          ))}
        </div>
        <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* hero */}
      <section className="hero">
        <div className="fade-up d1 hero-badge">
          <span className="badge-dot" />
          AI-Powered Travel Planning
        </div>
        <h1 className="fade-up d2 hero-title">
          Your Smarter<br />
          <span className="hero-gradient">Journey Starts Here</span>
        </h1>
      </section>

      {/* cards */}
      <section className="fade-up d3 cards-section">
        <div className="cards-grid">
          {travelCards.map((card, i) => (
            <button
              key={card.name}
              className="tcard"
              onClick={() => go(card.path)}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 14px 44px ${card.accent}1a`;
                e.currentTarget.style.borderColor = `${card.accent}2e`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <div
                className="card-glow"
                style={{
                  background: `radial-gradient(circle,${card.accent}1c,transparent 68%)`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
              <span
                className="card-tag"
                style={{
                  background: `${card.accent}16`, color: card.accent,
                  border: `1px solid ${card.accent}28`,
                }}
              >
                {card.tag}
              </span>
              <div className="card-icon">{card.icon}</div>
              <div className="card-name">{card.name}</div>
              <p className="card-desc">{card.desc}</p>
              <div className="card-cta" style={{ color: card.accent }}>Explore →</div>
            </button>
          ))}
        </div>
      </section>

      {/* AI banner */}
      <section className="fade-up d4 ai-banner-section">
        <div className="ai-banner">
          <div>
            <div className="banner-title">Not sure where to start?</div>
            <p className="banner-desc">Let AI suggest routes, compare prices & build your full itinerary in seconds.</p>
          </div>
          <button className="banner-btn" onClick={() => go('/ai')}>✦ Chat with AI</button>
        </div>
      </section>

      <AIFab onClick={() => go('/ai')} />
    </div>
  );
};

/* ── routes ── */
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/railway" element={<Rail />} />
    <Route path="/railway/:trainId/:dateParam" element={<LiveStatus />} />
    <Route path="/railway/:find/:fromstation/:tostation" element={<Trainbtwstation />} />
    <Route path="/railway/:livemap" element={<Livetrainmap />} />
    <Route path="/railway/pnrstatus/:pnr" element={<Pnr />} />
    <Route path="/railway/tickets/bookings/true" element={<BookTicket />} />
    <Route path="/flights" element={<Flight />} />
    <Route path="/flight/map" element={<FlightMAP />} />
    <Route path="/flights/livestatus/:flightNumber" element={<FlightLiveStatus />} />
    <Route path="/hotel" element={<Hotelpage />} />
    <Route path="/hotel/:hotelid/:checkin/:checkout/:adults/:children" element={<Hotelmoredetails />} />
    <Route path="/ai" element={<AIchat />} />
    <Route path="hotels/search/:country/:city/:adults/:children/:checkin/:checkout" element={<Hotelcard />} />
  </Routes>
);

export default AppRoutes;