// Regions for the Stride Social creator globe (components/social/CreatorGlobe.astro), west to east:
// the order the globe turns through them, so a swipe or scroll always moves the same way round.
// Positions are each region's rough centre (latitude, longitude).
//
// `creator` is the featured creator for the region: a roster id, filled in by Stride. It shows only
// once that creator's consent is confirmed and their country is recorded (src/lib/roster.ts), so
// the globe never claims a location we don't have. Until then the phone shows `work`, a case study
// whose own footage stands in (labelled "Interim" on screen), or a labelled empty state.
// The region list itself is a proposal from the brief; confirm it with Stride.

export type CreatorRegion = {
  key: string;
  label: string;
  lat: number;
  lon: number;
  creator: string | null;
  work: string | null;
};

export const creatorRegions: CreatorRegion[] = [
  { key: 'north-america', label: 'North America', lat: 40, lon: -98, creator: null, work: 'papaya-gaming' },
  { key: 'latin-america', label: 'Latin America', lat: -12, lon: -62, creator: null, work: null },
  { key: 'europe', label: 'UK & Europe', lat: 51, lon: 6, creator: null, work: 'temu-scaling-paid-social-with-500-ugc-videos' },
  { key: 'asia', label: 'Asia', lat: 20, lon: 105, creator: null, work: 'holafly-app---driving-app-downloads-with-travel-influencers' },
  { key: 'australia', label: 'Australia', lat: -25, lon: 134, creator: null, work: null },
];
