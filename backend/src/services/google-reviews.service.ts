import { env } from "../env.js";

type GooglePlaceDetailsResponse = {
  displayName?: { text?: string };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: Array<{
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    googleMapsUri?: string;
    authorAttribution?: {
      displayName?: string;
      uri?: string;
      photoUri?: string;
    };
  }>;
};

type GooglePlaceReview = NonNullable<GooglePlaceDetailsResponse["reviews"]>[number];

export type PublicGoogleReviewItem = {
  authorName: string;
  authorProfileUri: string | null;
  authorPhotoUri: string | null;
  rating: number;
  relativePublishTimeDescription: string;
  publishTime: string | null;
  text: string;
  googleMapsUri: string | null;
};

export type PublicGoogleReviewsResponse = {
  source: "GOOGLE";
  enabled: boolean;
  placeName: string | null;
  placeGoogleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  items: PublicGoogleReviewItem[];
  updatedAt: string;
};

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toReviewText(review: GooglePlaceReview): string {
  return (
    asNonEmptyString(review.text?.text) ||
    asNonEmptyString(review.originalText?.text) ||
    ""
  );
}

const placesFieldMask = [
  "displayName",
  "googleMapsUri",
  "rating",
  "userRatingCount",
  "reviews.rating",
  "reviews.relativePublishTimeDescription",
  "reviews.publishTime",
  "reviews.text",
  "reviews.originalText",
  "reviews.googleMapsUri",
  "reviews.authorAttribution.displayName",
  "reviews.authorAttribution.uri",
  "reviews.authorAttribution.photoUri",
].join(",");

export async function getPublicGoogleReviews(): Promise<PublicGoogleReviewsResponse> {
  const apiKey = env.GOOGLE_MAPS_API_KEY;
  const placeId = env.HOTEL_GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return {
      source: "GOOGLE",
      enabled: false,
      placeName: null,
      placeGoogleMapsUri: null,
      rating: null,
      userRatingCount: null,
      items: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", env.GOOGLE_REVIEWS_LANGUAGE);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": placesFieldMask,
    },
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch Google reviews: HTTP ${response.status}${details ? ` - ${details}` : ""}`
    );
  }

  const payload = (await response.json()) as GooglePlaceDetailsResponse;
  const rawReviews = Array.isArray(payload.reviews) ? payload.reviews : [];

  const items = rawReviews
    .map((review): PublicGoogleReviewItem | null => {
      const text = toReviewText(review);
      const authorName =
        asNonEmptyString(review.authorAttribution?.displayName) || "Usuario Google";

      if (!text) return null;

      return {
        authorName,
        authorProfileUri: asNonEmptyString(review.authorAttribution?.uri),
        authorPhotoUri: asNonEmptyString(review.authorAttribution?.photoUri),
        rating: asNumber(review.rating) || 0,
        relativePublishTimeDescription:
          asNonEmptyString(review.relativePublishTimeDescription) || "",
        publishTime: asNonEmptyString(review.publishTime),
        text,
        googleMapsUri: asNonEmptyString(review.googleMapsUri),
      };
    })
    .filter((item): item is PublicGoogleReviewItem => item !== null)
    .slice(0, env.GOOGLE_REVIEWS_MAX_ITEMS);

  return {
    source: "GOOGLE",
    enabled: true,
    placeName: asNonEmptyString(payload.displayName?.text),
    placeGoogleMapsUri: asNonEmptyString(payload.googleMapsUri),
    rating: asNumber(payload.rating),
    userRatingCount: asNumber(payload.userRatingCount),
    items,
    updatedAt: new Date().toISOString(),
  };
}
