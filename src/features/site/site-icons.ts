import type { LucideIcon } from "lucide-react";
import {
  Award,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";

import type { SiteIconName } from "@/types/site";

const siteIconMap: Record<SiteIconName, LucideIcon> = {
  Award,
  Clock,
  Cpu,
  Database,
  Download,
  HardDrive,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Wifi,
  Wrench,
  Zap,
};

export const siteIconOptions = Object.keys(siteIconMap) as SiteIconName[];

export const getSiteIcon = (iconName: SiteIconName): LucideIcon => {
  return siteIconMap[iconName];
};
