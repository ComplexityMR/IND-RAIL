import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Check, ChevronRight, Star, Users,
  Maximize, BedDouble, User, Baby, AlignLeft, Camera, Grid
} from "lucide-react";
// Add ZoomControl to this import line
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
// --- LEAFLET MAP IMPORTS ---

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon missing in React-Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- NEW COMPONENT FOR SHIMMER EFFECT ---
// Helper component to dynamically toggle map interactions
const MapInteractionController = ({ isActive }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isActive) {
      map.scrollWheelZoom.enable();
      map.dragging.enable();
      map.doubleClickZoom.enable();
    } else {
      map.scrollWheelZoom.disable();
      map.dragging.disable();
      map.doubleClickZoom.disable();
    }
  }, [isActive, map]);

  return null;
};

const ImageWithShimmer = ({ src, alt, imgClass, caption }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-slate-800">
      {!loaded && (
        <div className="absolute inset-0 bg-slate-700 animate-pulse"></div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${imgClass} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
      />
      {caption && (
        <div className={`absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform ${loaded ? 'opacity-100' : 'opacity-0'}`}>
          <span className="text-xs font-medium text-slate-200 capitalize tracking-wide drop-shadow-md">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};

const Hotelmoredetails = () => {
  const { hotelid, checkin, checkout, adults, children } = useParams();

  let totalNights = 1;
  if (checkin && checkout && checkin !== "Any" && checkout !== "Any") {
    const date1 = new Date(checkin);
    const date2 = new Date(checkout);
    if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
      const diffInMilliseconds = Math.abs(date2 - date1);
      const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
      totalNights = diffInDays > 0 ? diffInDays : 1;
    }
  }

  const [liveRooms, setLiveRooms] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // --- REVIEWS STATE ---
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // --- MAP STATE ---
  const [showMap, setShowMap] = useState(false);

  // Modals state
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [selectedRoomForFacilities, setSelectedRoomForFacilities] = useState(null);
  const [selectedRoomForDescription, setSelectedRoomForDescription] = useState(null);
  const [selectedRoomForGallery, setSelectedRoomForGallery] = useState(null);

  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hotelDetails/${hotelid}`);
        setHotel(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();

    const fetchRates = async () => {
      if (checkin && checkout && checkin !== "Any" && checkout !== "Any") {
        try {
          setRatesLoading(true);
          const payload = {
            hotelId: hotelid,
            checkin: checkin,
            checkout: checkout,
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0
          };
          const ratesRes = await axios.post(`http://localhost:5000/api/hotels/hotelRates`, payload);
          if (ratesRes.data.success) {
            setLiveRooms(ratesRes.data.rates);
          }
        } catch (err) {
          console.error("Rates fetch error:", err);
        } finally {
          setRatesLoading(false);
        }
      }
    };
    fetchRates();

    // --- REVIEWS FETCH ---
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/hotelReviews/${hotelid}`);
        if (res.data.success && res.data.data?.data) {
          setReviews(res.data.data.data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();

  }, [hotelid, checkin, checkout, adults, children]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-50"></div>
    </div>
  );

  if (!hotel?.data) return (
    <div className="h-screen bg-[#0B0F19] flex items-center justify-center text-slate-400">
      Hotel not found.
    </div>
  );

  const d = hotel.data;
  const rooms = d.rooms || [];

  const displayRoom = rooms[0] || {};
  const roomAmenities = displayRoom.roomAmenities || [];

  const importantInfo = (d.hotelImportantInformation || "").replace(/<[^>]+>/g, "");
  const desc = (d.hotelDescription || "").replace(/<[^>]+>/g, "");
  const plainText = `${desc} ${importantInfo}`.trim();
  const policyPoints = (() => {
    const div = document.createElement("div");
    div.innerHTML = d.hotelImportantInformation || "";
    const items = div.querySelectorAll("li, p, dt, dd");
    if (items.length > 0) {
      return Array.from(items).map(el => el.textContent.trim()).filter(Boolean);
    }
    return (d.hotelImportantInformation || "")
      .replace(/\r/g, "")
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.startsWith("*"))
      .map(line => line.replace(/^\*\s*/, ""));
  })();

  const fallbackHotelImage = d.main_photo || d.hotelImages?.[0]?.urlHd || d.hotelImages?.[0]?.url;

  // Compile full hotel address
  const hotelAddress = [d.address, d.city, d.state, d.country, d.zip || d.postalCode]
    .filter(Boolean)
    .join(", ") || "Address not available";

  // --- DEDUPLICATION LOGIC ---
  const uniqueRoomsMap = new Map();

  liveRooms.forEach(liveRoom => {
    const rateData = liveRoom.rates?.[0] || {};
    const uniqueKey = rateData.mappedRoomId ? String(rateData.mappedRoomId) : (rateData.name || liveRoom.name);

    const price = liveRoom.suggestedSellingPrice?.amount
      || liveRoom.offerRetailRate?.amount
      || rateData.retailRate?.suggestedSellingPrice?.[0]?.amount
      || rateData.retailRate?.total?.[0]?.amount
      || 9999999;

    if (!uniqueRoomsMap.has(uniqueKey)) {
      uniqueRoomsMap.set(uniqueKey, { room: liveRoom, price: price });
    } else {
      if (price < uniqueRoomsMap.get(uniqueKey).price) {
        uniqueRoomsMap.set(uniqueKey, { room: liveRoom, price: price });
      }
    }
  });

  const displayLiveRooms = Array.from(uniqueRoomsMap.values()).map(item => item.room);

  // Filter reviews to only show those with text (headline, pros, or cons) and limit to 5
  const displayReviews = reviews
    .filter(review => review.headline?.trim() || review.pros?.trim() || review.cons?.trim())
    .slice(0, 5);

  return (
    <>
      {/* Custom Styles for Modal Transitions */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-enter {
          animation: fadeInScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <div className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans pb-20 selection:bg-indigo-500/30">

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">

          {/* TITLE & STARS */}
          <h1 className="text-left text-2xl md:text-4xl font-extrabold !text-amber-500/90 tracking-tight leading-tight drop-shadow-2xl mb-6 w-full flex items-center gap-3 md:gap-5 flex-wrap mt-6">
            {d.name}
            <div className="flex gap-1 md:gap-2 pt-1 md:pt-2">
              {Array.from({ length: d.starRating }).map((_, i) => (
                <span key={i} className="text-yellow-700 text-lg md:text-xl drop-shadow-md">⭐</span>
              ))}
            </div>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">

            {/* ── LEFT (8 cols) ── */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Main Hotel Image Gallery - Responsive adjustments made here */}
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[250px] sm:h-[350px] md:h-[500px] rounded-2xl overflow-hidden w-full relative">
                <div className="col-span-1 md:col-span-3 md:row-span-2 relative group overflow-hidden bg-slate-800">
                  <img
                    src={d.hotelImages?.[activeImg]?.urlHd || d.main_photo}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 md:group-hover:scale-105 md:group-hover:opacity-100"
                    alt="Main hotel view"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/10 via-transparent to-[#0B0F19]/90 pointer-events-none" />

                  {/* Mobile Gallery Trigger */}
                  <div className="md:hidden absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => setShowGallery(true)} 
                      className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl"
                    >
                      <Camera size={14} /> View All {d.hotelImages?.length || 0}
                    </button>
                  </div>

                  <div className="hidden md:flex absolute bottom-4 left-4 gap-2 z-10">
                    {d.hotelImages?.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className="w-12 h-9 rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                        style={{ borderColor: activeImg === i ? "#6366f1" : "rgba(255,255,255,0.2)" }}
                      >
                        <img src={img.urlHd} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block col-span-1 row-span-1 relative group overflow-hidden bg-slate-800">
                  <img
                    src={d.hotelImages?.[1]?.urlHd}
                    className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100"
                    alt="Room view"
                  />
                </div>

                <div
                  className="hidden md:block col-span-1 row-span-1 relative group overflow-hidden bg-slate-800 cursor-pointer"
                  onClick={() => setShowGallery(true)}
                >
                  <img
                    src={d.hotelImages?.[2]?.urlHd}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    alt="More photos"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <div className="absolute bottom-3 right-4 flex flex-col items-end z-10">
                    <span className="text-2xl font-light text-white leading-none">+{(d.hotelImages?.length || 0) - 2}</span>
                    <span className="text-[10px] tracking-widest uppercase text-slate-300 font-bold mt-1">View All</span>
                  </div>
                </div>
              </div>

              {/* About Property */}
              <div className="bg-[#111827] p-5 md:p-8 rounded-2xl border border-slate-800/60 shadow-xl w-full">
                <h2 className="text-lg md:text-xl font-bold mb-4 text-white flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  About Property And Important Information
                </h2>
                <p className="text-slate-300 text-left font-semibold leading-relaxed text-sm md:text-[15px]">
                  {expanded ? plainText : plainText.slice(0, 200)}
                  {plainText.length > 200 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-indigo-400 font-semibold ml-2 hover:text-indigo-300 transition-colors whitespace-nowrap"
                    >
                      {expanded ? "Read less" : "Read more"}
                    </button>
                  )}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-[#111827] p-5 md:p-8 rounded-2xl border border-slate-800/60 shadow-xl w-full">
                <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-white flex items-center gap-3 flex-wrap">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  Property & Shared Amenities
                  <span className="text-xs text-slate-500 font-normal ml-0 md:ml-1">({roomAmenities.length} total)</span>
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {roomAmenities
                    .slice(0, showAllAmenities ? undefined : 8)
                    .map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 bg-[#1A233A] border border-slate-700/50 px-3 py-2 md:px-4 md:py-3 rounded-xl text-slate-300 hover:bg-[#1E293B] hover:border-indigo-500/30 transition-all cursor-default">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium">{amenity.name}</span>
                      </div>
                    ))}
                </div>
                {roomAmenities.length > 8 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-5 text-slate-400 text-sm font-medium hover:text-white transition-colors flex items-center gap-1"
                  >
                    {showAllAmenities ? "Show less" : `View all ${roomAmenities.length} amenities`}
                    <ChevronRight size={16} className={`transition-transform ${showAllAmenities ? "rotate-90" : ""}`} />
                  </button>
                )}
              </div>

              {d.facilities?.length > 0 && (
                <div className="bg-[#111827] p-5 md:p-8 rounded-2xl border border-slate-800/60 shadow-xl w-full">
                  <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-white flex items-center gap-3 flex-wrap">
                    <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                    Hotel Facilities
                    <span className="text-xs text-slate-500 font-normal ml-0 md:ml-1">Total {d.facilities.length} Facilities Available</span>
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {d.facilities.slice(0, 12).map((f, i) => (
                      <span key={i} className="text-xs bg-[#1A233A] border border-slate-700/40 text-slate-400 px-3 py-1.5 rounded-lg hover:border-purple-500/30 hover:text-slate-300 transition-all">
                        {f.name}
                      </span>
                    ))}
                  </div>
                  {d.facilities.length > 12 && (
                    <button
                      onClick={() => setShowFacilitiesModal(true)}
                      className="mt-5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      View all {d.facilities.length} Hotel facilities
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* ── RIGHT (4 cols): Booking Card ── */}
            <div className="lg:col-span-4">
              <div className="lg:sticky top-10 bg-gradient-to-b from-[#161F33] to-[#111827] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden w-full ">

                <div className="p-5 md:p-6 border-b border-slate-800/80">
                  <br className="hidden md:block"></br>

                  <div className="flex items-start gap-3 mb-5 bg-[#0B0F19] p-4 rounded-xl border border-slate-700/50">
                    <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                    <span className="text-sm font-medium text-emerald-500/100 leading-relaxed">{hotelAddress}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-[#0B0F19] border border-slate-700/50 rounded-xl p-3 md:p-4 relative overflow-hidden hover:border-emerald-500/40 transition-all group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-xl"></div>
                      <div className="pl-2">
                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Check-in</div>
                        <div className="text-white font-bold text-xs md:text-sm">{d.checkinCheckoutTimes?.checkin_start || "12:00pm"}</div>
                        {d.checkinCheckoutTimes?.checkin_end && (
                          <div className="text-slate-500 text-[9px] md:text-[10px] font-bold mt-0.5">Until {d.checkinCheckoutTimes.checkin_end}</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#0B0F19] border border-slate-700/50 rounded-xl p-3 md:p-4 relative overflow-hidden hover:border-rose-500/40 transition-all group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-xl"></div>
                      <div className="pl-2">
                        <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Check-out</div>
                        <div className="text-white font-bold text-xs md:text-sm">{d.checkinCheckoutTimes?.checkout || "11:00am"}</div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-4 md:p-6 bg-[#0B0F19]/50">
                  <div className="text-center mt-1 md:mt-2">
                    <button
                      onClick={() => setShowPolicy(true)}
                      className="text-xs text-slate-200 hover:text-indigo-400 transition-colors underline underline-offset-2"
                    >
                      Click Here For Hotel Policies
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ── FULL WIDTH BOTTOM SECTION: Available Rooms ── */}
            <div className="lg:col-span-12 mt-4">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-5 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                Available Rooms
              </h2>

              <div className="flex flex-col gap-5 w-full">

                {ratesLoading && (
                  <div className="text-slate-400 text-sm mb-2 animate-pulse">
                    Checking live availability and pricing for your dates...
                  </div>
                )}

                {!ratesLoading && displayLiveRooms.length === 0 && (
                  <div className="text-slate-500 text-center py-10 bg-[#111827] rounded-xl border border-slate-800/60 shadow-xl p-4">
                    No available rooms found for the selected dates.
                  </div>
                )}

                {displayLiveRooms.map((liveRoom, index) => {
                  const rateData = liveRoom.rates?.[0] || {};
                  const mappedId = rateData.mappedRoomId;

                  const staticDetails = rooms.find(r => String(r.id) === String(mappedId));

                  const boardName = rateData.boardName || "Room Only";
                  const includesBreakfast = boardName.toLowerCase().includes("breakfast");

                  const taxInfo = rateData.retailRate?.taxesAndFees?.[0] || {};
                  const taxAmount = taxInfo.amount || 0;

                  const cancelPolicy = rateData.cancellationPolicies?.cancelPolicyInfos?.[0] || null;
                  const cancelDate = cancelPolicy ? new Date(cancelPolicy.cancelTime).toLocaleDateString() : null;
                  const cancelFee = cancelPolicy ? cancelPolicy.amount : null;

                  const firstPhotoUrl = staticDetails?.photos?.length > 0
                    ? (staticDetails.photos[0].hd_url || staticDetails.photos[0].url || staticDetails.photos[0].failoverPhoto)
                    : fallbackHotelImage;

                  const photoCount = staticDetails?.photos ? staticDetails.photos.length : 0;

                  const roomName = staticDetails?.roomName || rateData.name || liveRoom.name || "Standard Room";
                  const descriptionStr = staticDetails?.description
                    ? staticDetails.description.replace(/<[^>]+>/g, "")
                    : "A comfortable room. Rate includes: " + (rateData.boardName || "Room Only");

                  let displayPrice = "Check";
                  let currencyCode = "INR";

                  if (liveRoom.suggestedSellingPrice?.amount) {
                    displayPrice = liveRoom.suggestedSellingPrice.amount;
                    currencyCode = liveRoom.suggestedSellingPrice.currency;
                  } else if (liveRoom.offerRetailRate?.amount) {
                    displayPrice = liveRoom.offerRetailRate.amount;
                    currencyCode = liveRoom.offerRetailRate.currency;
                  } else if (rateData.retailRate?.suggestedSellingPrice?.[0]?.amount) {
                    displayPrice = rateData.retailRate.suggestedSellingPrice[0].amount;
                    currencyCode = rateData.retailRate.suggestedSellingPrice[0].currency;
                  } else if (rateData.retailRate?.total?.[0]?.amount) {
                    displayPrice = rateData.retailRate.total[0].amount;
                    currencyCode = rateData.retailRate.total[0].currency;
                  }

                  const displayCurrency = currencyCode === 'INR' ? '₹' : currencyCode;
                  const isRefundable = rateData.cancellationPolicies?.refundableTag === "RFN";

                  const adCount = rateData.adultCount || adults;
                  const chCount = rateData.childCount || children;
                  const maxOcc = rateData.maxOccupancy || (parseInt(adCount) + parseInt(chCount));

                  const modalData = staticDetails ? { ...staticDetails, roomName } : { roomName, photos: [{ urlHd: fallbackHotelImage }], description: descriptionStr, roomAmenities: [] };

                  return (
                    <div key={liveRoom.roomTypeId || index} className="bg-[#111827] rounded-xl border border-slate-800/60 shadow-xl overflow-hidden flex flex-col md:flex-row w-full h-auto md:h-[300px] shrink-0 transition-all hover:border-slate-700 hover:shadow-indigo-500/10 hover:shadow-2xl">
                      {/* Fixed Height Issue: Changed from h-[650px] md:h-[300px] to h-auto md:h-[300px] safely moved inside div */}
                      <div
                        className="w-full md:w-[300px] h-48 sm:h-56 md:h-full relative group overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer"
                        onClick={() => setSelectedRoomForGallery(modalData)}
                      >
                        {firstPhotoUrl ? (
                          <>
                            <img
                              src={firstPhotoUrl}
                              alt={roomName}
                              className="w-full h-full object-cover transition-all duration-500 md:group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-3 right-4 flex flex-col items-end z-10">
                              <span className="text-xl md:text-2xl font-light text-white leading-none">+{(photoCount > 0 ? photoCount : 0)}</span>
                              <span className="text-[9px] md:text-[10px] tracking-widest uppercase text-slate-300 font-bold mt-1">View All</span>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-4 md:p-5 flex flex-col overflow-hidden">

                        <div className="flex justify-between items-start mb-2 shrink-0 gap-2">
                          <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 md:truncate">{roomName}</h3>
                        </div>

                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 text-[11px] md:text-xs text-slate-300 shrink-0">
                          {staticDetails?.roomSizeSquare && (
                            <span className="flex items-center gap-1 md:gap-1.5 bg-[#1A233A] px-2 py-1 md:py-1.5 rounded border border-slate-700/50 shadow-inner">
                              <Maximize size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                              {staticDetails.roomSizeSquare} {staticDetails.roomSizeUnit}
                            </span>
                          )}
                          <span className="flex items-center gap-1 md:gap-1.5 bg-[#1A233A] px-2 py-1 md:py-1.5 rounded border border-slate-700/50 shadow-inner">
                            <Users size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                            Max Occ: {maxOcc}
                          </span>
                          <span className="flex items-center gap-1 md:gap-1.5 bg-[#1A233A] px-2 py-1 md:py-1.5 rounded border border-slate-700/50 shadow-inner">
                            <User size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                            Adults: {adCount}
                          </span>
                          <span className="flex items-center gap-1 md:gap-1.5 bg-[#1A233A] px-2 py-1 md:py-1.5 rounded border border-slate-700/50 shadow-inner">
                            <Baby size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                            Children: {chCount}
                          </span>
                          {staticDetails?.bedTypes && staticDetails.bedTypes.length > 0 && (
                            <span className="flex items-center gap-1 md:gap-1.5 bg-[#1A233A] px-2 py-1 md:py-1.5 rounded border border-slate-700/50 shadow-inner">
                              <BedDouble size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                              {staticDetails.bedTypes[0]?.quantity}x {staticDetails.bedTypes[0]?.bedType}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:py-1.5 rounded border shadow-inner ${includesBreakfast ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-[#1A233A] text-slate-400 border-slate-700/50'}`}>
                            {includesBreakfast ? "Breakfast Included" : "No Breakfast"}
                          </span>
                          <span className={`flex items-center gap-1 md:gap-1.5 px-2 py-1 md:py-1.5 rounded border shadow-inner ${isRefundable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {isRefundable ? "Refundable" : "Non-Refundable"}
                          </span>
                        </div>

                        <div className="flex-1 min-h-0 overflow-hidden mb-1 flex flex-col justify-start">
                          <p className="text-slate-400 text-[13px] md:text-sm text-left leading-relaxed line-clamp-2 md:line-clamp-3">
                            {descriptionStr}
                          </p>
                        </div>

                        {descriptionStr.length > 100 && (
                          <button
                            onClick={() => setSelectedRoomForDescription(modalData)}
                            className="text-indigo-400 text-xs font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors shrink-0 w-max mb-2 py-1 md:py-0"
                          >
                            <AlignLeft size={13} /> Read full description
                          </button>
                        )}

                        <div className="min-h-[18px] shrink-0 mb-3 md:mb-2">
                          {isRefundable && cancelDate && (
                            <div className="text-[10px] md:text-[11px] text-emerald-500/80 italic line-clamp-2 md:line-clamp-1 w-full leading-snug">
                              Free cancellation until {cancelDate}. After this, fee is {displayCurrency}{cancelFee}.
                            </div>
                          )}
                        </div>

                        <div className="mt-auto shrink-0 pb-2 md:pb-0">
                          <button
                            onClick={() => setSelectedRoomForFacilities(modalData)}
                            className="text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 w-max transition-colors border border-slate-700"
                          >
                            View Room Amenities
                            <ChevronRight size={14} />
                          </button>
                        </div>

                      </div>

                      {/* Pricing Alignment Issue: Changed items-end to responsive items-start md:items-end */}
                      <div className="w-full md:w-64 p-5 md:p-6 bg-gradient-to-b from-[#0B0F19]/40 to-[#0B0F19]/80 border-t md:border-t-0 md:border-l border-slate-800/60 flex flex-col justify-center items-start md:items-end shrink-0 md:h-full">
                        <div className="text-left md:text-right w-full flex flex-col md:block">
                          <div className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 md:mb-1.5 order-2 md:order-1 mt-1 md:mt-0">
                            Total for {totalNights} Night{totalNights > 1 ? 's' : ''}
                          </div>

                          <div className="text-2xl md:text-3xl font-extrabold text-white flex items-end justify-start md:justify-end gap-1 mb-1 order-1 md:order-2">
                            <span className="text-base md:text-lg font-medium text-slate-400 mb-0.5 md:mb-0.5">{displayCurrency}</span>
                            {displayPrice}
                          </div>

                          <div className="text-[11px] md:text-xs text-slate-400 mt-0 md:mt-1 mb-2 md:mb-3 order-3">
                            Includes {displayCurrency}{taxAmount} in taxes & fees
                          </div>

                          <div className="text-[10px] md:text-xs text-emerald-400/90 font-bold bg-emerald-500/10 px-2 py-1 md:px-2.5 md:py-1.5 rounded inline-block w-max order-4">
                            Final Price (All inclusive)
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── GUEST REVIEWS SECTION ── */}
            <div className="lg:col-span-12 mt-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-5 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
                Guest Reviews
                {!reviewsLoading && displayReviews.length > 0 && (
                  <span className="text-xs md:text-sm text-slate-500 font-normal ml-0 md:ml-1">({displayReviews.length} featured)</span>
                )}
              </h2>

              {reviewsLoading ? (
                <div className="text-slate-400 text-sm animate-pulse bg-[#111827] p-4 md:p-5 rounded-xl border border-slate-800/60 shadow-xl max-w-4xl">
                  Loading guest reviews...
                </div>
              ) : displayReviews.length === 0 ? (
                <div className="text-slate-500 text-center py-8 md:py-10 bg-[#111827] rounded-xl border border-slate-800/60 shadow-xl max-w-4xl font-bold text-sm md:text-base px-4">
                  No written reviews available for this property yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:gap-5 max-w-4xl">
                  {displayReviews.map((review, i) => (
                    <div key={i} className="bg-[#111827] p-4 md:p-6 rounded-2xl border border-slate-800/60 shadow-xl hover:border-slate-700 transition-all flex flex-col md:flex-row gap-4 md:gap-8">

                      {/* Left Sidebar: Guest Info & Rating */}
                      <div className="flex flex-row md:flex-col justify-between md:justify-start md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-800/60 pb-4 md:pb-0 md:pr-6 items-center md:items-stretch">
                        <div className="flex items-center gap-3 md:items-start md:flex-col md:gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-base md:text-lg font-extrabold shadow-lg shrink-0">
                            {review.name ? review.name.charAt(0).toUpperCase() : "G"}
                          </div>
                          <div>
                            <div className="text-white text-left font-extrabold text-sm md:text-base tracking-wide line-clamp-1">{review.name || "Anonymous Guest"}</div>
                            <div className="text-slate-300 text-left font-bold text-[10px] md:text-xs mt-0.5 tracking-wider truncate max-w-[120px] md:max-w-none">{review.country ? review.country.toUpperCase() : "UNKNOWN LOCATION"}</div>
                            {review.type && (
                              <div className="text-indigo-400 text-left font-semibold text-[9px] md:text-[11px] mt-0.5 md:mt-1 uppercase tracking-wide">
                                {review.type.replace(/_/g, ' ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end md:items-start mt-0 md:mt-6 shrink-0">
                          <div className="bg-amber-400 text-amber-950 font-black px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm shadow-md">
                            Rating: {review.averageScore}/10
                          </div>
                          <div className="text-[10px] md:text-xs text-slate-400 mt-2 md:mt-3 font-bold text-right md:text-left hidden sm:block">
                            Posted on:<br />
                            <span className="text-slate-200 mt-0.5 inline-block">
                              {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Area: Review Content */}
                      <div className="flex-1 flex flex-col justify-center pt-1 md:pt-0">
                        {review.headline && (
                          <h4 className="text-white font-bold text-base md:text-lg mb-3 md:mb-4 leading-snug">"{review.headline}"</h4>
                        )}

                        <div className="space-y-3">
                          {review.pros && (
                            <div className="text-xs md:text-sm text-white font-medium leading-relaxed bg-emerald-500/10 p-3 md:p-4 rounded-xl border border-emerald-500/30">
                              <div className="text-emerald-400 font-extrabold text-[10px] md:text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <span className="text-lg md:text-xl leading-none">+</span> Pros
                              </div>
                              {review.pros}
                            </div>
                          )}
                          {review.cons && (
                            <div className="text-xs md:text-sm text-white font-medium leading-relaxed bg-rose-500/10 p-3 md:p-4 rounded-xl border border-rose-500/30">
                              <div className="text-rose-400 font-extrabold text-[10px] md:text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <span className="text-lg md:text-xl leading-none">-</span> Cons
                              </div>
                              {review.cons}
                            </div>
                          )}
                        </div>
                        
                        {/* Mobile only date display (moved here so it doesn't crowd the top row) */}
                        <div className="text-[10px] text-slate-500 mt-4 font-medium text-left sm:hidden">
                          Reviewed on {new Date(review.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            
            <div className="lg:col-span-12 mt-4 md:mt-6">
              <h2 className="text-xl md:text-2xl font-bold !text-amber-400 mb-4 md:mb-5 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                Map View For "{d.name}"
              </h2>
              <div className="bg-[#111827] rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden relative h-[300px] md:h-[400px]">

                {(d.location?.latitude && d.location?.longitude) ? (
                  <div className="relative w-full h-full">

                    {/* We start with controls completely disabled so the initial render is frozen */}
                    <MapContainer
                      center={[d.location.latitude, d.location.longitude]}
                      zoom={14}
                      style={{ height: '100%', width: '100%', zIndex: 0 }}
                      zoomControl={false}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[d.location.latitude, d.location.longitude]}>
                        <Popup>
                          {d.name} <br/> {d.city}
                        </Popup>
                      </Marker>

                      {/* This component secretly turns the controls on when showMap becomes true! */}
                      <MapInteractionController isActive={showMap} />

                      {/* Render zoom buttons only when active */}
                      {showMap && <ZoomControl position="topleft" />}
                    </MapContainer>

                    {/* The Blur Overlay */}
                    {!showMap && (
                      <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0B0F19]/20 backdrop-blur-[4px] transition-all duration-300">
                        <button
                          onClick={() => setShowMap(true)}
                          className="bg-white text-indigo-600 font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 border border-slate-100 text-sm md:text-base"
                        >
                          <MapPin size={18} />
                          Click to View Map
                        </button>
                      </div>
                    )}
                    
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 text-sm md:text-base p-4 text-center">
                    Exact map coordinates are currently not available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      {selectedRoomForDescription && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setSelectedRoomForDescription(null)}
        >
          <div
            className="modal-enter bg-[#0F1520] border border-slate-700/50 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-white font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                  Room Description
                </h2>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1 pr-4 line-clamp-1">{selectedRoomForDescription.roomName}</p>
              </div>
              <button onClick={() => setSelectedRoomForDescription(null)} className="text-slate-500 hover:text-white text-2xl leading-none p-1">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 scroll-smooth">
              <p className="text-slate-300 text-sm leading-loose">
                {(selectedRoomForDescription.description || "").replace(/<[^>]+>/g, "")}
              </p>
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setSelectedRoomForDescription(null)}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl border border-indigo-500/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRoomForFacilities && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setSelectedRoomForFacilities(null)}
        >
          <div
            className="modal-enter bg-[#0F1520] border border-slate-700/50 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-white font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
                  Room Amenities
                </h2>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1 pr-4 line-clamp-1">{selectedRoomForFacilities.roomName}</p>
              </div>
              <button onClick={() => setSelectedRoomForFacilities(null)} className="text-slate-500 hover:text-white text-2xl leading-none p-1">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 scroll-smooth">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                {selectedRoomForFacilities.roomAmenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#111827] border border-slate-700/40 p-2.5 sm:p-3 rounded-xl text-slate-300">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{amenity.name}</span>
                  </div>
                ))}

                {(!selectedRoomForFacilities.roomAmenities || selectedRoomForFacilities.roomAmenities.length === 0) && (
                  <div className="col-span-full text-slate-500 text-xs sm:text-sm text-center py-6">No specific amenities listed for this room.</div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setSelectedRoomForFacilities(null)}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl border border-indigo-500/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showFacilitiesModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setShowFacilitiesModal(false)}
        >
          <div
            className="modal-enter bg-[#0F1520] border border-slate-700/50 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-white font-extrabold text-base sm:text-lg flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                  All Hotel Facilities
                </h2>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-1">{d.facilities?.length} facilities available</p>
              </div>
              <button onClick={() => setShowFacilitiesModal(false)} className="text-slate-500 hover:text-white text-2xl leading-none p-1">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 scroll-smooth">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                {d.facilities?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#111827] border border-slate-700/40 p-2.5 sm:p-3 rounded-xl text-slate-300">
                    <Check size={14} className="text-purple-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowFacilitiesModal(false)}
                className="w-full py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm font-medium rounded-xl border border-purple-500/20 transition-colors"
              >
                Close Facilities
              </button>
            </div>
          </div>
        </div>
      )}

      {showGallery && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300"
          onClick={() => setShowGallery(false)}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 flex-shrink-0 bg-black/50"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-white font-bold tracking-wide flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Camera size={18} className="text-indigo-400 hidden sm:block" />
              <span className="line-clamp-1 pr-2">{d.name}</span>
              <span className="text-slate-400 font-normal text-[10px] sm:text-sm bg-white/10 px-2 py-0.5 rounded-md ml-auto sm:ml-2 whitespace-nowrap">
                {d.hotelImages?.length} Photos
              </span>
            </span>
            <button
              onClick={() => setShowGallery(false)}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors ml-2 shrink-0"
            >
              &times;
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4 sm:p-6 scroll-smooth custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto modal-enter">
              {d.hotelImages?.map((img, i) => (
                <div key={i} className="relative group aspect-video overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
                  <ImageWithShimmer
                    src={img.urlHd || img.url}
                    alt={img.caption || `Hotel Photo ${i + 1}`}
                    imgClass="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-110"
                    caption={img.caption}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedRoomForGallery && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300"
          onClick={() => setSelectedRoomForGallery(null)}
        >
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 flex-shrink-0 bg-black/50"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-white font-bold tracking-wide flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
              <Camera size={18} className="text-indigo-400 hidden sm:block" />
              <span className="line-clamp-1 pr-2">{selectedRoomForGallery.roomName}</span>
              <span className="text-slate-400 font-normal text-[10px] sm:text-sm bg-white/10 px-2 py-0.5 rounded-md ml-auto sm:ml-2 whitespace-nowrap">
                {selectedRoomForGallery.photos?.length || 0} Photos
              </span>
            </span>
            <button
              onClick={() => setSelectedRoomForGallery(null)}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors ml-2 shrink-0"
            >
              &times;
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4 sm:p-6 scroll-smooth custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto modal-enter">
              {selectedRoomForGallery.photos?.map((img, i) => (
                <div key={i} className="relative group aspect-video overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
                  <ImageWithShimmer
                    src={img.hd_url || img.url || img.failoverPhoto}
                    alt={img.imageDescription || `${selectedRoomForGallery.roomName} Photo ${i + 1}`}
                    imgClass="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-110"
                    caption={img.imageDescription}
                  />
                </div>
              ))}

              {(!selectedRoomForGallery.photos || selectedRoomForGallery.photos.length === 0) && (
                <div className="col-span-full text-slate-400 text-center py-20 text-sm sm:text-base">
                  No additional photos available for this room.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPolicy && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setShowPolicy(false)}
        >
          <div
            className="modal-enter bg-[#0F1520] border border-slate-700/50 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl"
            style={{ maxHeight: "85vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700/50">
              <div>
                <h2 className="text-white font-extrabold text-base sm:text-lg">Hotel Policy</h2>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5 line-clamp-1 pr-4">{d.name}</p>
              </div>
              <button onClick={() => setShowPolicy(false)} className="text-slate-500 hover:text-white text-2xl leading-none p-1">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3 min-h-0 scroll-smooth">
              {d.policies?.map((policy, i) => (
                <div key={i} className="bg-[#111827] border border-slate-700/40 rounded-xl p-3 sm:p-4 mb-2">
                  <div className="text-indigo-400 font-semibold text-xs sm:text-sm mb-1">{policy.name}</div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{policy.description}</p>
                </div>
              ))}
              {policyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 sm:gap-3 px-1">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setShowPolicy(false)}
                className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl border border-indigo-500/20 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Hotelmoredetails;