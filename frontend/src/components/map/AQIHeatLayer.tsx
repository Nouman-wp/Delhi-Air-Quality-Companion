import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { AQIReading } from "../../types";

/**
 * A Strava-style AQI heat overlay. Rather than a classic additive heatmap
 * (whose intensities saturate to a single colour on a dense grid), each grid
 * cell is painted as a radial gradient in its own *absolute* AQI colour, so the
 * blended field maps exactly to the AQI scale. A CSS blur on the canvas turns
 * the overlapping cells into a continuous plume with no visible grid.
 *
 * The canvas lives in Leaflet's overlayPane and is repositioned/redrawn on
 * moveend/zoomend (the same mechanism leaflet.heat uses) so it stays aligned.
 */
export function AQIHeatLayer({ points, opacity = 0.5 }: { points: AQIReading[]; opacity?: number }) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const canvas = L.DomUtil.create("canvas", "aqi-heat-canvas leaflet-zoom-hide") as HTMLCanvasElement;
    canvas.style.position = "absolute";
    canvas.style.pointerEvents = "none";
    canvasRef.current = canvas;
    map.getPanes().overlayPane.appendChild(canvas);

    const draw = () => {
      const data = pointsRef.current;
      const size = map.getSize();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Keep the viewport-sized canvas pinned to the map's top-left corner
      // within the (transformed) overlay pane.
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
      canvas.width = size.x;
      canvas.height = size.y;
      ctx.clearRect(0, 0, size.x, size.y);
      if (data.length < 2) return;

      // Radius = on-screen spacing between two adjacent grid cells, so cells
      // always overlap enough to blend, at any zoom level.
      const a = map.latLngToContainerPoint([data[0].lat, data[0].lon]);
      const b = map.latLngToContainerPoint([data[1].lat, data[1].lon]);
      const spacing = Math.hypot(a.x - b.x, a.y - b.y) || 24;
      const radius = Math.max(22, spacing * 1.45);
      const margin = radius + 40;

      // Paint higher-AQI cells last so hotspots read on top of cleaner air.
      const ordered = [...data].sort((p, q) => p.aqi - q.aqi);

      for (const point of ordered) {
        const pt = map.latLngToContainerPoint([point.lat, point.lon]);
        if (pt.x < -margin || pt.y < -margin || pt.x > size.x + margin || pt.y > size.y + margin) continue;

        const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
        grad.addColorStop(0, hexToRgba(point.color, opacity));
        grad.addColorStop(0.5, hexToRgba(point.color, opacity * 0.55));
        grad.addColorStop(1, hexToRgba(point.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    map.on("moveend zoomend viewreset resize", draw);
    return () => {
      map.off("moveend zoomend viewreset resize", draw);
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Redraw when the data itself changes (new AQI grid arrives).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    map.fire("viewreset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  return null;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
