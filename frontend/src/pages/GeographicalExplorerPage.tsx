import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Filter,
  Layers,
  Sprout,
  ShieldCheck,
  Info,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { GeoRecord } from '../types';

export const GeographicalExplorerPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [geoRecords, setGeoRecords] = useState<GeoRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<GeoRecord | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadGeoData();
  }, []);

  const loadGeoData = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsOverview();
      setGeoRecords(res.geographical_records);
      initMap(res.geographical_records);
      if (res.geographical_records.length > 0) {
        setSelectedRecord(res.geographical_records[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initMap = (records: GeoRecord[]) => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Centered on the Indian Subcontinent
    const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | EthnoTrace Geo-Provenance',
      maxZoom: 18
    }).addTo(map);

    // Custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-geo-marker',
      html: `<div style="background-color: #059669; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    records.forEach((rec) => {
      const marker = L.marker([rec.latitude, rec.longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0d281e; font-size: 13px;">${rec.plant_name}</strong><br/>
          <span style="color: #059669; font-weight: 600;">${rec.condition}</span><br/>
          <span style="color: #64748b; font-size: 11px;">${rec.location_name} • ${rec.community || 'Documented Healers'}</span>
        </div>
      `);
      marker.on('click', () => {
        setSelectedRecord(rec);
      });
    });

    mapInstanceRef.current = map;
  };

  const handleSelectRecord = (rec: GeoRecord) => {
    setSelectedRecord(rec);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([rec.latitude, rec.longitude], 8, { animate: true });
    }
  };

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col p-4 max-w-[1700px] mx-auto space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e9e4]">
        <div>
          <h1 className="text-xl font-bold text-[#0d281e]">Geographical Ethnobotanical Explorer</h1>
          <p className="text-xs text-slate-600">
            Spatial distribution of documented field records across the Western Ghats, Nilgiri Biosphere, and Western Himalayas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ethical Non-Sensitive Bounds Enforced</span>
          </span>
        </div>
      </div>

      {/* Main Map + Details Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Leaflet Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs relative flex flex-col">
          <div ref={mapContainerRef} className="w-full h-full" />
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading spatial coordinates...
            </div>
          )}
        </div>

        {/* Right Locality Records & Provenance Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#e5e9e4] rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-[#e5e9e4] flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">Field Locality Records ({geoRecords.length})</span>
            <span className="text-[10px] text-slate-400 font-mono">Himalaya & Ghats</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {geoRecords.map((rec) => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => handleSelectRecord(rec)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-sm text-[#0d281e] font-serif italic">
                      {rec.plant_name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {rec.condition}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{rec.location_name}</span>
                  </div>

                  {rec.community && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Reporting Community: <strong className="text-slate-700">{rec.community}</strong>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 italic font-botanical-serif mt-2 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-200/60">
                    "{rec.supporting_passage}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
