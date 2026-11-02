// Light hover/loop previews: six-second cuts of a case study's own campaign footage
// (public/assets/video/preview-*.mp4, about 0.1–1 MB each), keyed by work entry id.
// Used where full campaign videos (up to 30 MB) would be too heavy to load on hover or scroll.
export const workPreviews: Record<string, string> = {
  'temu-scaling-paid-social-with-500-ugc-videos': '/assets/video/preview-temu.mp4',
  'holafly-app---driving-app-downloads-with-travel-influencers': '/assets/video/preview-holafly.mp4',
  'papaya-gaming': '/assets/video/preview-papaya.mp4',
};
