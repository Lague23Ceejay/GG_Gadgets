import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { promoEventsApi } from "@/lib/promoEvents";
import type { PromoEvent } from "@/types";

export function EventsCarousel() {
  const [events, setEvents] = useState<PromoEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promoEventsApi
      .listActive()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  if (loading || events.length === 0) return null;

  const current = events[index];
  const goPrev = () => setIndex((i) => (i === 0 ? events.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === events.length - 1 ? 0 : i + 1));

  const eventLinkTo = current.link_url
    ? `${current.link_url}${current.link_url.includes("?") ? "&" : "?"}event=${encodeURIComponent(
        current.title
      )}&event_id=${current.event_id}`
    : undefined;

  const Wrapper = eventLinkTo ? Link : "div";
  const wrapperProps = eventLinkTo ? { to: eventLinkTo } : {};

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        {/* @ts-expect-error - Wrapper is dynamically Link or div depending on link_url */}
        <Wrapper {...wrapperProps} className="block">
          <div className="relative aspect-[16/9] w-full bg-zinc-900 sm:aspect-[21/9]">
            <img
              src={current.image_url}
              alt={current.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              {current.discount_percent && (
                <span className="mb-2 inline-block rounded-full bg-spark-400 px-3 py-1 font-mono text-xs font-bold text-zinc-900">
                  SAVE UP TO {current.discount_percent}%
                </span>
              )}
              <h3 className="font-display text-2xl font-700 text-white sm:text-3xl">
                {current.title}
              </h3>

              {(current.starts_at || current.ends_at) && (
                <p className="mb-1 text-xs text-white/70">
                  {current.starts_at && new Date(current.starts_at) > new Date()
                    ? `Starts ${new Date(current.starts_at).toLocaleString()}`
                    : current.ends_at
                    ? `Ends ${new Date(current.ends_at).toLocaleString()}`
                    : ""}
                </p>
              )}

              {current.description && (
                <p className="mt-1 max-w-xl text-sm text-white/80 sm:text-base">
                  {current.description}
                </p>
              )}
            </div>
          </div>
        </Wrapper>

        {events.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous event"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label="Next event"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
