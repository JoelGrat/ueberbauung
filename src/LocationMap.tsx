import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

type PoiType = 'projekt' | 'einkauf' | 'schule' | 'kita' | 'ov' | 'natur';

const config: Record<PoiType, { color: string; label: string; svg: string }> = {
  projekt: {
    color: '#1D4ED8',
    label: 'Überbauung',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  einkauf: {
    color: '#16A34A',
    label: 'Einkauf',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
  },
  schule: {
    color: '#D97706',
    label: 'Schule',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  },
  kita: {
    color: '#DB2777',
    label: 'Kindergarten',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  },
  ov: {
    color: '#7C3AED',
    label: 'Öffentlicher Verkehr',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>`,
  },
  natur: {
    color: '#0D9488',
    label: 'Naherholung',
    svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  },
};

const PROJECT_LAT = 47.38690;
const PROJECT_LNG = 8.29038;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(lat: number, lng: number): string {
  const km = haversineKm(PROJECT_LAT, PROJECT_LNG, lat, lng);
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`;
}

const pois: { lat: number; lng: number; name: string; sub: string; type: PoiType }[] = [
  // Projekt
  { lat: PROJECT_LAT, lng: PROJECT_LNG, name: 'Überbauung Widematte',           sub: 'Niederwilerstrasse 1a/b/c, Nesselnbach', type: 'projekt' },
  // Einkauf
  { lat: 47.37948,    lng: 8.29372,     name: 'Reussthal Metzgerei',              sub: 'Hauptstrasse 2, Niederwil',              type: 'einkauf' },
  { lat: 47.37697,    lng: 8.29463,     name: 'Bäckerei Wirth',                   sub: 'Niederwil',                              type: 'einkauf' },
  { lat: 47.37644,    lng: 8.29449,     name: 'Volg Niederwil',                   sub: 'Hauptstrasse 33, Niederwil',             type: 'einkauf' },
  { lat: 47.41312,    lng: 8.26672,     name: 'Migros Mellingen',                 sub: 'Lenzburgerstrasse 50, Mellingen',        type: 'einkauf' },
  { lat: 47.41823,    lng: 8.27009,     name: 'Coop Mellingen',                   sub: 'Birrfeldstrasse, Mellingen',             type: 'einkauf' },
  { lat: 47.35263,    lng: 8.34967,     name: 'Migros Bremgarten',                sub: 'Zufikerstrasse 2, Bremgarten',           type: 'einkauf' },
  { lat: 47.35174,    lng: 8.34859,     name: 'Coop Bremgarten',                  sub: 'Sonnengutstrasse, Bremgarten',           type: 'einkauf' },
  { lat: 47.34941,    lng: 8.27248,     name: 'Migros Wohlen',                    sub: 'Bahnhofstrasse, Anglikon/Wohlen',        type: 'einkauf' },
  { lat: 47.35022,    lng: 8.27064,     name: 'Coop Wohlen',                      sub: 'Alte Bahnhofstrasse, Anglikon/Wohlen',   type: 'einkauf' },
  // Bildung
  { lat: 47.38791,    lng: 8.29483,     name: 'Kinderlaube Nesselnbach',          sub: 'Landstrasse 1a, Nesselnbach',            type: 'kita'    },
  { lat: 47.38018,    lng: 8.29152,     name: 'Kindergarten Niederwil',           sub: 'Schulanlage Althau, Niederwil',          type: 'kita'    },
  { lat: 47.37882,    lng: 8.29223,     name: 'Primarschule Niederwil',           sub: 'Schulweg, Niederwil',                    type: 'schule'  },
  // ÖV
  { lat: 47.38883,    lng: 8.29118,     name: 'PostAuto Nesselnbach Mitteldorf',  sub: 'Haltestelle Nesselnbach Mitteldorf',     type: 'ov'      },
  { lat: 47.42833,    lng: 8.27646,     name: 'S-Bahn Mellingen Heitersberg',     sub: 'Bahnhof Mellingen Heitersberg',          type: 'ov'      },
  { lat: 47.34724,    lng: 8.27175,     name: 'Bahnhof Wohlen',                   sub: 'Untere Farnbühlstrasse, Wohlen',         type: 'ov'      },
  // Natur
  { lat: 47.38918,    lng: 8.30530,     name: 'Reuss Uferweg',                    sub: 'Naherholung direkt beim Dorf',           type: 'natur'   },
  { lat: 47.39163,    lng: 8.36106,     name: 'Heitersberg',                      sub: 'Wandergebiet Bellikon, ca. 3 km',        type: 'natur'   },
];

function makePin(type: PoiType) {
  const { color, svg } = config[type];
  const large = type === 'projekt';
  const size  = large ? 44 : 36;
  const tri   = large ? 12 : 9;

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:${size}px">
        <div style="
          width:${size}px;height:${size}px;
          background:${color};
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 14px rgba(0,0,0,.35);
          border:3px solid white;
        ">${svg}</div>
        <div style="
          width:0;height:0;
          border-left:${tri / 2}px solid transparent;
          border-right:${tri / 2}px solid transparent;
          border-top:${tri}px solid ${color};
          margin-top:-2px;
        "></div>
      </div>`,
    iconSize:    [size, size + tri],
    iconAnchor:  [size / 2, size + tri],
    popupAnchor: [0, -(size + tri + 6)],
  });
}

function InteractionHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const onEnter = () => map.scrollWheelZoom.enable();
    const onLeave = () => map.scrollWheelZoom.disable();
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    if (L.Browser.mobile) map.dragging.disable();
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, [map]);

  return null;
}

export default function LocationMap() {
  return (
    <div>
      <MapContainer
        center={[47.390, 8.314]}
        zoom={12}
        className="w-full h-72 md:h-[480px] mt-8"
        scrollWheelZoom={false}
        touchZoom={true}
        style={{ zIndex: 0 }}
      >
        <InteractionHandler />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
        />
        {pois.map((poi) => (
          <Marker
            key={poi.name}
            position={[poi.lat, poi.lng]}
            icon={makePin(poi.type)}
          >
            <Popup>
              <div style={{ fontFamily: '"Helvetica Neue", sans-serif', minWidth: 160 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: config[poi.type].color }}>{poi.name}</p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{poi.sub}</p>
                {poi.type !== 'projekt' && (
                  <p style={{ margin: '5px 0 0', fontSize: 11, color: '#9CA3AF' }}>
                    {fmtDist(poi.lat, poi.lng)} von der Überbauung
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="flex flex-wrap gap-5 mt-4">
        {(Object.entries(config) as [PoiType, typeof config[PoiType]][]).map(([type, { color, label, svg }]) => (
          <div key={type} className="flex items-center gap-2">
            <div style={{
              width: 26, height: 26,
              background: color,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,.2)',
              border: '2px solid white',
              flexShrink: 0,
            }} dangerouslySetInnerHTML={{ __html: svg.replace('width="20" height="20"', 'width="14" height="14"') }} />
            <span className="text-xs text-gray-500 uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
