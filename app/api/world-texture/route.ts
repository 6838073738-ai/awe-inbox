import { NextResponse } from "next/server";

// Proxies NASA GIBS Blue Marble Next Generation — a clean equirectangular
// composite of the Earth (December 2004) sourced from MODIS Terra. Served
// from our origin so the Three.js TextureLoader avoids CORS preflight.
// Public domain (US government work). The image is static, so we cache hard.

const SOURCE =
  "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi" +
  "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0" +
  // Bathymetry variant has rendered ocean floor + ridges, so oceans don't
  // collapse to pure black on a sphere — gives the planet visible volume.
  "&LAYERS=BlueMarble_ShadedRelief_Bathymetry" +
  "&CRS=EPSG:4326&BBOX=-90,-180,90,180" +
  "&WIDTH=2048&HEIGHT=1024&FORMAT=image/jpeg" +
  "&TIME=2004-12-01";

export const dynamic = "force-static";
export const revalidate = 2592000; // 30 days

export async function GET() {
  const res = await fetch(SOURCE, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  if (!res.ok || !res.body) {
    return new NextResponse("Texture unavailable", { status: 502 });
  }
  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}
