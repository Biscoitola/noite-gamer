export const HOME_HERO_POSTER_KEY = "home.heroPosterUrl";
export const HOME_CAROUSEL_KEY = "home.carouselConfig";
export const DEFAULT_HERO_POSTER_URL = "/assets/folder-noite-gamer.png";

export type HomeCarouselImage = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
};

export type HomeCarouselConfig = {
  speedSeconds: number;
  images: HomeCarouselImage[];
};

export const DEFAULT_HOME_CAROUSEL_CONFIG: HomeCarouselConfig = {
  speedSeconds: 28,
  images: []
};

export function readStringSetting(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function parseHomeCarouselConfig(value: unknown): HomeCarouselConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_HOME_CAROUSEL_CONFIG;
  }

  const data = value as Record<string, unknown>;
  const speedSeconds = clampNumber(data.speedSeconds, 8, 90, DEFAULT_HOME_CAROUSEL_CONFIG.speedSeconds);
  const images = Array.isArray(data.images)
    ? data.images
        .map(parseCarouselImage)
        .filter((image): image is HomeCarouselImage => Boolean(image))
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    : [];

  return { speedSeconds, images };
}

export function isAllowedImageSource(value: string) {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isAllowedOptionalLink(value: string) {
  if (!value) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function parseCarouselImage(value: unknown): HomeCarouselImage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const id = typeof data.id === "string" && data.id ? data.id : "";
  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : "";
  const imageUrl = typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : "";
  if (!id || !title || !imageUrl) return null;

  return {
    id,
    title,
    imageUrl,
    linkUrl: typeof data.linkUrl === "string" ? data.linkUrl.trim() : "",
    order: clampNumber(data.order, -999, 999, 0),
    isActive: data.isActive !== false
  };
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}
