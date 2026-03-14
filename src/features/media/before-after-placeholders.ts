import type { ImageAsset } from "@/types/site";

type BeforeAfterSide = "before" | "after";

const sideStyles: Record<
  BeforeAfterSide,
  {
    badgeLabel: string;
    accentStart: string;
    accentEnd: string;
    frameFill: string;
    frameStroke: string;
  }
> = {
  before: {
    badgeLabel: "BEFORE",
    accentStart: "#f97316",
    accentEnd: "#ef4444",
    frameFill: "rgba(248, 113, 113, 0.14)",
    frameStroke: "rgba(254, 202, 202, 0.42)",
  },
  after: {
    badgeLabel: "AFTER",
    accentStart: "#06b6d4",
    accentEnd: "#22c55e",
    frameFill: "rgba(34, 197, 94, 0.14)",
    frameStroke: "rgba(187, 247, 208, 0.42)",
  },
};

const escapeSvgText = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const toPathSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";

const wrapTitle = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length <= 3) {
    return [value.trim()];
  }

  const halfwayPoint = Math.ceil(words.length / 2);
  return [words.slice(0, halfwayPoint).join(" "), words.slice(halfwayPoint).join(" ")];
};

const createPlaceholderDataUri = (side: BeforeAfterSide, label: string) => {
  const style = sideStyles[side];
  const titleLines = wrapTitle(label);
  const [firstLine, secondLine = ""] = titleLines;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720" role="img" aria-label="${escapeSvgText(
      `${style.badgeLabel} ${label}`,
    )}">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="${style.accentStart}" />
          <stop offset="100%" stop-color="${style.accentEnd}" />
        </linearGradient>
      </defs>
      <rect width="960" height="720" fill="url(#bg)" rx="40" />
      <rect x="72" y="84" width="816" height="552" rx="32" fill="${style.frameFill}" stroke="${style.frameStroke}" stroke-width="2" />
      <rect x="112" y="132" width="172" height="52" rx="26" fill="url(#accent)" />
      <text x="198" y="166" fill="#f8fafc" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="2">${style.badgeLabel}</text>
      <text x="112" y="290" fill="#f8fafc" font-family="Arial, sans-serif" font-size="52" font-weight="700">${escapeSvgText(firstLine)}</text>
      <text x="112" y="354" fill="#f8fafc" font-family="Arial, sans-serif" font-size="52" font-weight="700">${escapeSvgText(secondLine)}</text>
      <text x="112" y="462" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="30">Sample image placeholder</text>
      <circle cx="770" cy="258" r="74" fill="none" stroke="url(#accent)" stroke-width="8" />
      <circle cx="770" cy="258" r="38" fill="url(#accent)" opacity="0.55" />
      <path d="M716 508c34-38 74-60 120-66" fill="none" stroke="url(#accent)" stroke-linecap="round" stroke-width="12" />
      <path d="M716 552c46-22 88-28 136-22" fill="none" stroke="url(#accent)" stroke-linecap="round" stroke-width="12" opacity="0.75" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const createBeforeAfterPlaceholderImage = ({
  side,
  label,
  alt,
  pathId,
}: {
  side: BeforeAfterSide;
  label: string;
  alt: string;
  pathId: string;
}): ImageAsset => ({
  url: createPlaceholderDataUri(side, label),
  path: `seed://before-after/${toPathSegment(pathId)}-${side}`,
  alt,
});
