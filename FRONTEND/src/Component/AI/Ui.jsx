import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/ai/chat';
const HOTEL_API = 'http://localhost:5000/api/hotels';

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function HotelCard({ hotel, rateInfo }) {
    const cheapestRate = rateInfo?.roomTypes?.[0]?.rates?.[0];
    return (
        <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '14px', padding: '14px', marginBottom: '10px', transition: 'border-color 0.2s'
        }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(106,74,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e8e6f0', marginBottom: '4px' }}>{hotel.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>📍 {hotel.address || hotel.cityName}</div>
                    {hotel.starRating && (
                        <div style={{ fontSize: '12px', color: '#f4c542' }}>
                            {'★'.repeat(Math.round(hotel.starRating))}{'☆'.repeat(5 - Math.round(hotel.starRating))}
                        </div>
                    )}
                </div>
                {cheapestRate ? (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: '#a882ff' }}>₹{Math.round(cheapestRate.finalRate).toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>per night</div>
                    </div>
                ) : (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>No rates</div>
                )}
            </div>
        </div>
    );
}

function HotelSearchPanel({ onClose }) {
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('IN');
    const [checkin, setCheckin] = useState('');
    const [checkout, setCheckout] = useState('');
    const [adults, setAdults] = useState(1);
    const [hotels, setHotels] = useState([]);
    const [rates, setRates] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const searchHotels = async () => {
        if (!city.trim()) { setError('Please enter a city.'); return; }
        if (!checkin || !checkout) { setError('Please select check-in and check-out dates.'); return; }
        if (checkin >= checkout) { setError('Check-out must be after check-in.'); return; }
        setError(''); setLoading(true); setHotels([]); setRates({}); setSearched(true);
        try {
            const { data: hotelData } = await axios.get(`${HOTEL_API}/search`, {
                params: { city: city.trim(), country, limit: 10, offset: 0 }
            });
            const hotelList = hotelData.data || [];
            setHotels(hotelList);
            if (hotelList.length > 0) {
                const hotelIds = hotelList.map(h => h.id);
                const { data: rateData } = await axios.post(`${HOTEL_API}/rates`, {
                    hotelIds, checkin, checkout, adults: parseInt(adults) || 1
                });
                const rateMap = {};
                (rateData.data || []).forEach(r => { rateMap[r.hotelId] = r; });
                setRates(rateMap);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch hotels. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '9px 12px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e8e6f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
    };
    const labelStyle = { fontSize: '11px', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.6px' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
            <div style={{ background: '#13121e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 700 }}>🏨 Search Hotels</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '20px', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={labelStyle}>City</label>
                            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai" style={inputStyle} onKeyDown={e => e.key === 'Enter' && searchHotels()} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Country</label>
                            <input value={country} onChange={e => setCountry(e.target.value.toUpperCase())} placeholder="IN" maxLength={2} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Check-in</label>
                            <input type="date" value={checkin} min={today} onChange={e => setCheckin(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Check-out</label>
                            <input type="date" value={checkout} min={checkin || today} onChange={e => setCheckout(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    <div style={{ width: '120px' }}>
                        <label style={labelStyle}>Adults</label>
                        <input type="number" value={adults} min={1} max={10} onChange={e => setAdults(e.target.value)} style={inputStyle} />
                    </div>
                </div>
                {error && <p style={{ color: '#ff6b6b', fontSize: '13px', margin: '0 0 12px', background: 'rgba(255,107,107,0.08)', padding: '8px 12px', borderRadius: '8px' }}>{error}</p>}
                <button onClick={searchHotels} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #534AB7, #7B5FDD)', color: loading ? 'rgba(255,255,255,0.3)' : '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '16px', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {loading ? '🔍 Searching…' : 'Search Hotels'}
                </button>
                {loading && <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Finding hotels in {city}…</div>}
                {!loading && searched && hotels.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No hotels found in {city}. Try a different city or country code.</div>}
                {!loading && hotels.length > 0 && (
                    <>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '0 0 10px' }}>{hotels.length} hotels found in {city}</p>
                        {hotels.map(h => <HotelCard key={h.id} hotel={h} rateInfo={rates[h.id]} />)}
                    </>
                )}
            </div>
        </div>
    );
}

export default function AIChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [showHotelPanel, setShowHotelPanel] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const suggestions = [
        { icon: '🚆', text: 'Trains from NDLS to BCT' },
        { icon: '📋', text: 'Check PNR 1234567890' },
        { icon: '🏨', text: 'Search hotels near me' },
        { icon: '🔴', text: 'Live status of 12301' },
    ];

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const clearChat = () => { setMessages([]); setHistory([]); setShowSuggestions(true); };

    const handleSuggestionClick = (text) => {
        if (text.toLowerCase().includes('hotel')) { setShowHotelPanel(true); }
        else { sendMessage(text); }
    };

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return;
        setShowSuggestions(false);
        const now = new Date().toISOString();
        setMessages(prev => [...prev, { role: 'user', text, time: now }]);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setLoading(true);
        try {
            const { data } = await axios.post(API, { question: text, history });
            setMessages(prev => [...prev, { role: 'assistant', text: data.answer, time: new Date().toISOString() }]);
            setHistory(data.history);
        } catch (err) {
            const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
            setMessages(prev => [...prev, { role: 'assistant', text: msg, time: new Date().toISOString() }]);
        } finally {
            setLoading(false);
        }
    };

    const isEmpty = messages.length === 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0f', color: '#e8e6f0', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'fixed', top: '-200px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,74,255,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '-150px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,130,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {showHotelPanel && <HotelSearchPanel onClose={() => setShowHotelPanel(false)} />}

            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(135deg, #6a4aff, #a882ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✦</div>
                <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.3px', color: '#fff' }}>TravelAI</span>
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a882ff', animation: 'pulse 1s ease-in-out infinite' }} />
                        <span style={{ fontSize: '12px', color: '#a882ff' }}>Thinking…</span>
                    </div>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowHotelPanel(true)} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(106,74,255,0.25)', background: 'rgba(106,74,255,0.1)', color: '#a882ff', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(106,74,255,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(106,74,255,0.1)'}>🏨 Hotels</button>
                    {!isEmpty && (
                        <button onClick={clearChat} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>Clear</button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isEmpty ? '0' : '24px 0 8px', position: 'relative', zIndex: 1 }}>
                {isEmpty && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '40px 24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(106,74,255,0.3), rgba(168,130,255,0.15))', border: '1px solid rgba(106,74,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✦</div>
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.5px', color: '#fff' }}>Where to next?</h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Ask me about trains, hotels, flights, or PNR status</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} style={{ maxWidth: '760px', margin: '0 auto', padding: '4px 24px', display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg, #534AB7, #7B5FDD)' : 'linear-gradient(135deg, rgba(106,74,255,0.2), rgba(168,130,255,0.1))', border: msg.role === 'user' ? 'none' : '1px solid rgba(106,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: msg.role === 'user' ? '11px' : '14px', fontWeight: 600, color: msg.role === 'user' ? '#fff' : '#a882ff', marginTop: '2px' }}>
                            {msg.role === 'user' ? 'You' : '✦'}
                        </div>
                        <div style={{ maxWidth: '78%' }}>
                            <div style={{ padding: '11px 16px', borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px', background: msg.role === 'user' ? 'linear-gradient(135deg, #534AB7, #6A4AFF)' : 'rgba(255,255,255,0.04)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)', fontSize: '14px', lineHeight: 1.65, whiteSpace: 'pre-wrap', color: msg.role === 'user' ? '#fff' : '#ddd8f8' }}>
                                {msg.text}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'assistant' ? '4px' : '0' }}>
                                {formatTime(msg.time)}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ maxWidth: '760px', margin: '4px auto', padding: '4px 24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0, background: 'linear-gradient(135deg, rgba(106,74,255,0.2), rgba(168,130,255,0.1))', border: '1px solid rgba(106,74,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#a882ff' }}>✦</div>
                        <div style={{ padding: '14px 18px', borderRadius: '4px 18px 18px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                            {[0, 150, 300].map(delay => (
                                <div key={delay} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(168,130,255,0.5)', animation: `bounce 1.2s ${delay}ms ease-in-out infinite` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} style={{ height: '8px' }} />
            </div>

            

            {/* Input */}
            <div style={{ padding: '12px 24px 16px', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.04)', zIndex: 1 }}>
                <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '10px 10px 10px 16px' }}>
                    <textarea ref={textareaRef} value={input} rows={1}
                        onChange={e => { setInput(e.target.value); autoResize(); }}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Ask about trains, hotels, flights…"
                        style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', color: '#e8e6f0', fontSize: '14px', outline: 'none', lineHeight: 1.6, fontFamily: 'inherit', maxHeight: '120px', overflowY: 'auto', caretColor: '#a882ff' }}
                    />
                    <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: input.trim() && !loading ? 'linear-gradient(135deg, #534AB7, #7B5FDD)' : 'rgba(255,255,255,0.06)', border: 'none', color: input.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.2)', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' }}>➤</button>
                </div>
                <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: '8px 0 0' }}>TravelAI can make mistakes. Verify important info.</p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
                @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
                @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
            `}</style>
        </div>
    );
}