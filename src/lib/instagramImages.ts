// Central catalogue of real studio images pulled from Instagram (@adu_studio99).
// Files live in public/instagram/ so URLs never expire (Instagram CDN links do).
// post-*.jpg + carousel-*.jpg: profile grid covers.
// work-*.jpg: extra photos from inside the post carousels.
// Use resolveInstagramImage() to guarantee no legacy Unsplash placeholder leaks
// through when the database still holds old seed URLs.

export const INSTAGRAM_POSTS = [
  "/instagram/post-12.jpg",
  "/instagram/post-11.jpg",
  "/instagram/post-5.jpg",
  "/instagram/post-3.jpg",
  "/instagram/post-8.jpg",
  "/instagram/post-6.jpg",
  "/instagram/carousel-2a.jpg",
  "/instagram/carousel-2b.jpg",
  "/instagram/post-9.jpg",
  "/instagram/post-10.jpg",
  "/instagram/post-4.jpg",
  "/instagram/post-1.jpg",
  "/instagram/post-2.jpg",
  "/instagram/post-7.jpg",
  "/instagram/work-01.jpg",
  "/instagram/work-02.jpg",
  "/instagram/work-03.jpg",
  "/instagram/work-04.jpg",
  "/instagram/work-05.jpg",
  "/instagram/work-06.jpg",
  "/instagram/work-07.jpg",
  "/instagram/work-08.jpg",
  "/instagram/work-09.jpg",
  "/instagram/work-10.jpg",
  "/instagram/work-11.jpg",
  "/instagram/work-12.jpg",
  "/instagram/work-13.jpg",
  "/instagram/work-14.jpg",
  "/instagram/work-15.jpg",
  "/instagram/work-16.jpg",
  "/instagram/work-17.jpg",
  "/instagram/work-18.jpg",
  "/instagram/work-19.jpg",
  "/instagram/work-20.jpg",
  "/instagram/work-21.jpg",
  "/instagram/work-22.jpg",
  "/instagram/work-23.jpg",
  "/instagram/work-24.jpg",
  "/instagram/work-25.jpg",
  "/instagram/work-26.jpg",
  "/instagram/work-27.jpg",
  "/instagram/work-28.jpg",
  "/instagram/work-29.jpg",
  "/instagram/work-30.jpg",
  "/instagram/work-31.jpg",
  "/instagram/work-32.jpg",
  "/instagram/work-33.jpg",
  "/instagram/work-34.jpg",
  "/instagram/work-35.jpg",
  "/instagram/work-36.jpg",
  "/instagram/work-37.jpg",
  "/instagram/work-38.jpg",
  "/instagram/work-39.jpg",
  "/instagram/work-40.jpg",
  "/instagram/work-41.jpg",
  "/instagram/work-42.jpg",
  "/instagram/work-43.jpg",
  "/instagram/work-44.jpg",
  "/instagram/work-45.jpg",
  "/instagram/work-46.jpg",
  "/instagram/work-47.jpg",
  "/instagram/work-48.jpg",
  "/instagram/work-49.jpg",
  "/instagram/work-50.jpg",
  "/instagram/work-51.jpg",
  "/instagram/work-52.jpg",
  "/instagram/work-53.jpg",
  "/instagram/work-54.jpg",
] as const;

// Homepage hero: img_index=2 of https://www.instagram.com/p/DHer3aINNhj/
// (photographer shooting on the field).
export const HOMEPAGE_HERO_IMAGE = "/instagram/carousel-2a.jpg";

// Contact + location details as published on the studio flyer
// (post https://www.instagram.com/adu_studio99/p/DVzGPHeDbxT/).
export const STUDIO_CONTACTS = {
  addressOrArea: "Wellingara, Latrikunda Highway, The Gambia",
  phone: "+220 3135947 / +220 2135552",
  whatsappNumber: "+2203135947",
  instagramUrl: "https://www.instagram.com/adu_studio99/",
  facebookHandle: "Adu photography99",
  wavePaymentInstructions:
    "Wave / QMoney Mobile Transfer: Send payment to +220 3135947 with your Booking Reference as note.",
} as const;

/**
 * Map any legacy/remote placeholder image URL to a local Instagram image.
 * Local (/instagram/...) and other app URLs pass through untouched.
 */
export function resolveInstagramImage(url: string | null | undefined, index = 0): string {
  if (!url) return INSTAGRAM_POSTS[index % INSTAGRAM_POSTS.length];
  if (url.startsWith("/instagram/")) return url;
  if (url.startsWith("/") && !url.startsWith("http")) return url;
  if (/unsplash|picsum|placeholder|placehold\.it|dummyimage/i.test(url)) {
    return INSTAGRAM_POSTS[index % INSTAGRAM_POSTS.length];
  }
  return url;
}
