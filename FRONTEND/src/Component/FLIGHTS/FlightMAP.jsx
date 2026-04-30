import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

/* ─── SHIMMER SCREEN ─────────────────────────────────────────────────────── */
const ShimmerScreen = ({ visible }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#080808', overflow: 'hidden',
      transition: 'opacity 0.3s',
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? 'auto' : 'none',
    }}
  >
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%)',
        backgroundSize: '250% 100%',
        animation: visible ? 'shimmerSweep 1.4s ease-in-out infinite' : 'none',
      }}
    />
    {/* Responsive skeleton */}
    <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 'clamp(64px, 10vw, 96px)', padding: '0 16px' }}>
      <div style={{ height: 'clamp(32px, 5vw, 44px)', width: '80%', borderRadius: 12, background: 'rgba(255,255,255,0.05)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 16, width: '50%', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: 16, width: '65%', borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 'clamp(100px, 15vw, 160px)', borderRadius: 16, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── 1. ICON CACHE ────────────────────────────────────────────────────────────
const iconCache = {};
const getRotatedPlaneIcon = (angle, color = "#facc15", altitude = 0) => {
    const roundedAngle = Math.round(angle || 0) % 360;
    const size = altitude > 10000 ? 30 : altitude > 4000 ? 26 : 22;
    const cacheKey = `${roundedAngle}-${color}-${size}`;
    if (iconCache[cacheKey]) return iconCache[cacheKey];
    const icon = new L.divIcon({
        className: 'smooth-plane-icon',
        html: `
        <div style="transform:rotate(${roundedAngle}deg);transform-origin:center;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0px 3px 6px rgba(0,0,0,0.5));">
            <svg viewBox="0 0 24 24" width="${size}" height="${size}">
                <path d="M12 1 L14 8 L21 10 L21 13 L14 12 L13 22 L11 22 L10 12 L3 13 L3 10 L10 8 Z" fill="${color}" />
            </svg>
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
    iconCache[cacheKey] = icon;
    return icon;
};

// ─── 2. CATEGORIZATION ────────────────────────────────────────────────────────
const getFlightDetails = (isGrounded, altitude) => {
    if (isGrounded) return { category: 'On Ground', color: '#f59e0b' };
    if (altitude < 4000) return { category: 'Ascending/Descending', color: '#22c55e' };
    return { category: 'Cruising', color: '#3b82f6' };
};

// ─── 3. DEAD RECKONING ────────────────────────────────────────────────────────
const calculateEstimatedPosition = (lat, lng, headingDegrees, speedMps, timeElapsedSeconds) => {
    if (!lat || !lng || !speedMps || headingDegrees === null) return { lat, lng };
    const R = 6371000;
    const distance = speedMps * timeElapsedSeconds;
    const lat1 = lat * (Math.PI / 180);
    const lng1 = lng * (Math.PI / 180);
    const brng = headingDegrees * (Math.PI / 180);
    let lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) + Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
    let lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1), Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
    return { lat: lat2 * (180 / Math.PI), lng: lng2 * (180 / Math.PI) };
};

// ─── 4. SMART LAYER ───────────────────────────────────────────────────────────
function SmartFlightLayer({ flights }) {
    const map = useMap();
    const [visibleFlights, setVisibleFlights] = useState([]);

    const updateLayer = useCallback(() => {
        if (!map || !flights) return;
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        const onScreen = flights.filter(f => bounds.contains([f.lat, f.lng]));
        let step;
        if (zoom <= 3) step = 20;
        else if (zoom <= 5) step = 10;
        else if (zoom <= 7) step = 5;
        else if (zoom <= 9) step = 2;
        else step = 1;
        const sampled = onScreen.filter((_, i) => i % step === 0);
        setVisibleFlights(sampled);
    }, [map, flights]);

    useMapEvents({ moveend: updateLayer, zoomend: updateLayer });
    useEffect(() => { updateLayer(); }, [updateLayer, flights]);

    return (
        <>
            {visibleFlights.map((flight) => (
                <Marker key={flight.id} position={[flight.lat, flight.lng]} icon={getRotatedPlaneIcon(flight.angle, flight.color, flight.altitude)}>
                    <Popup>
                        <div style={{ fontFamily: 'sans-serif' }}>
                            <strong style={{ color: flight.color }}>{flight.callsign}</strong><br />
                            <small>{flight.category}</small>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

// ─── 5. MAIN COMPONENT ────────────────────────────────────────────────────────
export default function FlightMAP() {
    const [apiFlights, setApiFlights] = useState([]);
    const [lastApiUpdateTime, setLastApiUpdateTime] = useState(Date.now());
    const [interpolatedFlights, setInterpolatedFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState(['Cruising', 'Ascending/Descending', 'On Ground']);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shimmer, setShimmer] = useState(false);

    /* Show shimmer briefly when opening map for the first time */
    const handleMenuToggle = () => {
        if (!isMenuOpen) {
            // Only shimmer on initial load / first open if flights are loading
            setIsMenuOpen(true);
        } else {
            setIsMenuOpen(false);
        }
    };

    // Shimmer on initial page load until data arrives
    useEffect(() => {
        setShimmer(true);
    }, []);

    // ── Fetch from backend every 60s
    useEffect(() => {
        const fetchFromBackend = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/flights');
                const rawData = res.data.data || [];
                const formatted = rawData
                    .filter(state => state[5] !== null && state[6] !== null)
                    .map((state) => {
                        const icao24    = state[0];
                        const callsign  = (state[1] || 'Unknown').trim();
                        const country   = state[2];
                        const lng       = state[5];
                        const lat       = state[6];
                        const altitude  = state[7] || state[13] || 0;
                        const isGrounded = state[8];
                        const velocity  = state[9] || 0;
                        const angle     = state[10] || 0;
                        const { category, color } = getFlightDetails(isGrounded, altitude);
                        return { id: icao24, callsign, country, lat, lng, altitude, velocity, angle, category, color };
                    });
                setApiFlights(formatted);
                setLastApiUpdateTime(Date.now());
                setLoading(false);
                setShimmer(false); // hide shimmer once data is ready
            } catch (e) {
                console.error("Backend fetch error. Make sure your Node server is running on port 5000!", e);
                setLoading(false);
                setShimmer(false);
            }
        };
        fetchFromBackend();
        const timer = setInterval(fetchFromBackend, 60000);
        return () => clearInterval(timer);
    }, []);

    // ── Dead reckoning every 1s
    useEffect(() => {
        if (apiFlights.length === 0) return;
        const animationTimer = setInterval(() => {
            const now = Date.now();
            const secondsElapsed = (now - lastApiUpdateTime) / 1000;
            const moved = apiFlights.map(flight => {
                const newPos = calculateEstimatedPosition(flight.lat, flight.lng, flight.angle, flight.velocity, secondsElapsed);
                return { ...flight, lat: newPos.lat, lng: newPos.lng };
            });
            setInterpolatedFlights(moved);
        }, 1000);
        return () => clearInterval(animationTimer);
    }, [apiFlights, lastApiUpdateTime]);

    const filteredFlights = interpolatedFlights.filter(f => selectedFilters.includes(f.category));

    const toggleFilter = (val) => {
        setSelectedFilters(prev => prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]);
    };

    const filterOptions = [
        { label: 'Cruising',             val: 'Cruising',             color: '#3b82f6' },
        { label: 'Ascending/Descending', val: 'Ascending/Descending', color: '#22c55e' },
        { label: 'On Ground',            val: 'On Ground',            color: '#f59e0b' },
    ];

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

            {/* Shimmer overlay */}
            <ShimmerScreen visible={shimmer} />

            <MapContainer center={[22.59, 78.96]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SmartFlightLayer flights={filteredFlights} />
            </MapContainer>

            {/* Toggle button — responsive positioning */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                    position: 'absolute',
                    bottom: 'clamp(16px, 4vw, 30px)',
                    right: 'clamp(12px, 3vw, 20px)',
                    zIndex: 1001,
                    background: '#fff', border: '1px solid #ddd',
                    borderRadius: '50px',
                    padding: 'clamp(8px, 2vw, 12px) clamp(14px, 3vw, 24px)',
                    fontWeight: 'bold', cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: '0.3s ease',
                    fontSize: 'clamp(12px, 2vw, 14px)',
                }}
            >
                <span style={{ fontSize: 'clamp(14px, 3vw, 18px)' }}>{isMenuOpen ? '✕' : '✈️'}</span>
                <span>{isMenuOpen ? 'Hide Filters' : 'Filter Flights'}</span>
            </button>

            {/* Filter menu — responsive width */}
            {isMenuOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: 'clamp(60px, 12vw, 85px)',
                    right: 'clamp(12px, 3vw, 20px)',
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: 'clamp(12px, 2vw, 16px)',
                    borderRadius: '24px',
                    border: '1px solid #eee',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    width: 'clamp(200px, 50vw, 240px)',
                }}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#aaa', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
                        FLIGHT PHASES
                    </div>

                    {filterOptions.map(f => {
                        const isChecked = selectedFilters.includes(f.val);
                        return (
                            <button
                                key={f.val}
                                onClick={() => toggleFilter(f.val)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 'clamp(8px, 1.5vw, 10px) 14px',
                                    border: 'none', borderRadius: '14px', cursor: 'pointer',
                                    background: isChecked ? `${f.color}15` : 'transparent',
                                    transition: '0.2s all',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: f.color }} />
                                    <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: isChecked ? '#000' : '#888', fontWeight: isChecked ? '700' : '400' }}>
                                        {f.label}
                                    </span>
                                </div>
                                <div style={{
                                    width: '18px', height: '18px', borderRadius: '6px',
                                    border: `2px solid ${isChecked ? f.color : '#ddd'}`,
                                    background: isChecked ? f.color : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: '11px', transition: '0.2s',
                                }}>
                                    {isChecked ? '✓' : ''}
                                </div>
                            </button>
                        );
                    })}

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                        <button
                            onClick={() => setSelectedFilters(['Cruising', 'Ascending/Descending', 'On Ground'])}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => setSelectedFilters([])}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{
                    position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'white',
                    padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                    borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 'bold',
                }}>
                    Loading Live Airspace...
                </div>
            )}

            <style>{`
                .smooth-plane-icon { transition: transform 1s linear !important; will-change: transform; }
                @keyframes shimmerSweep {
                    0%   { background-position: -250% 0; }
                    100% { background-position: 250% 0; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
