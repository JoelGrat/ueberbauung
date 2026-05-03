import { Building2, ChevronDown, Mail, MapPin, Phone, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Apartment {
  id: number;
  building: '1' | '2' | '3';
  number: string;
  size: number;
  bedrooms: number;
  price: number;
  floor: number;
  status: 'available' | 'reserved' | 'sold';
}

interface ApartmentImage {
  apartment_id: number;
  image_type: string;
  storage_path: string;
}

const apartments: Apartment[] = [
  { id: 1, building: '1', number: '101', size: 85, bedrooms: 2, price: 450000, floor: 0, status: 'available' },
  { id: 2, building: '1', number: '102', size: 95, bedrooms: 3, price: 520000, floor: 1, status: 'available' },
  { id: 3, building: '1', number: '103', size: 110, bedrooms: 3, price: 580000, floor: 2, status: 'reserved' },
  { id: 4, building: '2', number: '201', size: 75, bedrooms: 2, price: 420000, floor: 0, status: 'sold' },
  { id: 5, building: '2', number: '202', size: 85, bedrooms: 2, price: 465000, floor: 1, status: 'sold' },
  { id: 6, building: '2', number: '203', size: 100, bedrooms: 3, price: 550000, floor: 2, status: 'sold' },
  { id: 7, building: '3', number: '301', size: 90, bedrooms: 2, price: 485000, floor: 0, status: 'available' },
  { id: 8, building: '3', number: '302', size: 105, bedrooms: 3, price: 565000, floor: 1, status: 'available' },
  { id: 9, building: '3', number: '303', size: 120, bedrooms: 4, price: 650000, floor: 2, status: 'available' },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const bucketName = (import.meta.env.VITE_SUPABASE_BUCKET as string | undefined) ?? 'images';
const defaultHeroPath = 'Aussenansicht.jpg';
const heroBackgroundUrl = supabaseUrl && bucketName
  ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${defaultHeroPath}`
  : undefined;
const interiorFallbacks: Record<Apartment['building'], string> = {
  1: '6636_Inter_cam01_v2.jpg',
  2: '6636_Inter_cam02_v2.jpg',
  3: '6636_Inter_cam03_v2.jpg',
};
const supabase: SupabaseClient | null = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function floorLabel(floor: number) {
  if (floor === 0) return 'EG';
  if (floor === 2) return 'DG';
  return `${floor}. OG`;
}

function ApartmentCard({ apt, images }: { apt: Apartment; images: ApartmentImage[] }) {
  const apartmentImages = images.filter((img) => img.apartment_id === apt.id);
  const heroImage = apartmentImages.find((img) => img.image_type === 'hero');
  const buildingFallback = interiorFallbacks[apt.building] ?? defaultHeroPath;
  const imagePath = heroImage?.storage_path ?? buildingFallback;
  const imageUrl = supabaseUrl && bucketName && imagePath
    ? `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imagePath}`
    : null;

  return (
    <div className="border overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {imageUrl ? (
        <img src={imageUrl} alt={`Apartment ${apt.number}`} className="w-full h-64 object-cover" />
      ) : (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Upload images</p>
          </div>
        </div>
      )}
      <div className="p-8">
        <div className="flex justify-between mb-4">
          <span className="text-2xl font-light">Whg. {apt.number}</span>
          <span className="text-sm text-gray-600">{floorLabel(apt.floor)}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {apt.size} m² · {apt.bedrooms} Zimmer
        </p>
        <p className="text-2xl font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
      </div>
    </div>
  );
}

function App() {
  const [images, setImages] = useState<ApartmentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('apartment_images')
        .select('apartment_id, image_type, storage_path');

      if (fetchError) {
        setError('Bilder konnten nicht geladen werden.');
        setLoading(false);
        return;
      }

      setImages(data || []);
      setLoading(false);
    };

    fetchImages();
  }, []);

  const grouped = useMemo(() => {
    return ['1', '2', '3'].map((building) => ({
      building,
      units: apartments.filter((a) => a.building === building),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            <span className="text-xl font-light tracking-wide">RESIDENZEN NESSELBACH</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm tracking-wide">
            <a href="#apartments">Wohnungen</a>
            <a href="#availability">Verfügbarkeit</a>
            <a href="#plans">Grundrisse</a>
            <a href="#location">Lage</a>
            <a href="#contact">Kontakt</a>
          </div>
        </div>
      </nav>

      <section
        className="relative h-screen flex items-center justify-center bg-gray-50"
        style={heroBackgroundUrl ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${heroBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="relative text-center px-6 max-w-5xl text-white drop-shadow-md">
          <h1 className="text-7xl md:text-9xl font-light mb-6">Ruhig wohnen.</h1>
          <p className="text-xl md:text-2xl font-light text-gray-100 mb-12">
            Drei Gebäude. Neun Wohnungen. Zeitlose Architektur im Aargau.
          </p>
          <a href="#apartments" className="px-8 py-4 bg-black/80 text-white text-sm tracking-widest">
            WOHNUNGEN ENTDECKEN
          </a>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      <section id="apartments" className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-6xl font-light mb-6">Wohnungen</h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-16">
          Durchdachte Grundrisse, hochwertige Materialien und ein ruhiges Wohnumfeld.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-500">Bilder werden geladen...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {grouped.map(({ building, units }) => (
              <div key={building}>
                <h3 className="text-4xl font-light mb-8">Gebäude {building}</h3>
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

      <section id="availability" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl font-light mb-6">Verfügbarkeit</h2>
          <p className="text-xl text-gray-600 max-w-2xl mb-16">
            Aktuell verfügbare Wohnungen zur Erwerbung.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Wohnung', 'Fläche', 'Zimmer', 'Kaufpreis', 'Status', ''].map((h) => (
                    <th key={h} className={`py-6 text-xs font-normal uppercase tracking-widest text-gray-400${h === '' ? ' text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {apartments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-white transition-colors">
                    <td className="py-7 text-xl font-light">Geb. {apt.building} · {floorLabel(apt.floor)}</td>
                    <td className="py-7 text-sm text-gray-700">{apt.size} m²</td>
                    <td className="py-7 text-sm text-gray-700">{apt.bedrooms} Zimmer</td>
                    <td className="py-7 text-base font-light">CHF {apt.price.toLocaleString('de-CH')}</td>
                    <td className="py-7">
                      {apt.status === 'available' && (
                        <span className="px-3 py-1 bg-green-500 text-white text-[10px] uppercase tracking-widest rounded-full">Verfügbar</span>
                      )}
                      {apt.status === 'reserved' && (
                        <span className="px-3 py-1 bg-amber-400 text-white text-[10px] uppercase tracking-widest rounded-full">Reserviert</span>
                      )}
                      {apt.status === 'sold' && (
                        <span className="px-3 py-1 bg-gray-400 text-white text-[10px] uppercase tracking-widest rounded-full">Verkauft</span>
                      )}
                    </td>
                    <td className="py-7 text-right">
                      {apt.status === 'available' ? (
                        <a href="#contact" className="text-xs border-b border-black pb-1 uppercase tracking-widest hover:opacity-50 transition-opacity">Unterlagen anfordern</a>
                      ) : apt.status === 'reserved' ? (
                        <span className="text-xs border-b border-gray-300 pb-1 uppercase tracking-widest text-gray-400 cursor-not-allowed">Warteliste</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="plans" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-6xl font-light mb-6">Grundrisse</h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Funktionale Raumaufteilung mit Fokus auf Licht und Alltagstauglichkeit.
          </p>
        </div>
      </section>

      <section id="location" className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-6xl font-light mb-6">Lage</h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-12">
          Nesselnbach bietet ländliche Ruhe mit schneller Anbindung an Lenzburg,
          Wohlen und Aarau.
        </p>
        <div className="flex flex-col md:flex-row gap-8 text-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5" />
            <span>5603 Nesselnbach, Schweiz</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5" />
            <span>+41 41 000 00 00</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>info@residenzen-nesselbach.ch</span>
          </div>
        </div>
      </section>

      <section id="contact" className="py-32 px-6 bg-black text-white">
        <div className="max-w-4xl">
          <h2 className="text-6xl font-light mb-8">Kontakt</h2>
          <p className="text-xl text-gray-400 mb-12">
            Fordern Sie die Verkaufsunterlagen an oder vereinbaren Sie eine Besichtigung.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <input
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none"
              placeholder="Ihr Name"
            />
            <input
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none"
              placeholder="Ihre E-Mail"
              type="email"
            />
            <input
              className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-800 focus:outline-none"
              placeholder="Telefon"
              type="tel"
            />
            <button className="w-full px-4 py-3 bg-white text-black tracking-wide">Unterlagen anfordern</button>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-black text-white border-t border-gray-800">
        <p className="text-sm text-gray-400">© 2026 Residenzen Nesselbach</p>
      </footer>
    </div>
  );
}

export default App;
