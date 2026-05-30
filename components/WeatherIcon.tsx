"use client";

import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudLightning,
  CloudDrizzle,
  Sun,
} from "lucide-react";
import type { WeatherIconType } from "@/lib/open-meteo";

const iconMap = {
  sun: Sun,
  "partly-cloudy": CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunder: CloudLightning,
};

export function WeatherIcon({
  type,
  className = "w-6 h-6",
}: {
  type: WeatherIconType;
  className?: string;
}) {
  const Icon = iconMap[type];
  return <Icon className={`${className} text-accent`} strokeWidth={1.5} />;
}
