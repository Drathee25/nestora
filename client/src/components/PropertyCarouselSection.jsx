import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../lib/currency';
import api from '../lib/api';

export default function PropertyCarouselSection() {
  const [properties, setProperties] = useState([]);
  const trackRef = useRef(null);

  useEffect(() => {
    api
      .get('/properties')
      .then(({ data }) => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  function scrollByCards(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const amount = card ? card.offsetWidth + 20 : 320;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <section className="bg-[#faf3e7] py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium mb-2">
              Delhi NCR
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-[#1f4d36]">Explore Our Listings</h2>
          </div>
          {properties.length > 0 && (
            <div className="hidden sm:flex gap-3">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="Previous"
                className="w-10 h-10 rounded-full border border-[#1f4d36]/15 flex items-center justify-center text-[#1f4d36] hover:bg-[#1f4d36]/5 transition-colors"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="Next"
                className="w-10 h-10 rounded-full border border-[#1f4d36]/15 flex items-center justify-center text-[#1f4d36] hover:bg-[#1f4d36]/5 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>

        {properties.length === 0 ? (
          <p className="text-[#1f4d36]/50 text-sm py-10 text-center">
            Listings are unavailable right now — please check back shortly.
          </p>
        ) : (
          <div
            ref={trackRef}
            className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
          >
            {properties.map((p) => (
              <Link
                key={p.id}
                to={`/listings/${p.id}`}
                data-card
                className="snap-start shrink-0 w-[78vw] sm:w-[320px] rounded-xl overflow-hidden border border-[#1f4d36]/10 bg-white"
              >
                <div className="aspect-[4/3] bg-[#1f4d36]/5">
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[#d97f2e] font-semibold">{formatINR(p.price)}</p>
                  <h4 className="font-medium mt-1 text-[#1f4d36]">{p.title}</h4>
                  <p className="text-sm text-[#1f4d36]/60 mt-1">{p.address}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/listings"
          className="inline-block mt-8 px-6 py-3 bg-[#1f4d36] text-[#faf3e7] rounded-full text-sm tracking-wide hover:bg-[#143527] transition-colors"
        >
          View All Listings
        </Link>
      </div>
    </section>
  );
}
