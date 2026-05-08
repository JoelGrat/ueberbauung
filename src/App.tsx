import { Building2, ChevronDown, Mail, MapPin, Menu, Upload, X } from 'lucide-react';
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
}

interface ApartmentImage {
  apartment_id: number;
  image_type: string;
  storage_path: string;
}

const apartments: Apartment[] = [
  // Gebäude 1
  { id: 1, building: '1', size: 107, rooms: 4.5, rent: 30000, price: 1250000, floor: 0, status: 'available' },
  { id: 2, building: '1', size: 108, rooms: 3.5, rent: 28000, price: 1100000, floor: 1, status: 'available', note: 'Optional 4.5 Zimmer', placeholder: true },
  { id: 3, building: '1', size: 107, rooms: 4.5, rent: 30000, price: 1150000, floor: 2, status: 'available' },
  // Gebäude 2 – verkauft
  { id: 4, building: '2', size: 127, rooms: 4.5, rent: 34000, price: 1450000, floor: 0, status: 'sold', placeholder: true },
  { id: 5, building: '2', size: 127, rooms: 4.5, rent: 32000, price: 1250000, floor: 1, status: 'sold', placeholder: true },
  { id: 6, building: '2', size: 163, rooms: 5.5, rent: 36000, price: 1400000, floor: 2, status: 'sold', placeholder: true },
  // Gebäude 3
  { id: 7, building: '3', size: 115, rooms: 4.5, rent: 32000, price: 1300000, floor: 0, status: 'available', placeholder: true },
  { id: 8, building: '3', size: 115, rooms: 4.5, rent: 30000, price: 1250000, floor: 1, status: 'available' },
  { id: 9, building: '3', size: 113, rooms: 4.5, rent: 32000, price: 1300000, floor: 2, status: 'reserved', placeholder: true  },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'images';
const defaultHeroPath = 'Aussenansicht.jpg';
const heroBackgroundUrl = supabaseUrl && bucketName
  ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${defaultHeroPath}`
  : undefined;
const interiorFallbacks: Record<number, string> = {
  0: '6636_Inter_cam01_v2.jpg',  // EG
  1: '6636_Inter_cam03_v2.jpg',  // 1. OG
  2: '6636_Inter_cam02_v2.jpg',  // DG
};
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function floorLabel(floor: number) {
  if (floor === 0) return 'EG';
  if (floor === 2) return 'DG';
  return `${floor}. OG`;
}

function StatusBadge({ status }: { status: Apartment['status'] }) {
  if (status === 'available') return <span className="px-3 py-1 bg-green-500 text-white text-[10px] uppercase tracking-widest rounded-full">Verfügbar</span>;
  if (status === 'reserved') return <span className="px-3 py-1 bg-amber-400 text-white text-[10px] uppercase tracking-widest rounded-full">Reserviert</span>;
  return <span className="px-3 py-1 bg-gray-400 text-white text-[10px] uppercase tracking-widest rounded-full">Verkauft</span>;
}

function ApartmentCard({ apt, images }: { apt: Apartment; images: ApartmentImage[] }) {
  const apartmentImages = images.filter((img) => img.apartment_id === apt.id);
  const heroImage = apartmentImages.find((img) => img.image_type === 'hero');
  const buildingFallback = interiorFallbacks[apt.floor] ?? defaultHeroPath;
  const imagePath = heroImage?.storage_path ?? buildingFallback;
  const imageUrl = !apt.placeholder && supabaseUrl && bucketName && imagePath
    ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`
    : null;

  return (
    <div className="border overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {imageUrl ? (
        <img src={imageUrl} alt={`Gebäude ${apt.building} ${floorLabel(apt.floor)}`} className="w-full h-56 md:h-64 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-56 md:h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Bild folgt</p>
          </div>
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xl md:text-2xl font-light">{floorLabel(apt.floor)}</span>
          <StatusBadge status={apt.status} />
        </div>
        <p className="text-sm text-gray-600 mb-1">{apt.rooms} Zimmer · {apt.size} m²</p>
        {apt.note && <p className="text-xs text-gray-400 mb-3">{apt.note}</p>}
        {!apt.note && <div className="mb-3" />}
        <p className="text-xs text-gray-400 mb-1">Verkaufspreis</p>
        <p className="text-xl md:text-2xl font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
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
    if (!supabase) return;
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
        {submitting ? 'Wird gesendet…' : 'Unterlagen anfordern'}
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
  const [images, setImages] = useState<ApartmentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefill, setPrefill] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const requestInfo = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für die Wohnung Gebäude ${apt.building} · ${floorLabel(apt.floor)} (${apt.rooms} Zimmer, ${apt.size} m²) und bitte um Kontaktaufnahme.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchImages = async () => {
      if (!supabase) { setLoading(false); return; }
      const { data, error: fetchError } = await supabase
        .from('apartment_images')
        .select('apartment_id, image_type, storage_path');
      if (fetchError) { setLoading(false); return; }
      setImages(data || []);
      setLoading(false);
    };
    fetchImages();
  }, []);

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
    <div className="min-h-screen bg-white text-black">

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
        style={heroBackgroundUrl ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="relative text-center px-6 max-w-5xl">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-light mb-6 text-white drop-shadow-md whitespace-nowrap">Ländlich wohnen.</h1>
          <p className="text-lg md:text-2xl font-light text-gray-200 mb-10 md:mb-12">
            Drei Gebäude. Neun Wohnungen. Zeitlose Architektur im Aargau.
          </p>
          <a href="#apartments" className="inline-block px-8 py-4 bg-black/80 text-white text-xs tracking-widest uppercase">
            Wohnungen entdecken
          </a>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Wohnungen */}
      <section id="apartments" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Wohnungen</h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 md:mb-16">
          Durchdachte Grundrisse, hochwertige Materialien und ein ländliches, ruhiges Wohnumfeld direkt an der Landwirtschaftszone.
        </p>
        {loading ? (
          <p className="text-gray-500">Bilder werden geladen…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {grouped.map(({ building, units }) => (
              <div key={building}>
                <h3 className="text-2xl md:text-4xl font-light mb-6 md:mb-8">Gebäude {building}</h3>
                <div className="space-y-6">
                  {units.map((apt) => (
                    <ApartmentCard key={apt.id} apt={apt} images={images} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verfügbarkeit */}
      <section id="availability" className="py-16 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Verfügbarkeit</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 md:mb-16">
            Aktuell verfügbare Wohnungen zur Erwerbung.
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
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Verkaufspreis</p>
                    <p className="text-sm font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
                  </div>
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
                  <p className="text-xs uppercase tracking-widest text-gray-400 text-center py-3 border border-gray-200">Reserviert</p>
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
                <tr className="border-b border-gray-200">
                  {['Wohnung', 'Zimmer', 'NWF', 'Verkaufspreis', 'Status', ''].map((h) => (
                    <th key={h} className={`py-6 text-xs font-normal uppercase tracking-widest text-gray-400${h === '' ? ' text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white transition-colors">
                    <td className="py-7 text-xl font-light">Gebäude {apt.building} · {floorLabel(apt.floor)}</td>
                    <td className="py-7 text-sm text-gray-700">
                      {apt.rooms}
                      {apt.note && <span className="block text-xs text-gray-400">{apt.note}</span>}
                    </td>
                    <td className="py-7 text-sm text-gray-700">{apt.size} m²</td>
                    <td className="py-7 text-base font-light">CHF {apt.price.toLocaleString('de-CH')}</td>
                    <td className="py-7"><StatusBadge status={apt.status} /></td>
                    <td className="py-7 text-right">
                      {apt.status === 'available' ? (
                        <button onClick={() => requestInfo(apt)} className="text-xs border-b border-black pb-1 uppercase tracking-widest hover:opacity-50 transition-opacity">Unterlagen anfordern</button>
                      ) : apt.status === 'reserved' ? (
                        <span className="text-xs border-b border-gray-300 pb-1 uppercase tracking-widest text-gray-400 cursor-not-allowed">Warteliste</span>
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
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Grundrisse</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            Funktionale Raumaufteilung mit Fokus auf Licht und Alltagstauglichkeit.
          </p>
        </div>
      </section>

      {/* Lage */}
      <section id="location" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Lage</h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-12">
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
      </section>

      {/* Kontakt */}
      <section id="contact" className="py-16 md:py-32 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto md:mx-0">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-8">Kontakt</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">
            Fordern Sie die Unterlagen an.
          </p>
          <ContactForm initialMessage={prefill} />
        </div>
      </section>

      <footer className="py-10 md:py-12 px-6 bg-black text-white border-t border-gray-800">
        <p className="text-sm text-gray-400">© 2026 Widematte</p>
      </footer>
    </div>
  );
}

export default App;
