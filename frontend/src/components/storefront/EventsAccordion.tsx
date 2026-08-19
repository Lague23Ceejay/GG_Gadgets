import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { promoEventsApi } from "@/lib/promoEvents";
import type { PromoEvent } from "@/types";
import AccordionGallery from "@/components/storefront/AccordionGallery";

export function EventsAccordion({ autoPlay = false }: { autoPlay?: boolean }) {
  const [events, setEvents] = useState<PromoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    promoEventsApi.listActive().then(setEvents).finally(() => setLoading(false));
  }, []);

  if (loading || events.length === 0) return null;

  const handleEventClick = (event: PromoEvent, e: React.MouseEvent) => {
    e.preventDefault();
    if (event.is_upcoming) {
      // Nothing to browse yet — surface the start date instead of navigating
      const when = event.starts_at ? new Date(event.starts_at).toLocaleString() : "soon";
      alert(`"${event.title}" hasn't started yet — check back on ${when}.`);
      return;
    }
    navigate(`/shop?event_id=${event.event_id}&event=${encodeURIComponent(event.title)}`);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <AccordionGallery
        items={events.map((event) => ({
          image: event.image_url,
          label: event.is_upcoming
            ? `${event.title} — Coming soon`
            : event.discount_percent
              ? `${event.title} — Save up to ${event.discount_percent}%`
              : event.title,
          link: "#",
          onClick: (e: React.MouseEvent) => handleEventClick(event, e),
        }))}
        defaultIndex={0}
        trigger="hover"
        autoPlay={autoPlay}
        accentColor="#5B5FEF"
        overlayColor="#0B0B0F"
      />
    </section>
  );
}