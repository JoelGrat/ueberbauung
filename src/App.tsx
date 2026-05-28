import { Building2, ChevronDown, ChevronLeft, ChevronRight, Download, Mail, MapPin, Menu, Phone, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Apartment {
  id: number;
  building: '1' | '2' | '3';
  size: number;
  rooms: number;
  rent: number;
  price: number;
  floor: number;
  status: 'available' | 'reserved' | 'sold';
  note?: string;
  placeholder?: boolean;
  outdoor?: number;
}


const apartments: Apartment[] = [
  // Gebäude 1
  { id: 1, building: '1', size: 107, rooms: 4.5, rent: 30000, price: 1250000, floor: 0, status: 'available' },
  { id: 2, building: '1', size: 108, rooms: 4.5, rent: 28000, price: 1150000, floor: 1, status: 'available', note: 'Optional 3.5 Zimmer', placeholder: true, outdoor: 23.74 },
  { id: 3, building: '1', size: 107, rooms: 4.5, rent: 30000, price: 1200000, floor: 2, status: 'available' },
  // Gebäude 2 – verkauft
  { id: 4, building: '2', size: 127, rooms: 4.5, rent: 34000, price: 1450000, floor: 0, status: 'sold', placeholder: true },
  { id: 5, building: '2', size: 127, rooms: 4.5, rent: 32000, price: 1250000, floor: 1, status: 'sold', placeholder: true },
  { id: 6, building: '2', size: 163, rooms: 5.5, rent: 36000, price: 1400000, floor: 2, status: 'sold', placeholder: true },
  // Gebäude 3
  { id: 7, building: '3', size: 115, rooms: 4.5, rent: 32000, price: 1300000, floor: 0, status: 'available', placeholder: true },
  { id: 8, building: '3', size: 115, rooms: 4.5, rent: 30000, price: 1250000, floor: 1, status: 'available' },
  { id: 9, building: '3', size: 113, rooms: 4.5, rent: 32000, price: 1300000, floor: 2, status: 'reserved', placeholder: true  },
];

const buildingListingType: Record<string, 'sale' | 'rent'> = {
  '1': 'sale',
  '2': 'sale',
  '3': 'rent',
};

const buildingShowPrice: Record<string, boolean> = {
  '1': true,
  '2': false,
  '3': false,
};

// Local paths (starting with /) are served from public/. Supabase filenames get the storage base prepended.
const buildingImagePaths: Record<string, string[]> = {
  '1': [
    '/Images/Aussenansicht/Gebeaude_1_Highlight.png',
    '/Images/Innenansicht/Geb1_EG_Livingroom.jpg',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
    '/Images/Aussenansicht/Aussenansicht_1.jpg',
  ],
  '2': [
    '/Images/Aussenansicht/Gebeaude_2_Highlight.png',
    '/Images/Aussenansicht/Aussenansicht_2.jpg',
  ],
  '3': [
    '/Images/Aussenansicht/Gebeaude_3_Highlight.png',
    '/Images/Innenansicht/Geb3_OG_Livingroom.jpg',
    '/Images/Innenansicht/Geb3_DG_Livingroom.jpg',
    '/Images/Innenansicht/Geb3_EG_Badezimmer.jpg',
    '/Images/Aussenansicht/Aussenansicht_BirdView.jpg',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
  ],
};

const buildingDescriptions: Record<string, string> = {
  '1': 'Drei 4.5-Zimmer-Wohnungen auf drei Stockwerken mit offenen Grundrissen und Blick ins Grüne. Die Wohnung im ersten Obergeschoss ist optional auch als 3.5-Zimmer-Wohnung erhältlich.',
  '2': 'Drei grosszügige Wohnungen von 4.5 bis 5.5 Zimmern auf drei Stockwerken – vollständig verkauft. Das Dachgeschoss bietet mit 163 m² die grösste Einheit der Überbauung.',
  '3': 'Drei Wohnungen à 4.5 Zimmer mit ruhiger Südausrichtung und direktem Bezug zur angrenzenden Landwirtschaftszone.',
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const heroBackgroundUrl = '/Images/Aussenansicht/Aussenansicht_0.jpg';
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function floorLabel(floor: number) {
  if (floor === 0) return 'EG';
  if (floor === 2) return 'DG';
  return `${floor}. OG`;
}

function StatusBadge({ status }: { status: Apartment['status'] }) {
  if (status === 'available') return (
    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Verfügbar
    </span>
  );
  if (status === 'reserved') return (
    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-600">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />Reserviert
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widests text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />Verkauft
    </span>
  );
}

function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const total = images.length;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIndex(i => (i + 1) % total); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % total);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, total]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10">
        <X className="w-7 h-7" />
      </button>
      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 md:left-8 p-3 text-white/60 hover:text-white transition-colors z-10">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={next} className="absolute right-2 md:right-8 p-3 text-white/60 hover:text-white transition-colors z-10">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
        onClick={e => e.stopPropagation()}
      />
      {total > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIndex(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BuildingCard({ building, units, onRequest }: {
  building: string;
  units: Apartment[];
  onRequest: (building: string) => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const imageUrls = buildingImagePaths[building] ?? [];

  const total = imageUrls.length;
  const currentUrl = imageUrls[imgIndex] ?? null;
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex(i => (i - 1 + total) % total); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex(i => (i + 1) % total); };

  const minRooms = Math.min(...units.map(u => u.rooms));
  const maxRooms = Math.max(...units.map(u => u.rooms));
  const minSize = Math.min(...units.map(u => u.size));
  const maxSize = Math.max(...units.map(u => u.size));

  const available = units.filter(u => u.status === 'available');
  const listingType = buildingListingType[building] ?? 'sale';

  const roomsLabel = minRooms === maxRooms ? `${minRooms}` : `${minRooms}–${maxRooms}`;
  const sizeLabel = minSize === maxSize ? `${minSize}` : `${minSize}–${maxSize}`;

  const priceLabel = (() => {
    if (available.length === 0) return null;
    if (listingType === 'rent') {
      const rents = available.map(u => Math.round(u.rent / 12));
      const min = Math.min(...rents);
      const max = Math.max(...rents);
      return min === max
        ? `CHF ${min.toLocaleString('de-CH')} / Monat`
        : `CHF ${min.toLocaleString('de-CH')} – ${max.toLocaleString('de-CH')} / Monat`;
    }
    const prices = available.map(u => u.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `CHF ${min.toLocaleString('de-CH')}`
      : `CHF ${min.toLocaleString('de-CH')} – ${max.toLocaleString('de-CH')}`;
  })();

  const priceRowLabel = listingType === 'rent' ? 'Mietpreis ab' : 'Verkaufspreis ab';

  return (
    <div className="overflow-hidden bg-white border border-gray-200 hover:border-gray-400 transition-colors flex flex-col">
      {lightboxIndex !== null && (
        <Lightbox images={imageUrls} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
      <div className="relative">
        {currentUrl ? (
          <img
            key={imgIndex}
            src={currentUrl}
            alt={`Gebäude ${building}`}
            className="w-full aspect-[3/2] object-cover cursor-zoom-in fade-in"
            loading="lazy"
            onClick={() => setLightboxIndex(imgIndex)}
          />
        ) : (
          <div className="w-full aspect-[3/2] bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Bild folgt</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          {available.length > 0 ? (
            <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{available.length} verfügbar
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />Verkauft
            </span>
          )}
        </div>
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imageUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="text-2xl md:text-3xl font-light mb-1">Gebäude {building}</h3>
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">{roomsLabel} Zimmer · {sizeLabel} m²</p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
          {buildingDescriptions[building]}
        </p>
        <div className="border-t border-gray-100 pt-4 mb-5 space-y-3">
          <div className="flex justify-between items-baseline">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Wohnfläche</p>
            <p className="text-sm font-light">{sizeLabel} m²</p>
          </div>
          <div className="flex justify-between items-baseline">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Zimmer</p>
            <p className="text-sm font-light">{roomsLabel}</p>
          </div>
          {buildingShowPrice[building] && priceLabel ? (
            <div className="flex justify-between items-baseline">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{priceRowLabel}</p>
              <p className="text-sm font-light">{priceLabel}</p>
            </div>
          ) : listingType === 'rent' ? (
            <div className="flex justify-between items-baseline">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Typ</p>
              <p className="text-sm font-light text-gray-500">Mietobjekt</p>
            </div>
          ) : null}
        </div>
        {available.length > 0 ? (
          <button
            onClick={() => onRequest(building)}
            className="w-full py-3.5 bg-black text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Unterlagen anfordern
          </button>
        ) : (
          <p className="w-full py-3.5 border border-gray-200 text-xs uppercase tracking-widest text-gray-300 text-center">
            Vollständig verkauft
          </p>
        )}
      </div>
    </div>
  );
}

function ContactForm({ initialMessage = '' }: { initialMessage?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setSubmitError(true); return; }
    setSubmitting(true);
    setSubmitError(false);
    const { error } = await supabase.from('kontakt').insert({ name, email, telefon: phone, nachricht: message });
    if (error) {
      console.error('Kontaktformular Fehler:', error);
      setSubmitting(false);
      setSubmitError(true);
      return;
    }
    await supabase.functions.invoke('send-kontakt-email', {
      body: { name, email, telefon: phone, nachricht: message },
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="text-xl font-light text-gray-300">
        Vielen Dank, {name}. Wir melden uns in Kürze bei Ihnen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 md:gap-6">
      <input
        required
        className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none focus:border-gray-600 disabled:opacity-40"
        placeholder="Ihr Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
      />
      <input
        required
        type="email"
        className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none focus:border-gray-600 disabled:opacity-40"
        placeholder="Ihre E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <input
        type="tel"
        className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none focus:border-gray-600 disabled:opacity-40"
        placeholder="Telefon (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={submitting}
      />
      <textarea
        rows={4}
        className="md:col-span-2 w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none focus:border-gray-600 disabled:opacity-40 resize-none"
        placeholder="Ihre Nachricht (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting}
        className="md:col-span-2 w-full px-4 py-4 bg-white text-black tracking-widest text-sm uppercase hover:bg-gray-200 transition-colors disabled:opacity-40"
      >
        {submitting ? 'Wird gesendet…' : 'Senden'}
      </button>
      {submitError && (
        <p className="md:col-span-2 text-sm text-red-400">
          Etwas ist schiefgelaufen. Bitte schreiben Sie uns direkt an{' '}
          <a href="mailto:kontakt@widematte.ch" className="underline">kontakt@widematte.ch</a>.
        </p>
      )}
    </form>
  );
}

function App() {
  const [prefill, setPrefill] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const availableCount = apartments.filter(a => a.status === 'available').length;

  const requestInfo = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für die Wohnung Gebäude ${apt.building} · ${floorLabel(apt.floor)} (${apt.rooms} Zimmer, ${apt.size} m²) und bitte um Kontaktaufnahme.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const requestBuildingInfo = (building: string) => {
    setPrefill(`Ich interessiere mich für Wohnungen in Gebäude ${building} und bitte um Kontaktaufnahme sowie Zusendung der Unterlagen.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const requestWaitlist = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für Gebäude ${apt.building} · ${floorLabel(apt.floor)} und möchte auf die Warteliste gesetzt werden.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const grouped = useMemo(() =>
    ['1', '2', '3'].map((building) => ({
      building,
      units: apartments.filter((a) => a.building === building),
    }))
  , []);

  const navLinks = [
    { href: '#apartments', label: 'Wohnungen' },
    { href: '#availability', label: 'Verfügbarkeit' },
    { href: '#plans', label: 'Grundrisse' },
    { href: '#location', label: 'Lage' },
    { href: '#contact', label: 'Kontakt' },
  ];

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span className="text-base md:text-xl font-light tracking-wide">WIDEMATTE</span>
          </div>
          {/* Desktop links */}
          <div className="hidden md:flex gap-8 text-sm tracking-wide">
            {navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </div>
          {/* Mobile burger */}
          <button className="md:hidden p-1" onClick={() => setMenuOpen((o) => !o)} aria-label="Menü">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={closeMenu}
                className="block px-6 py-4 text-sm tracking-wide border-b border-gray-100 last:border-0"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        className="relative h-screen flex items-center justify-center bg-gray-900"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative text-center px-6 max-w-5xl">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-light mb-4 md:mb-6 text-white drop-shadow-md">Ländlich wohnen</h1>
          <p className="text-base md:text-xl font-light text-gray-300 mb-0 px-2 max-w-xl mx-auto">
            Neubauprojekt in Nesselnbach — 4.5- und 5.5-Zimmer-Wohnungen, umgeben von Natur und Stille.
          </p>
          <a href="#apartments" className="inline-block mt-8 md:mt-12 px-8 py-4 bg-black text-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
            Wohnungen entdecken
          </a>
        </div>
        <div className="absolute top-20 md:top-24 right-4 md:right-12">
          <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-light tracking-widest uppercase whitespace-nowrap">{availableCount} von {apartments.length} verfügbar</span>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-gray-950 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-800">
          {[
            { value: '9', label: 'Wohnungen' },
            { value: '3', label: 'Gebäude' },
            { value: '107 – 163 m²', label: 'Wohnfläche' },
            { value: '4.5 – 5.5', label: 'Zimmer' },
          ].map(({ value, label }) => (
            <div key={label} className="md:px-10 first:md:pl-0 last:md:pr-0">
              <p className="text-xl md:text-2xl font-light mb-1">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wohnungen */}
      <section id="apartments" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Wohnungen</h2>
        <p className="text-base md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-16">
          Durchdachte Grundrisse, hochwertige Materialien und ein ländliches, ruhiges Wohnumfeld direkt an der Landwirtschaftszone.
        </p>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {grouped.map(({ building, units }) => (
            <BuildingCard
              key={building}
              building={building}
              units={units}
              onRequest={requestBuildingInfo}
            />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div
        className="h-48 md:h-72 w-full"
        style={{
          backgroundImage: `url('/Images/Aussenansicht/Aussenansicht_BirdView.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      />

      {/* Verfügbarkeit */}
      <section id="availability" className="py-16 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Verfügbarkeit</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-16">
            Aktuell verfügbare Wohnungen zum Kauf und zur Miete.
          </p>

          {/* Mobile: cards */}
          <div className="md:hidden space-y-4">
            {apartments.map((apt) => (
              <div key={apt.id} className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-light">Gebäude {apt.building} · {floorLabel(apt.floor)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {apt.rooms} Zimmer · {apt.size} m²
                      {apt.note && <span className="block text-xs text-gray-400">{apt.note}</span>}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="mb-5">
                  {buildingShowPrice[apt.building] ? (
                    buildingListingType[apt.building] === 'rent' ? (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Mietpreis</p>
                        <p className="text-sm font-light">CHF {Math.round(apt.rent / 12).toLocaleString('de-CH')} / Monat</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Verkaufspreis</p>
                        <p className="text-sm font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
                      </>
                    )
                  ) : buildingListingType[apt.building] === 'rent' ? (
                    <p className="text-sm font-light text-gray-500">Mietobjekt</p>
                  ) : null}
                </div>
                {apt.status === 'available' && (
                  <button
                    onClick={() => requestInfo(apt)}
                    className="w-full py-3 border border-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Unterlagen anfordern
                  </button>
                )}
                {apt.status === 'reserved' && (
                  <button
                    onClick={() => requestWaitlist(apt)}
                    className="w-full py-3 border border-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Warteliste
                  </button>
                )}
                {apt.status === 'sold' && (
                  <p className="text-xs uppercase tracking-widest text-gray-400 text-center py-3 border border-gray-200">Verkauft</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {['Wohnung', 'Zimmer', 'Fläche', 'Preis', 'Status', ''].map((h) => (
                    <th key={h} className={`pb-4 text-[10px] font-normal uppercase tracking-widest text-gray-400${h === '' ? ' text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apartments.map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-100 hover:bg-white transition-colors group">
                    <td className="py-5">
                      <p className="text-base font-light">Gebäude {apt.building} · {floorLabel(apt.floor)}</p>
                      {apt.note && <p className="text-xs text-gray-400 mt-0.5">{apt.note}</p>}
                    </td>
                    <td className="py-5 text-sm text-gray-600">{apt.rooms}</td>
                    <td className="py-5 text-sm text-gray-600">{apt.size} m²</td>
                    <td className="py-5 text-sm font-light">
                      {buildingShowPrice[apt.building] ? (
                        buildingListingType[apt.building] === 'rent'
                          ? <>CHF {Math.round(apt.rent / 12).toLocaleString('de-CH')} <span className="text-xs text-gray-400">/ Mt.</span></>
                          : <>CHF {apt.price.toLocaleString('de-CH')}</>
                      ) : buildingListingType[apt.building] === 'rent' ? (
                        <span className="text-gray-400 font-light">Mietobjekt</span>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="py-5"><StatusBadge status={apt.status} /></td>
                    <td className="py-5 text-right">
                      {apt.status === 'available' ? (
                        <button onClick={() => requestInfo(apt)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-gray-300 hover:border-black pb-0.5">Unterlagen</button>
                      ) : apt.status === 'reserved' ? (
                        <button onClick={() => requestWaitlist(apt)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-gray-300 hover:border-black pb-0.5">Warteliste</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 md:mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Tiefgarage</p>
            <p className="text-base font-light">18 Einstellplätze · CHF 25'920 pro Platz</p>
          </div>
        </div>
      </section>

      {/* Grundrisse */}
      <section id="plans" className="py-16 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Grundrisse</h2>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mb-8 md:mb-12">
            Funktionale Raumaufteilung mit Fokus auf Licht und Alltagstauglichkeit.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { file: '/Images/Grundrisse/Grundriss_EGs.pdf', label: 'Erdgeschoss', sub: 'EG' },
              { file: '/Images/Grundrisse/Grundriss_OGs.pdf', label: 'Obergeschoss', sub: 'OG' },
              { file: '/Images/Grundrisse/Grundriss_DGs.pdf', label: 'Dachgeschoss', sub: 'DG' },
              { file: '/Images/Grundrisse/Grundriss_UGs.pdf', label: 'Untergeschoss', sub: 'UG' },
              { file: '/Images/Grundrisse/Grundriss_GalerieEstrich.pdf', label: 'Galerie / Estrich', sub: 'GAL' },
            ].map(({ file, label, sub }) => (
              <a
                key={file}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 bg-white px-4 py-4 md:px-6 md:py-5 flex justify-between items-center hover:bg-gray-50 active:bg-gray-100 transition-colors last:col-span-2"
              >
                <div>
                  <p className="font-light text-sm md:text-base">{label}</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">PDF</p>
                </div>
                <Download className="w-4 h-4 text-gray-400 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Lage */}
      <section id="location" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Lage</h2>
        <p className="text-base md:text-xl text-gray-600 max-w-2xl mb-8 md:mb-12">
          Nesselnbach bietet ländliche Ruhe mit schneller Anbindung an Lenzburg,
          Aarau, Baden, Zürich, Zug und Luzern.
        </p>
        <div className="flex flex-col gap-5 md:flex-row md:gap-8 text-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Niederwilerstrasse, 5524 Nesselnbach</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 shrink-0" />
            <a href="mailto:kontakt@widematte.ch" className="hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
          </div>
        </div>
        <iframe
          src="https://maps.google.com/maps?q=47.38690377766172,8.290382694997003&output=embed"
          className="border-0 w-full h-64 md:h-96 mt-8"
          title="Standort Widematte"
          allowFullScreen
          loading="lazy"
        />
      </section>

      {/* Kontakt */}
      <section id="contact" className="py-16 md:py-32 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-8">Kontakt</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-6">
            Fordern Sie die Unterlagen an.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-gray-300 mb-10 md:mb-12">
            <a href="mailto:kontakt@widematte.ch" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <Mail className="w-4 h-4" />
              kontakt@widematte.ch
            </a>
            <a href="tel:+41795830089" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <Phone className="w-4 h-4" />
              +41 79 583 00 89
            </a>
          </div>
          <ContactForm initialMessage={prefill} />
        </div>
      </section>

      <footer className="py-16 md:py-20 px-6 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-12">
            <div>
              <p className="text-base tracking-wide font-light mb-3">WIDEMATTE</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Neubauwohnungen in<br />Nesselnbach, Kanton Aargau
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Kontakt</p>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="mailto:kontakt@widematte.ch" className="block hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
                <a href="tel:+41795830089" className="block hover:opacity-60 transition-opacity">+41 79 583 00 89</a>
                <p className="text-gray-600 pt-1">Niederwilerstrasse<br />5524 Nesselnbach</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Rechtliches</p>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="/impressum.html" className="block hover:opacity-60 transition-opacity">Impressum</a>
                <a href="/datenschutz.html" className="block hover:opacity-60 transition-opacity">Datenschutz</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600">© 2026 Widematte. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
