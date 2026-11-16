import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Check,
  ChevronRight,
  Copy,
  LocateFixed,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';

const P2B_COORDS: [number, number] = [-7.311415209978375, 110.47916197054059];
const DEFAULT_ZOOM = 16;

export function LocationSection() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: P2B_COORDS,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    let switchedToFallback = false;
    osmLayer.on('tileerror', () => {
      if (switchedToFallback) return;
      switchedToFallback = true;
      map.removeLayer(osmLayer);
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri &mdash; OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map);
    });

    osmLayer.addTo(map);

    const customIcon = L.divIcon({
      className: 'bg-transparent border-0',
      iconSize: [44, 52],
      iconAnchor: [22, 50],
      popupAnchor: [0, -46],
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-11 h-11 rounded-full bg-[#164234] border-2 border-[#F4D993] shadow-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F4D993" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="w-2.5 h-2.5 -mt-1.5 rotate-45 bg-[#164234] border-r border-b border-[#F4D993]"></div>
        </div>
      `,
    });

    const marker = L.marker(P2B_COORDS, { icon: customIcon }).addTo(map);
    marker.bindPopup(
      `<div class="font-sans text-[#164234] px-1 py-0.5">
        <div class="font-medium text-sm">P2B UIN Salatiga</div>
        <div class="text-xs text-[#3E544B] mt-0.5">Pusat Pengembangan Bisnis · PTN BLU</div>
      </div>`
    );

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(P2B_COORDS, DEFAULT_ZOOM, { duration: 0.7 });
    markerRef.current?.openPopup();
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCopyCoords = async () => {
    const coordsText = `${P2B_COORDS[0]}, ${P2B_COORDS[1]}`;
    try {
      await navigator.clipboard.writeText(coordsText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section
      id="lokasi-p2b"
      className="w-full flex justify-center px-3 md:px-5 pb-12 md:pb-20 bg-[#F6F3EC]"
    >
      <div className="w-full max-w-[1536px] flex flex-col gap-8 md:gap-10">
        {/* Header Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="px-3 md:px-6 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-12"
        >
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-normal text-[#8F6D26] uppercase tracking-wider">
              Lokasi Resmi
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#164234] tracking-tight leading-[1.06]">
              Peta & Lokasi P2B
            </h2>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-[#3E544B] leading-relaxed max-w-xl font-normal">
            Kunjungi kantor Pusat Pengembangan Bisnis UIN Salatiga untuk konsultasi sewa aset, reservasi Gedung Auditorium, kemitraan usaha, dan layanan komersial lainnya.
          </p>
        </motion.div>

        {/* Rounded Leaflet Map Container matching Hero aesthetic */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative w-full h-[460px] sm:h-[500px] md:h-[540px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden border border-[#C9A45A]/30 bg-[#EAE5D7]"
        >
          {/* Leaflet Mount */}
          <div
            ref={mapContainerRef}
            aria-label="Peta lokasi Pusat Pengembangan Bisnis UIN Salatiga"
            className="w-full h-full z-0 [&_.leaflet-tile-pane]:saturate-[0.88] [&_.leaflet-tile-pane]:sepia-[0.08]"
          />

          {/* Subtle Cream-Emerald Perimeter Tint (pointer-events-none so map stays interactive) */}
          <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] md:rounded-[3rem] ring-1 ring-inset ring-white/50 z-[400]" />

          {/* Top-Right Frosted Glass Map Controls */}
          <div className="absolute top-4 right-4 md:top-7 md:right-7 z-[500] flex flex-col gap-2">
            <div className="flex flex-col rounded-2xl bg-white/80 backdrop-blur-xl border border-[#C9A45A]/30 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Perbesar peta"
                className="w-10 h-10 flex items-center justify-center text-[#164234] hover:bg-[#F6F3EC] transition-colors cursor-pointer border-b border-[#C9A45A]/20"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Perkecil peta"
                className="w-10 h-10 flex items-center justify-center text-[#164234] hover:bg-[#F6F3EC] transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRecenter}
              aria-label="Pusatkan peta ke P2B UIN Salatiga"
              className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#C9A45A]/30 flex items-center justify-center text-[#164234] hover:bg-[#164234] hover:text-[#F4D993] transition-colors cursor-pointer shadow-sm"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Glassmorphism Location Info Card (Bottom-Left) */}
          <div className="hidden sm:flex absolute bottom-6 left-6 lg:bottom-8 lg:left-8 z-[500] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.2rem] bg-white/78 backdrop-blur-xl border border-[#C9A45A]/30 flex-col gap-3 max-w-xs md:max-w-sm shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(201,164,90,0.16)] border border-[#C9A45A]/35 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#164234]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-normal text-[#8F6D26] uppercase tracking-wider">
                  UIN Salatiga
                </span>
                <h3 className="text-lg font-normal text-[#164234] tracking-tight leading-snug">
                  Pusat Pengembangan Bisnis (P2B)
                </h3>
              </div>
            </div>

            <p className="text-xs md:text-sm text-[#3E544B] leading-relaxed">
              Kawasan Kampus UIN Salatiga, Kota Salatiga, Jawa Tengah · Senin – Jumat, 08.00 – 16.00 WIB
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs text-[#3E544B] tabular-nums">
                -7.311415, 110.479162
              </span>
              <button
                type="button"
                onClick={handleCopyCoords}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#C9A45A]/30 text-xs text-[#164234] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#164234]" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#B89242]" />
                    <span>Salin Koordinat</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Compact Location Badge (Top-Left on small screens) */}
          <div className="sm:hidden absolute top-4 left-4 right-16 z-[500] p-3.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A45A]/30 flex flex-col gap-1">
            <span className="text-[11px] text-[#8F6D26] uppercase tracking-wider">
              Lokasi Kampus
            </span>
            <span className="text-sm font-normal text-[#164234]">
              P2B UIN Salatiga
            </span>
            <span className="text-[11px] text-[#3E544B] tabular-nums">
              -7.311415, 110.479162
            </span>
          </div>

          {/* Faux-Cutout Bottom-Right Corner for Google Maps External Directions */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${P2B_COORDS[0]},${P2B_COORDS[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 right-0 px-6 py-4 pt-5 pl-8 sm:px-7 sm:py-5 sm:pt-6 sm:pl-10 md:px-9 md:py-6 md:pt-8 md:pl-12 bg-[#F6F3EC] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center z-[500] group"
          >
            {/* Top intersection mask */}
            <div className="absolute -top-[1.5rem] sm:-top-[2rem] md:-top-[3.5rem] right-0 w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M56 56V0C56 30.9279 30.9279 56 0 56H56Z" fill="#F6F3EC" />
              </svg>
            </div>

            {/* Left intersection mask */}
            <div className="absolute bottom-0 -left-[1.5rem] sm:-left-[2rem] md:-left-[3.5rem] w-[1.5rem] sm:w-[2rem] md:w-[3.5rem] h-[1.5rem] sm:h-[2rem] md:h-[3.5rem] pointer-events-none">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M56 56H0C30.9279 56 56 30.9279 56 0V56Z" fill="#F6F3EC" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-[15px] md:text-[20px] font-normal text-[#164234] whitespace-nowrap">
                Petunjuk Arah
              </span>
              <div className="flex items-center gap-1 text-[#8F6D26] group-hover:text-[#164234] transition-colors">
                <span className="text-[12px] md:text-[15px] font-normal whitespace-nowrap">
                  Buka Maps
                </span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
