/**
 * Geohash encoding.
 *
 * `firestore.rules` requires every `resources` document to carry a non-empty
 * `geohash` string (`validGeohash`), so any write from this portal that moves
 * a pin must recompute it. Precision 9 is ~4.8m — finer than the pin accuracy
 * an operator can achieve by dragging a marker, and the same precision the
 * consumer app's proximity queries assume.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encodeGeohash(lat: number, lng: number, precision = 9): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`encodeGeohash: invalid coordinates (${lat}, ${lng})`);
  }

  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;

  let hash = '';
  let bits = 0;
  let bitCount = 0;
  let evenBit = true;

  while (hash.length < precision) {
    if (evenBit) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        bits = (bits << 1) + 1;
        lngMin = mid;
      } else {
        bits <<= 1;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        bits = (bits << 1) + 1;
        latMin = mid;
      } else {
        bits <<= 1;
        latMax = mid;
      }
    }

    evenBit = !evenBit;
    bitCount += 1;

    if (bitCount === 5) {
      hash += BASE32[bits];
      bits = 0;
      bitCount = 0;
    }
  }

  return hash;
}
