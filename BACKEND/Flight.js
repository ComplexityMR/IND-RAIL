import mongoose from 'mongoose'; // Change require to import

const flightSchema = new mongoose.Schema({
    callsign: { type: String, unique: true, index: true },
    lastSeen: Number,
    src: String,
    country:String,
    dest: String,
    lat: Number,
    lon: Number,
    alt: Number, 
    gs: Number,  
    onGround: Boolean,
    velocity: Number,
    baro_alt: Number,
});

flightSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 36000 });

const Flight = mongoose.model('Flight', flightSchema);
export default Flight;