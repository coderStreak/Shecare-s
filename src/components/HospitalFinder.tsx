import React, { useState, useEffect } from 'react';
import {
  MapPin,
  PhoneCall,
  Navigation,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  Building2,
  AlertCircle,
  ExternalLink,
  LocateFixed
} from 'lucide-react';
import { HealthcareFacility } from '../types';

export const HospitalFinder: React.FC = () => {
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const fetchHospitals = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (emergencyOnly) params.append('emergencyOnly', 'true');
      if (lat && lng) {
        params.append('userLat', lat.toString());
        params.append('userLng', lng.toString());
      }

      const res = await fetch(`/api/hospitals?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFacilities(data);
      }
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals(userLocation?.lat, userLocation?.lng);
  }, [selectedCity, emergencyOnly]);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('Locating your position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setGeoStatus('Location detected! Sorting facilities by closest proximity.');
        fetchHospitals(coords.lat, coords.lng);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setGeoStatus('Location permission denied or unavailable. You can search by city or pincode below.');
      },
      { timeout: 10000 }
    );
  };

  const filteredFacilities = facilities.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.address.toLowerCase().includes(q) ||
      f.pincode.includes(q) ||
      f.services.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Find Nearby Hospitals & Clinics</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verified Women's Care & Emergency Facilities
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Discover verified gynecological emergency casualty centers, ultrasound diagnostic facilities, and women's hospitals with real phone numbers and Google Maps directions.
        </p>
      </div>

      {/* Geolocation & Filter Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-teal-900/5 border border-teal-100 space-y-4">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Use GPS Button */}
          <button
            onClick={handleRequestLocation}
            className="w-full sm:w-auto px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LocateFixed className="w-4 h-4 text-teal-600" />
            <span>{userLocation ? 'Update My Proximity Location' : 'Use My Exact Location (GPS)'}</span>
          </button>

          {/* City Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <span className="font-semibold text-slate-600">City / Hub:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            >
              <option value="all">All Cities</option>
              <option value="bengaluru">Bengaluru</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi NCR</option>
            </select>
          </div>

          {/* Emergency 24/7 Filter Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition-colors w-full sm:w-auto justify-center">
            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <span>24/7 Emergency Casualty Only</span>
          </label>
        </div>

        {/* Status notice */}
        {geoStatus && (
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{geoStatus}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hospital name, service (e.g. 'ultrasound', 'NICU'), area, or pincode..."
            className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-400 font-medium"
          />
        </div>
      </div>

      {/* Facilities List & Interactive Map View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 h-44"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map(f => (
              <div
                key={f.id}
                className="bg-white rounded-3xl p-6 border border-teal-100 shadow-md shadow-teal-900/5 hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg">
                      {f.type}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {f.emergency24x7 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> 24/7 Emergency
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {f.distanceKm ? `~${f.distanceKm} km away` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Name & Address */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{f.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{f.address}, {f.city} - {f.pincode}</span>
                    </p>
                  </div>

                  {/* Services tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {f.services.map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.openHours}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <a
                    href={`tel:${f.phone.replace(/\s+/g, '')}`}
                    className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Facility</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name} ${f.address} ${f.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Facilities Match Your Filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting "All Cities" or clearing the search query to see verified partner hospitals.
              </p>
              <button
                onClick={() => {
                  setSelectedCity('all');
                  setEmergencyOnly(false);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Accuracy & Verified Status Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Verified Healthcare Directory: </span>
          <span>
            Facilities marked with verified badges have verified contact information and 24/7 emergency casualty departments. In acute life-threatening situations, always call national ambulance dispatch (108) or proceed directly to the nearest hospital casualty ward.
          </span>
        </div>
      </div>

    </div>
  );
};
