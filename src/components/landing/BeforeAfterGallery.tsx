import { motion } from "framer-motion";

import type { BeforeAfterSectionContent, ImageAsset } from "@/types/site";

interface BeforeAfterGalleryProps {
  content: BeforeAfterSectionContent;
}

interface GalleryImagePanelProps {
  badgeLabel: "Before" | "After";
  asset: ImageAsset;
  fallbackLabel: string;
  badgeClassName: string;
}

const GalleryImagePanel = ({
  badgeLabel,
  asset,
  fallbackLabel,
  badgeClassName,
}: GalleryImagePanelProps) => (
  <div className="overflow-hidden">
    <div className="relative aspect-[4/3] bg-muted">
      {asset.url ? (
        <img src={asset.url} alt={asset.alt || fallbackLabel} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted px-6 text-center text-sm text-muted-foreground">
          {asset.alt || fallbackLabel}
        </div>
      )}
      <span
        className={`absolute left-4 top-4 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClassName}`}
      >
        {badgeLabel}
      </span>
    </div>
    <div className="border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">{asset.alt || fallbackLabel}</p>
    </div>
  </div>
);

const BeforeAfterGallery = ({ content }: BeforeAfterGalleryProps) => (
  <section id="before-after" className="py-20">
    <div className="container">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-3 text-muted-foreground">{content.description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {[...content.items].sort((left, right) => left.order - right.order).map((item, index) => (
          <motion.article
            key={`${item.label}-${item.order}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <div className="grid border-b md:grid-cols-2">
              <GalleryImagePanel
                badgeLabel="Before"
                asset={item.beforeImage}
                fallbackLabel={`${item.label} before image`}
                badgeClassName="bg-destructive/90 text-destructive-foreground"
              />
              <GalleryImagePanel
                badgeLabel="After"
                asset={item.afterImage}
                fallbackLabel={`${item.label} after image`}
                badgeClassName="bg-primary/90 text-primary-foreground"
              />
            </div>
            <div className="px-4 py-4">
              <p className="text-center font-display text-sm font-semibold text-foreground">{item.label}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default BeforeAfterGallery;
