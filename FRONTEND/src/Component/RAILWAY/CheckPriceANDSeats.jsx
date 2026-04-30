// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const CheckPriceSeats = () => {
//   const params = useParams();
//   const navigate = useNavigate();
  
//   const from = params.from;
//   const to = params.to;
//   const date = params.date || "2026-04-16"; 
  
//   const [loading, setLoading] = useState(true);
//   const [trainData, setTrainData] = useState([]);

//   useEffect(() => {
//     const fetchSeatAvailability = async () => {
//       setLoading(true);
      
//       try {
//         // 1. Format the date for the API (convert YYYY-MM-DD to DD-MM-YYYY)
//         let formattedApiDate = date;
//         if (date.includes('-')) {
//           const parts = date.split('-');
//           if (parts[0].length === 4) { // If year is first
//             formattedApiDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
//           }
//         }
       
//         // 2. Make the API Call
//         const response = await axios.get('https://irctc-api2.p.rapidapi.com/trainAvailability', {
//           params: {
//             source: from,
//             destination: to,
//             date: formattedApiDate
//           },
//           headers: {
//             'X-RapidAPI-Key': 'e478158057msh11c165be1004632p17cdd0jsnbb1dfee212b8', 
//             'X-RapidAPI-Host': 'irctc-api2.p.rapidapi.com'
//           }
//         });      
        
//         console.log("API Response:", response.data); 
        
//         // 3. Extract the array from the object
//         const trainsArray = response.data?.data || [];
          
//         if (!trainsArray || trainsArray.length === 0) {
//             console.warn("No trains found or unexpected API structure");
//             setTrainData([]);
//             return;
//         }

//         // 4. Map ALL parameters from the API to our UI state
//         const formattedData = trainsArray.map(apiTrain => ({
//           fromCode: apiTrain.from?.code || from,
//           fromName: apiTrain.from?.name || "",
//           toCode: apiTrain.to?.code || to,
//           toName: apiTrain.to?.name || "",
//           trainNumber: apiTrain.trainNumber, 
//           trainName: apiTrain.trainName,     
//           departureTime: apiTrain.departure,
//           arrivalTime: apiTrain.arrival,
//           pantry: apiTrain.pantry,
//           distance: apiTrain.distanceKm,
//           rating: apiTrain.rating,
//           duration: apiTrain.duration, 
//           allClasses: apiTrain.allClasses,   // <-- Added
//           classes: (apiTrain.classAvailability || []).map(cls => {
//              const isAvailable = cls.displayStatus === "AVAILABLE" || 
//                                  String(cls.availability).toUpperCase().includes("AVAILABLE") ||
//                                  String(cls.displayStatus).toUpperCase().includes("RAC");

//              return {
//                  class: cls.class,
//                  price: cls.fare,
//                  status: cls.displayStatus,
//                  prediction: cls.prediction,
//                  predictionPercent: cls.predictionPercent, // <-- Added
//                  quota: cls.quota,                         // <-- Added
//                  availability: cls.availability,
//                  isAvailable: isAvailable
//              };
//           })
//         }));

//         setTrainData(formattedData);

//       } catch (error) {
//         console.error("Failed to fetch train availability:", error);
//         setTrainData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (from && to && date) {
//       fetchSeatAvailability();
//     }
//   }, [from, to, date]);

//   const formattedDate = new Date(date).toLocaleDateString('en-GB', {
//     day: 'numeric', month: 'short', year: 'numeric'
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-zinc-400">Loading trains...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen backdrop-blur-2xl bg-[#25191969] text-zinc-200 font-sans overflow-hidden">
      
//       {/* BACKGROUND TO MAKE BLUR VISIBLE */}
//       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[120px] rounded-full z-0 pointer-events-none"></div>

//       {/* MAIN CONTENT */}
//       <div className="relative z-10 px-4 py-8 max-w-4xl mx-auto">
        
//         {/* HEADER */}
//         <div className="mb-6">
//           <button 
//             onClick={() => navigate(-1)} 
//             className="text-indigo-400 hover:scale-[1.03] text-sm mb-4 font-medium border border-white rounded-xl px-2 py-2 pt-2 pb-2 text-semibold ml-[0px]"
//           >
//             ← Back to Trains
//           </button>
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-2xl font-bold text-white mb-1">
//                 {from} → {to}
//               </h1>
//               <p className="text-zinc-400 text-sm">{formattedDate}</p>
//             </div>
//             <p className="text-sm text-zinc-500">{trainData.length} Trains</p>
//           </div>
//         </div>

