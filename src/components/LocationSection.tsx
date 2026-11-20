import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { SiteSettings } from '../types/cms';

const DEFAULT_COORDS: [number, number] = [-7.311415209978375, 110.47916197054059];
const DEFAULT_ZOOM = 16;

interface LocationSectionProps {
  addressText?: string;
  settings?: SiteSettings;
}

export function LocationSection({ settings }: LocationSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const parsedLat = Number(settings?.location_lat);
  const parsedLng = Number(settings?.location_lng);
  const coords: [number, number] =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    parsedLat !== 0 &&
    parsedLng !== 0
      ? [parsedLat, parsedLng]
      : DEFAULT_COORDS;

  const resolvedMapsUrl =
    settings?.location_maps_url?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
  const resolvedPhone = settings?.contact_phone?.trim() || '0811-2520-4371';
  const resolvedPhoneHref = `tel:${resolvedPhone.replace(/[^0-9+]/g, '').replace(/^0/, '+62')}`;
  const resolvedEmail = settings?.contact_email?.trim() || 'p2b@uinsalatiga.ac.id';
  const resolvedAddress =
    settings?.location_address?.trim() ||
    'P2B UIN Salatiga, Gedung Auditorium & Student Center Prof. Dr. H. Achmadi, Jl. Lingkar Selatan Km. 02, Pulutan, Sidorejo, Kota Salatiga, Jawa Tengah 50716.';

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: coords,
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#F4D993" aria-hidden="true">
              <path d="M12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7m0 2a5 5 0 0 0-5 5c0 1 0 3 5 9.71C17 12 17 10 17 9a5 5 0 0 0-5-5" />
            </svg>
          </div>
          <div class="w-2.5 h-2.5 -mt-1.5 rotate-45 bg-[#164234] border-r border-b border-[#F4D993]"></div>
        </div>
      `,
    });

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const buildPopupHtml = () =>
      `<div class="font-sans text-[#164234] px-1 py-0.5 max-w-[240px]">
        <div class="font-medium text-sm">P2B UIN Salatiga</div>
        <div class="text-xs text-[#3E544B] mt-1 leading-relaxed">${esc(resolvedAddress)}</div>
        <div class="text-[11px] text-[#8F6D26] mt-1.5">${esc(resolvedPhone)} · ${esc(resolvedEmail)}</div>
      </div>`;

    const marker = L.marker(coords, { icon: customIcon }).addTo(map);
    marker.bindPopup(buildPopupHtml());

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    markerRef.current.setLatLng(coords);
    mapInstanceRef.current.setView(coords, DEFAULT_ZOOM);
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    markerRef.current.setPopupContent(
      `<div class="font-sans text-[#164234] px-1 py-0.5 max-w-[240px]">
        <div class="font-medium text-sm">P2B UIN Salatiga</div>
        <div class="text-xs text-[#3E544B] mt-1 leading-relaxed">${esc(resolvedAddress)}</div>
        <div class="text-[11px] text-[#8F6D26] mt-1.5">${esc(resolvedPhone)} · ${esc(resolvedEmail)}</div>
      </div>`
    );
  }, [coords[0], coords[1], resolvedAddress, resolvedPhone, resolvedEmail]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(coords, DEFAULT_ZOOM, { duration: 0.7 });
    markerRef.current?.openPopup();
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
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
              {settings?.location_eyebrow?.trim() || 'Lokasi Resmi'}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-normal text-[#164234] tracking-tight leading-[1.06]">
              {settings?.location_heading?.trim() || 'Peta & Lokasi P2B'}
            </h2>
          </div>

          <p className="text-sm sm:text-base md:text-lg text-[#3E544B] leading-relaxed max-w-xl font-normal">
            {settings?.location_description?.trim() ||
              'Kunjungi kantor P2B UIN Salatiga di Gedung Auditorium & Student Center Prof. Dr. H. Achmadi untuk konsultasi sewa aset, kemitraan usaha, dan layanan komersial.'}
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
            className="w-full h-full z-0 [&_.leaflet-tile-pane]:saturate-[0.88] [&_.leaflet-tile-pane]:sepia-[0.08] [&_.leaflet-popup-content-wrapper]:!bg-[#FAF8F3]/72 [&_.leaflet-popup-content-wrapper]:backdrop-blur-xl [&_.leaflet-popup-content-wrapper]:backdrop-saturate-150 [&_.leaflet-popup-content-wrapper]:!border [&_.leaflet-popup-content-wrapper]:!border-white/70 [&_.leaflet-popup-content-wrapper]:!rounded-2xl [&_.leaflet-popup-content-wrapper]:!shadow-[0_10px_28px_rgba(11,38,29,0.14)] [&_.leaflet-popup-tip]:!bg-[#FAF8F3]/72"
          />

          {/* Subtle Cream-Emerald Perimeter Tint (pointer-events-none so map stays interactive) */}
          <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] md:rounded-[3rem] ring-1 ring-inset ring-white/50 z-[400]" />

          {/* Top-Right Frosted Glass Map Controls */}
          <div className="absolute top-4 right-4 md:top-7 md:right-7 z-[500] flex flex-col gap-2">
            <div className="flex flex-col rounded-2xl bg-[#FAF8F3]/55 backdrop-blur-xl backdrop-saturate-150 border border-white/70 ring-1 ring-[#C9A45A]/25 overflow-hidden shadow-[0_10px_28px_rgba(11,38,29,0.12)]">
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Perbesar peta"
                className="w-10 h-10 flex items-center justify-center text-[#164234] hover:bg-white/60 transition-colors cursor-pointer border-b border-white/50"
              >
                <Icon icon="mdi:plus" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Perkecil peta"
                className="w-10 h-10 flex items-center justify-center text-[#164234] hover:bg-white/60 transition-colors cursor-pointer"
              >
                <Icon icon="mdi:minus" className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRecenter}
              aria-label="Pusatkan peta ke P2B UIN Salatiga"
              className="w-10 h-10 rounded-2xl bg-[#FAF8F3]/55 backdrop-blur-xl backdrop-saturate-150 border border-white/70 ring-1 ring-[#C9A45A]/25 flex items-center justify-center text-[#164234] hover:bg-[#164234]/85 hover:text-[#F4D993] transition-colors cursor-pointer shadow-[0_10px_28px_rgba(11,38,29,0.12)]"
            >
              <Icon icon="mdi:crosshairs-gps" className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Frosted Glass Address & Contact Card (Top-Left) */}
          <div className="hidden sm:flex absolute top-5 left-5 md:top-7 md:left-7 z-[500] max-w-sm rounded-3xl bg-[#FAF8F3]/55 backdrop-blur-xl backdrop-saturate-150 border border-white/70 ring-1 ring-[#C9A45A]/25 p-5 flex-col gap-2.5 shadow-[0_12px_32px_rgba(11,38,29,0.12)]">
            <span className="text-[11px] text-[#8F6D26] uppercase tracking-wider">
              {settings?.location_card_label?.trim() || 'Alamat Kantor P2B'}
            </span>
            <h3 className="text-base md:text-lg font-normal text-[#164234] leading-snug">
              {settings?.location_card_title?.trim() ||
                'Gedung Auditorium & Student Center Prof. Dr. H. Achmadi'}
            </h3>
            <p className="text-xs text-[#2B4339] leading-relaxed">
              {resolvedAddress}
            </p>
            <div className="pt-2 border-t border-[#164234]/12 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#164234]">
              <a
                href={resolvedPhoneHref}
                className="inline-flex items-center gap-1.5 hover:text-[#8F6D26] transition-colors"
              >
                <Icon icon="mdi:phone-outline" className="w-3.5 h-3.5 text-[#8F6D26] shrink-0" />
                <span>{resolvedPhone}</span>
              </a>
              <a
                href={`mailto:${resolvedEmail}`}
                className="inline-flex items-center gap-1.5 hover:text-[#8F6D26] transition-colors"
              >
                <Icon icon="mdi:email-outline" className="w-3.5 h-3.5 text-[#8F6D26] shrink-0" />
                <span>{resolvedEmail}</span>
              </a>
            </div>
          </div>

          {/* Mobile Compact Location Badge (Top-Left on small screens) */}
          <div className="sm:hidden absolute top-4 left-4 right-16 z-[500] p-3.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#C9A45A]/30 flex flex-col gap-1">
            <span className="text-[11px] text-[#8F6D26] uppercase tracking-wider">
              {settings?.location_card_label?.trim() || 'Alamat Kantor P2B'}
            </span>
            <span className="text-sm font-normal text-[#164234]">
              {settings?.location_card_title?.trim() || 'P2B UIN Salatiga'}
            </span>
            <span className="text-[11px] text-[#3E544B] leading-snug">
              {resolvedAddress}
            </span>
            <span className="text-[11px] text-[#164234] pt-0.5">
              {resolvedPhone} · {resolvedEmail}
            </span>
          </div>

          {/* Floating Frosted Glass Bottom-Right Card for Google Maps External Directions */}
          <a
            href={resolvedMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 md:bottom-7 md:right-7 z-[500] px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl bg-[#FAF8F3]/55 hover:bg-[#FAF8F3]/72 backdrop-blur-xl backdrop-saturate-150 border border-white/70 ring-1 ring-[#C9A45A]/25 shadow-[0_12px_32px_rgba(11,38,29,0.12)] flex items-center transition-all group"
          >
            <div className="flex flex-col">
              <span className="text-[15px] md:text-[18px] font-normal text-[#164234] whitespace-nowrap">
                {settings?.location_corner_label?.trim() || 'Petunjuk Arah'}
              </span>
              <div className="flex items-center gap-1 text-[#8F6D26] group-hover:text-[#164234] transition-colors">
                <span className="text-[12px] md:text-[14px] font-normal whitespace-nowrap">
                  {settings?.location_corner_action_label?.trim() || 'Buka Maps'}
                </span>
                <Icon icon="mdi:chevron-right" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
