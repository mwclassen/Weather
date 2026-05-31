import { ImageResponse } from "next/og";
import { sunIconSize } from "@/lib/app-icon-sun";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(sunIconSize(112), {
    width: 180,
    height: 180,
  });
}