//         {/* RESULTS LIST */}
//         <div className="flex flex-col gap-6">
          
//           {trainData.map((train, index) => (
//             <div 
//               key={index} 
//               className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-xl p-5 shadow-lg"
//             >
              
//               {/* TRAIN NAME, NUMBER & EXTRA INFO */}
//               <div className="flex justify-between items-start mb-5 pb-4 border-b border-zinc-800/50">
//                 <div>
//                   <h2 className="text-lg font-semibold text-white">
//                     {train.trainNumber} <span className="text-zinc-300 font-normal ml-1">• {train.trainName}</span>
//                   </h2>
//                   <div className="text-xs text-zinc-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
//                     <span>Runs: <span className="text-zinc-300">{train.runningDays}</span></span>
//                     <span>•</span>
//                     <span className="text-yellow-500">★ {train.rating}</span>
//                     <span>•</span>
//                     <span>Pantry: <span className={train.pantry === "Yes" ? "text-emerald-400" : "text-zinc-400"}>{train.pantry || "No"}</span></span>
//                   </div>
//                 </div>
//                 <div className="text-xs font-medium text-zinc-400 text-right bg-zinc-800/50 px-2 py-1 rounded">
//                   {train.distance} km
//                 </div>
//               </div>

//               {/* TIMINGS ROW */}
//               <div className="flex items-center justify-between mb-6">
//                 <div className="text-center w-28">
//                   <div className="text-xl font-bold text-white">{train.departureTime}</div>
//                   <div className="text-sm font-semibold text-zinc-300 mt-1">{train.fromCode}</div>
//                   <div className="text-[10px] text-zinc-500 mt-0.5 truncate px-1" title={train.fromName}>{train.fromName}</div>
//                 </div>

//                 <div className="flex-1 px-4 flex flex-col items-center">
//                   <div className="w-full h-[1px] bg-zinc-800 mb-1 relative">
//                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900/60 px-2 text-xs text-zinc-400">
//                        {train.duration}
//                      </div>
//                   </div>
//                 </div>

//                 <div className="text-center w-28">
//                   <div className="text-xl font-bold text-white">{train.arrivalTime}</div>
//                   <div className="text-sm font-semibold text-zinc-300 mt-1">{train.toCode}</div>
//                   <div className="text-[10px] text-zinc-500 mt-0.5 truncate px-1" title={train.toName}>{train.toName}</div>
//                 </div>
//               </div>

//               {/* SEAT AVAILABILITY CARDS */}
//               <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//                 {train.classes.map((cls, idx) => (
//                   <div 
//                     key={idx} 
//                     className={`min-w-[130px] flex flex-col justify-between rounded-lg p-3 text-center border backdrop-blur-sm ${
//                       cls.isAvailable 
//                         ? 'border-emerald-500/30 bg-emerald-500/10' 
//                         : 'border-orange-500/30 bg-orange-500/10'
//                     }`}
//                   >
//                     <div>
//                       <div className={`text-xs font-bold mb-1 ${cls.isAvailable ? 'text-emerald-400' : 'text-orange-400'}`}>
//                         {cls.status || 'CHECKING...'}
//                       </div>
//                       <div className="text-lg font-bold text-white mb-1">
//                         ₹{cls.price || 'N/A'}
//                       </div>
//                       <div className="text-xs text-zinc-400">
//                         {cls.class} • Quota: {cls.quota}
//                       </div>
//                     </div>

//                     {/* Show confirmation probability if waitlisted and percent exists */}
//                     {!cls.isAvailable && cls.predictionPercent && (
//                       <div className="mt-2 pt-2 border-t border-orange-500/20 text-[10px] font-medium text-orange-300">
//                         {cls.predictionPercent}% Chance
//                       </div>
//                     )}
//                     {/* Show Available text if available */}
//                     {cls.isAvailable && (
//                        <div className="mt-2 pt-2 border-t border-emerald-500/20 text-[10px] font-medium text-emerald-400">
//                          Available to Book
//                        </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
              
//             </div>
//           ))}
//         </div>

//       </div>

//       {/* FIXED CSS TAG FOR STANDARD REACT */}
//       <style>{`
//         div::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CheckPriceSeats;