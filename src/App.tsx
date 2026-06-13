import { Building2, Bus, Car, ChevronDown, ChevronLeft, ChevronRight, Download, GraduationCap, Leaf, Mail, MapPin, Menu, ShoppingCart, Upload, X } from 'lucide-react';
import { Fragment, lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const LocationMap = lazy(() => import('./LocationMap'));

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

interface Apartment {
  id: number;
  building: '1' | '2' | '3';
  size: number;
  sizeBrutto?: number;
  sizeBalkon?: number;
  sizeGarden?: number;
  sizeEstrich?: number;
  sizeKeller?: number;
  sizePP?: number;
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
  { id: 1, building: '1', size: 107, sizeBrutto: 134, sizeBalkon: 24, sizeGarden: 117, sizeEstrich: 0,   sizeKeller: 15, sizePP: 36, rooms: 4.5, rent: 30000, price: 1390000, floor: 0, status: 'available' },
  { id: 2, building: '1', size: 107, sizeBrutto: 134, sizeBalkon: 24, sizeGarden: 0,   sizeEstrich: 0,   sizeKeller: 13, sizePP: 29, rooms: 4.5, rent: 28000, price: 1200000, floor: 1, status: 'available', note: 'Optional 3.5 Zimmer', placeholder: true, outdoor: 24 },
  { id: 3, building: '1', size: 107, sizeBrutto: 134, sizeBalkon: 24, sizeGarden: 0,   sizeEstrich: 38,  sizeKeller: 13, sizePP: 32, rooms: 4.5, rent: 30000, price: 1380000, floor: 2, status: 'available' },
  // Gebäude 2 – verkauft
  { id: 4, building: '2', size: 127, sizeBrutto: 156, sizeBalkon: 27, sizeGarden: 282, sizeEstrich: 0,   sizeKeller: 22, sizePP: 37, rooms: 4.5, rent: 34000, price: 0, floor: 0, status: 'sold', placeholder: true },
  { id: 5, building: '2', size: 127, sizeBrutto: 156, sizeBalkon: 27, sizeGarden: 0,   sizeEstrich: 0,   sizeKeller: 13, sizePP: 29, rooms: 4.5, rent: 32000, price: 0, floor: 1, status: 'sold', placeholder: true },
  { id: 6, building: '2', size: 163, sizeBrutto: 156, sizeBalkon: 27, sizeGarden: 0,   sizeEstrich: 113, sizeKeller: 16, sizePP: 37, rooms: 5.5, rent: 36000, price: 0, floor: 2, status: 'sold', placeholder: true },
  // Gebäude 3
  { id: 7, building: '3', size: 115, sizeBrutto: 143, sizeBalkon: 24, sizeGarden: 168, sizeEstrich: 0,   sizeKeller: 14, sizePP: 29, rooms: 4.5, rent: 32000, price: 1490000, floor: 0, status: 'available', placeholder: true },
  { id: 8, building: '3', size: 115, sizeBrutto: 143, sizeBalkon: 24, sizeGarden: 0,   sizeEstrich: 0,   sizeKeller: 12, sizePP: 30, rooms: 4.5, rent: 30000, price: 1300000, floor: 1, status: 'available' },
  { id: 9, building: '3', size: 113, sizeBrutto: 143, sizeBalkon: 24, sizeGarden: 0,   sizeEstrich: 50,  sizeKeller: 14, sizePP: 36, rooms: 4.5, rent: 32000, price: 1450000, floor: 2, status: 'reserved', placeholder: true },
];

const buildingListingType: Record<string, 'sale' | 'rent'> = {
  '1': 'sale',
  '2': 'sale',
  '3': 'sale',
};

const buildingShowPrice: Record<string, boolean> = {
  '1': true,
  '2': false,
  '3': true,
};

// Local paths (starting with /) are served from public/. Supabase filenames get the storage base prepended.
const buildingImagePaths: Record<string, string[]> = {
  '1': [
    '/Images/Aussenansicht/Gebeaude_1_Highlight.png',
    '/Images/Innenansicht/Geb1_EG_Livingroom.jpg',
    '/Images/Innenansicht/Geb1_DG_Livingroom.jpg',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
    '/Images/Aussenansicht/Aussenansicht_BirdView.jpg',
  ],
  '2': [
    '/Images/Aussenansicht/Gebeaude_2_Highlight.png',
    '/Images/Aussenansicht/Foto_Richtung_Berge.png',
    '/Images/Aussenansicht/Aussenansicht_2.jpg',
    '/Images/Aussenansicht/Aussenansicht_BirdView.jpg',
  ],
  '3': [
    '/Images/Aussenansicht/Gebeaude_3_Highlight.png',
    '/Images/Innenansicht/Geb3_OG_Livingroom.jpg',
    //'/Images/Innenansicht/Geb3_EG_Badezimmer.jpg',
    '/Images/Aussenansicht/Foto_Richtung_Berge.png',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
    '/Images/Aussenansicht/Aussenansicht_1.jpg',
    '/Images/Aussenansicht/Aussenansicht_BirdView.jpg',
  ],
};

const buildingDescriptions: Record<string, string> = {
  '1': 'Offene Grundrisse, helle Räume und direkter Blick ins Grüne und auf den Bach — optional auch als 3.5-Zimmer.',
  '2': 'Grosszügige 4.5-Zimmer-Wohnungen.',
  '3': 'Ruhige Südausrichtung mit direktem Bezug zur angrenzenden Landwirtschaftszone.',
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const heroBackgroundUrl = '/Images/Aussenansicht/Aussenansicht_0.jpg';
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function floorLabel(floor: number) {
  if (floor === 0) return 'EG';
  if (floor === 2) return 'DG';
  return 'OG';
}

function grundrissUrl(building: string, floor: number): string {
  const code = floor === 0 ? 'EG' : floor === 2 ? 'DG' : 'OG';
  return `/Images/Grundrisse/Grundriss_${code}_${building}.pdf`;
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

function BuildingCard({ building, units, onRequestUnit, onWaitlistUnit }: {
  building: string;
  units: Apartment[];
  onRequestUnit: (apt: Apartment) => void;
  onWaitlistUnit: (apt: Apartment) => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openUnits, setOpenUnits] = useState<Set<number>>(new Set());
  const toggleUnit = (id: number) => setOpenUnits(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

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
  const allSold = units.every(u => u.status === 'sold');
  const listingType = buildingListingType[building] ?? 'sale';

  const roomsLabel = minRooms === maxRooms ? `${minRooms}` : `${minRooms}–${maxRooms}`;
  const sizeLabel = minSize === maxSize ? `${minSize}` : `${minSize}–${maxSize}`;

  const renderUnitPrice = (apt: Apartment) => {
    if (buildingShowPrice[building]) {
      if (listingType === 'rent') {
        return <p className="text-sm font-light">CHF {Math.round(apt.rent / 12).toLocaleString('de-CH')} <span className="text-xs text-gray-400">/ Mt.</span></p>;
      }
      return (
        <>
          <p className="text-sm font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">inkl. 2 Tiefgaragenparkplätze</p>
        </>
      );
    }
    if (listingType === 'rent') return <p className="text-sm font-light text-gray-500">Mietobjekt</p>;
    return null;
  };

  const actionLinkClass = "text-[10px] uppercase tracking-widest text-gray-500 hover:text-black transition-colors border-b border-gray-300 hover:border-black pb-0.5";

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
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 md:w-8 md:h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronLeft className="w-5 h-5 md:w-4 md:h-4" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 md:w-8 md:h-8 bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
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
        {!allSold && <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">{roomsLabel} Zimmer · {sizeLabel} <span className="normal-case">m²</span></p>}
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
          {buildingDescriptions[building]}
        </p>
        {/* Wohnungen des Gebäudes */}
        <div className="border-t border-gray-200 mt-2">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 pt-4 pb-1">{units.length} Wohnungen</p>
          {units.map((apt) => {
            const hasDetails = apt.building !== '2';
            const isOpen = openUnits.has(apt.id);
            return (
              <div
                key={apt.id}
                className={`-mx-6 md:-mx-8 px-6 md:px-8 border-b border-gray-100 last:border-b-0 border-l-2 border-l-transparent transition-colors ${
                  isOpen ? 'bg-gray-50 border-l-black' : hasDetails ? 'hover:bg-gray-50/70' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => hasDetails && toggleUnit(apt.id)}
                  aria-expanded={hasDetails ? isOpen : undefined}
                  disabled={!hasDetails}
                  className={`w-full flex justify-between items-start gap-3 py-4 text-left group ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div>
                    <p className="text-sm font-light">Wohnung {apt.building}.{apt.floor + 1} · {floorLabel(apt.floor)}</p>
                    {hasDetails && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {apt.rooms} Zimmer · {apt.size} m²{apt.note ? ` · ${apt.note}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={apt.status} />
                    {hasDetails && (
                      <ChevronDown className={`w-4 h-4 transition-all group-hover:text-black ${isOpen ? 'rotate-180 text-black' : 'text-gray-400'}`} />
                    )}
                  </div>
                </button>

                {hasDetails && isOpen && (
                  <div className="pb-4">
                    <p className="text-[11px] text-gray-400">
                      {[
                        apt.sizeBrutto && `${apt.sizeBrutto} m² BWF`,
                        (apt.sizeBalkon ?? 0) > 0 && `${apt.sizeBalkon} m² Balkon`,
                        (apt.sizeGarden ?? 0) > 0 && `${apt.sizeGarden} m² Garten`,
                        (apt.sizeEstrich ?? 0) > 0 && `${apt.sizeEstrich} m² Estrich`,
                        (apt.sizeKeller ?? 0) > 0 && `${apt.sizeKeller} m² Keller`,
                      ].filter(Boolean).join(' · ')}
                    </p>

                    <div className="flex justify-between items-end gap-3 mt-3">
                      <div>{renderUnitPrice(apt)}</div>
                      <div className="flex items-center gap-4 shrink-0">
                        <a
                          href={grundrissUrl(apt.building, apt.floor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={actionLinkClass}
                        >
                          Grundriss
                        </a>
                        {apt.status === 'available' && (
                          <button onClick={() => onRequestUnit(apt)} className={actionLinkClass}>Anfragen</button>
                        )}
                        {apt.status === 'reserved' && (
                          <button onClick={() => onWaitlistUnit(apt)} className={actionLinkClass}>Warteliste</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {building !== '2' && (
            <a
              href="/Images/Grundrisse/Grundriss_UGs.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-between items-center py-4 border-t border-gray-200 group"
            >
              <div>
                <p className="text-sm font-light group-hover:text-black transition-colors">Untergeschoss</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Kellerabteile & Tiefgarage · PDF</p>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors shrink-0" />
            </a>
          )}
        </div>

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

  const inputClass = "w-full px-4 py-3 bg-white text-black text-base md:text-sm border border-gray-300 focus:outline-none focus:border-gray-800 disabled:opacity-40 placeholder:text-gray-400 transition-colors";

  if (submitted) {
    return (
      <p className="text-xl font-light text-gray-600">
        Vielen Dank, {name}. Wir melden uns in Kürze bei Ihnen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 md:gap-5">
      <input
        required
        className={inputClass}
        placeholder="Ihr Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
      />
      <input
        required
        type="email"
        className={inputClass}
        placeholder="Ihre E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <input
        type="tel"
        className={inputClass}
        placeholder="Telefon (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={submitting}
      />
      <textarea
        rows={4}
        className={`md:col-span-2 resize-none ${inputClass}`}
        placeholder="Ihre Nachricht (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={submitting}
        className="md:col-span-2 w-full px-4 py-4 bg-black text-white tracking-widest text-xs uppercase hover:bg-gray-900 transition-colors disabled:opacity-40"
      >
        {submitting ? 'Wird gesendet…' : 'Senden'}
      </button>
      <p className="md:col-span-2 text-xs text-gray-400">
        Ihre Angaben werden vertraulich behandelt.{' '}
        <a href="/datenschutz.html" className="underline hover:opacity-60 transition-opacity">Datenschutz</a>
      </p>
      {submitError && (
        <p className="md:col-span-2 text-sm text-red-600">
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

  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    const ids = ['apartments', 'location', 'contact'];
    const onScroll = () => {
      const y = window.scrollY + 100;
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const requestInfo = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für die Wohnung Gebäude ${apt.building}.${apt.floor + 1} · ${floorLabel(apt.floor)} (${apt.rooms} Zimmer, ${apt.size} m²) und bitte um Kontaktaufnahme.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const requestWaitlist = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für Gebäude ${apt.building}.${apt.floor + 1} · ${floorLabel(apt.floor)} und möchte auf die Warteliste gesetzt werden.`);
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
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`transition-opacity hover:opacity-60 pb-0.5 ${activeSection === l.href.slice(1) ? 'border-b border-black' : ''}`}
              >
                {l.label}
              </a>
            ))}
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
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%), url(${heroBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative text-center px-6 max-w-5xl">
          <h1 className="text-3xl sm:text-5xl md:text-7xl md:whitespace-nowrap font-light mb-4 md:mb-6 text-white drop-shadow-md">Wohnqualität mit Zukunft</h1>
          <p className="text-base md:text-xl font-light text-gray-300 mb-0 px-2 max-w-xl mx-auto">
            9 moderne Wohnungen an einer charmanten familienfreundlichen Wohnlage, mit durchdachten Grundrissen und direkt am Dorfrand.
          </p>
        </div>
        <div className="absolute top-20 md:top-24 right-4 md:right-12">
          <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-light tracking-widest uppercase whitespace-nowrap">{availableCount} von {apartments.length} verfügbar</span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-gray-50 border-y border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-0 md:divide-x md:divide-gray-200">
          {[
            { value: '9', label: 'Wohnungen' },
            { value: '3', label: 'Gebäude' },
            { value: '107 - 115 m²', label: 'Wohnfläche' },
            { value: '4.5', label: 'Zimmer' },
            { value: 'Minergie-P', label: 'Standard' },
            { value: '2027', label: 'Bezug' },
          ].map(({ value, label }) => (
            <div key={label} className="md:px-10 first:md:pl-0 last:md:pr-0">
              <p className="text-xl md:text-2xl font-light mb-1 text-black whitespace-nowrap">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wohnungen */}
      <section id="apartments" className="py-12 md:py-32 px-6 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">01 / Wohnungen</p>
        <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Wohnungen</h2>
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mb-4">
          Hochwertige Neubauwohnungen an ruhiger Lage — für anspruchsvolles Wohnen im Einklang mit der Natur.
        </p>
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mb-8">
          Neun Eigentumswohnungen in drei Gebäuden — mit je 4.5 Zimmern und Wohnflächen von 107 bis 115 m². Jede Wohnung verfügt über zwei Tiefgaragenparkplätze, Kellerabteil sowie privaten Aussenbereich.
        </p>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 mb-10 md:mb-16">
          {[
            'Ökologische Fertigholzbauweise',
            'Minergie-P',
            'Solar-Panels & Erdsonde',
            'Lift pro Gebäude',
            'Max. 3 Wohnungen pro Gebäude',
            '2 Tiefgaragenplätze pro Wohnung',
          ].map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-widest text-gray-500 border border-gray-200 px-3 py-2 sm:py-1.5">{tag}</span>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
          {grouped.map(({ building, units }, i) => (
            <Fragment key={building}>
              {i > 0 && <div aria-hidden="true" className="md:hidden h-px bg-gray-200 mx-8 -my-2" />}
              <BuildingCard
                building={building}
                units={units}
                onRequestUnit={requestInfo}
                onWaitlistUnit={requestWaitlist}
              />
            </Fragment>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div
        className="relative h-48 md:h-72 w-full overflow-hidden"
        style={{
          backgroundImage: `url('/Images/Aussenansicht/Aussenansicht_BirdView.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
          <p className="text-white/80 text-[10px] uppercase tracking-widest">Die Überbauung · Nesselnbach, Kanton Aargau</p>
        </div>
      </div>

      {/* Innenraumgestaltung */}
      <section className="py-12 md:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-center">
          <div className="md:w-1/2 shrink-0 overflow-hidden">
            <img
              src="/Images/Innenansicht/Geb1_EG_Livingroom.jpg"
              alt="Innenansicht Wohnbereich"
              className="w-full h-72 md:h-[520px] object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-light mb-6 md:mb-8">Individuelle Innenraumgestaltung</h2>
            <p className="text-base text-gray-500 leading-relaxed mb-6">
              Ein moderner, klarer Stil prägt das Bild der Innenräume. Warme Parkettböden oder moderne Plattenböden schaffen eine einladende Atmosphäre ganz auf die Bedürfnisse der Käufer zugeschnitten. Die gezielt eingesetzte Beleuchtung aus Einbauspots verstärkt die Eleganz der Räume. Die grosszügigen, bodentiefen Fenster lassen viel Licht herein und bieten einen nahtlosen Übergang zur natürlichen Umgebung. Die offene Gestaltung von Küche und Wohnbereich fördert ein geselliges Zusammensein in stilvollem Ambiente.
            </p>
            <p className="text-base text-gray-500 leading-relaxed">
              Im Mittelpunkt steht der Mensch: Bereits während der Planungs- und Bauphase erhalten Sie als künftige Eigentümerinnen und Eigentümer individuelle Mitgestaltungsmöglichkeiten – abgestimmt auf persönliche Wünsche und Lebensstile.
            </p>
          </div>
        </div>
      </section>

      {/* Aussenbereiche */}
      <section className="py-12 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-12 md:gap-20 items-center">
          <div className="md:w-1/2 shrink-0 overflow-hidden">
            <img
              src="/Images/Aussenansicht/Aussenansicht_1.jpg"
              alt="Aussenbereich Garten und Balkone"
              className="w-full h-72 md:h-[520px] object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-light mb-6 md:mb-8">Privater Gartenanteil und Balkone</h2>
            <p className="text-base text-gray-500 leading-relaxed">
              Die Résidenz bietet vielfältige Aussenbereiche, die perfekt auf entspannte Stunden im Freien und Kundenwünsche abgestimmt sind. Private Balkone im Obergeschoss und ebenso private, grosse Gartenanteile der Gartenwohnungen sind ideal für ruhige Momente oder geselliges Beisammensein. Diese Freiräume ermöglichen, die Natur in ihrer ganzen Vielfalt zu geniessen.
            </p>
          </div>
        </div>
      </section>

      {/* Divider Bergblick */}
      <div
        className="relative h-56 md:h-96 w-full overflow-hidden"
        style={{
          backgroundImage: `url('/Images/Aussenansicht/Foto_Richtung_Berge.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
          <p className="text-white/80 text-[10px] uppercase tracking-widest">Ausblick Richtung Berge</p>
        </div>
      </div>

      {/* Lage */}
      <section id="location" className="py-12 md:py-32 px-6 max-w-7xl mx-auto">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">02 / Lage</p>
        <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Lage</h2>
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mb-10 md:mb-14">
          Nesselnbach gehört zur Gemeinde Niederwil und liegt im Reusstal zwischen Mellingen und Bremgarten, eingebettet zwischen Wald und Reuss. Familienfreundliche, sonnige Lage direkt am Dorfrand und am kleinen Bach.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-gray-200 mb-10 md:mb-14">
          {[
            {
              Icon: Bus,
              label: 'Öffentlicher Verkehr',
              text: 'PostAuto im 30-Min.-Takt zur S-Bahn-Station Mellingen Heitersberg — von dort direkte Verbindungen nach Baden, Zürich und Luzern.',
            },
            {
              Icon: Car,
              label: 'Auto',
              text: 'Direkter Anschluss an die A1 bei Mägenwil sowie an die Westumfahrung Richtung Zürich und Luzern via Oberwil-Lieli.',
            },
            {
              Icon: ShoppingCart,
              label: 'Einkauf & Alltag',
              text: 'Metzgerei, Bäckerei und Volg mit Postagentur in Niederwil, erreichbar in wenigen Fahrminuten. Einkaufen: Migros und Coop in Bremgarten, Mellingen und Wohlen.',
            },
            {
              Icon: GraduationCap,
              label: 'Bildung',
              text: 'Kindergarten, Primar- und Sekundarschule zu Fuss in 15 Min. erreichbar (Niederwil). Kantonsschulen in Baden und Wohlen.',
            },
            {
              Icon: Leaf,
              label: 'Naherholung',
              text: 'Wald und Reussufer direkt vor der Haustür. Flachsee in Bremgarten für Ausflüge in die Natur.',
            },
            {
              Icon: Building2,
              label: 'Gemeinde',
              text: '4\'200 Einwohner, 430 m ü. M. Vielseitiges Vereinsleben: Musikverein, Fussballverein, Turnverein, Feuerwehr, Kirchenchor u.v.m.',
            },
          ].map(({ Icon, label, text }) => (
            <div key={label} className="border-b border-gray-200 py-7 pr-6 lg:pr-10">
              <Icon className="w-4 h-4 text-gray-400 mb-3" />
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{label}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Fahrzeiten + Adresse */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Fahrzeiten ÖV</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { place: 'Mellingen Heitersberg', time: '18 Min.',  note: 'PostAuto → S-Bahn' },
                  { place: 'Baden',                 time: '40 Min.',  note: 'PostAuto' },
                  { place: 'Zürich Sihl-City',      time: '50 Min.',  note: 'via Bremgarten' },
                  { place: 'Luzern',                time: '1h 15',    note: 'via Wohlen' },
                ].map(({ place, time, note }) => (
                  <div key={place} className="border border-gray-200 px-4 py-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400">{time}</span>
                      <span className="text-sm font-light">{place}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Fahrzeiten Auto</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { place: 'A1 Mägenwil',           time: '10 Min.' },
                  { place: 'Westumfahrung',          time: '15 Min.' },
                  { place: 'Mellingen / Bremgarten', time: '10 Min.' },
                  { place: 'Zürich',                 time: '35 Min.' },
                  { place: 'Bern',                   time: '65 Min.' },
                ].map(({ place, time }) => (
                  <div key={place} className="border border-gray-200 px-4 py-2 flex items-baseline gap-2">
                    <span className="text-xs text-gray-400">{time}</span>
                    <span className="text-sm font-light">{place}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Niederwilerstrasse 1a/b/c, 5524 Nesselnbach</span>
            </div>
          </div>

          {/* Karte */}
          <div className="lg:sticky lg:top-24">
            <ClientOnly>
              <Suspense fallback={<div className="w-full h-72 md:h-[480px] bg-gray-100" />}>
                <LocationMap />
              </Suspense>
            </ClientOnly>
            <a
              href="https://www.google.com/maps/search/?api=1&query=47.38690,8.29038"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              In Google Maps öffnen
            </a>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="contact" className="py-12 md:py-32 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">03 / Kontakt</p>
          <h2 className="text-3xl md:text-6xl font-light mb-4 md:mb-6">Kontakt</h2>
          <p className="text-base md:text-xl text-gray-500 mb-6">
            Wir begleiten Sie gerne — sprechen Sie mit uns.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-gray-600 text-sm mb-10 md:mb-12">
            <a href="mailto:kontakt@widematte.ch" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <Mail className="w-4 h-4" />
              kontakt@widematte.ch
            </a>
          </div>
          <ContactForm initialMessage={prefill} />
        </div>
      </section>

      <footer className="py-16 md:py-20 px-6 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 mb-12">
            <div>
              <p className="text-2xl tracking-[0.2em] font-light mb-3">WIDEMATTE</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Neubauwohnungen in<br />Nesselnbach, Kanton Aargau
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-4">Kontakt</p>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="mailto:kontakt@widematte.ch" className="block hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
<p className="text-gray-600 pt-1">Joel und Yves Gratwohl<br />Niederwilerstrasse<br />5524 Nesselnbach</p>
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
