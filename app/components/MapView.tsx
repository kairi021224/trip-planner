'use client';

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

export type Spot = {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  url?: string;
};

type Props = {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  spots?: Spot[];
  activeSpotId?: string;
  onMarkerClick?: (spotId?: string) => void;
};

export default function MapView({
  center = [139.7671, 35.6812],
  zoom = 11,
  spots = [],
  activeSpotId,
  onMarkerClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Array<{ marker: maplibregl.Marker; spotId?: string }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(entry => entry.marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, zoom, spots.length]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(entry => entry.marker.remove());
    markersRef.current = [];

    if (spots.length === 0) {
      const marker = new maplibregl.Marker().setLngLat(center).addTo(mapRef.current);
      markersRef.current.push({ marker, spotId: undefined });
      return;
    }

    const bounds = new maplibregl.LngLatBounds();

    spots.forEach(spot => {
      const popup = new maplibregl.Popup({ offset: 16 }).setHTML(
        `<div><strong>${spot.name}</strong>${spot.description ? `<div>${spot.description}</div>` : ""}${spot.url ? `<div><a href="${spot.url}" target="_blank" rel="noreferrer">Link</a></div>` : ""}</div>`,
      );

      const marker = new maplibregl.Marker()
        .setLngLat([spot.lng, spot.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      if (onMarkerClick) {
        marker.getElement().addEventListener("click", () => onMarkerClick(spot.id));
      }

      markersRef.current.push({ marker, spotId: spot.id });
      bounds.extend([spot.lng, spot.lat]);
    });

    const fit = () => {
      if (bounds.isEmpty()) return;
      mapRef.current?.fitBounds(bounds, {
        padding: 60,
        maxZoom: 14,
        duration: 600,
      });
    };

    if (mapRef.current?.isStyleLoaded()) {
      fit();
    } else {
      mapRef.current?.once("load", fit);
    }
  }, [spots, center, onMarkerClick]);

  useEffect(() => {
    if (!mapRef.current || !activeSpotId) return;
    const found = markersRef.current.find(entry => entry.spotId === activeSpotId);
    if (!found) return;

    const lngLat = found.marker.getLngLat();
    const popup = found.marker.getPopup();
    if (popup) {
      popup.addTo(mapRef.current);
    }
    mapRef.current.easeTo({
      center: lngLat,
      duration: 500,
      zoom: Math.max(mapRef.current.getZoom(), 13),
    });
  }, [activeSpotId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
