import { ImageResponse } from "next/og";
import { sunIconSize } from "@/lib/app-icon-sun";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(sunIconSize(320), {
    width: 512,
    height: 512,
  });
}
