import type { CSSProperties } from "react";

const SKY = "linear-gradient(180deg, #3B82C4 0%, #6CB4EE 45%, #A8D8FF 100%)";
const SUN = "#FFD93D";
const SUN_GLOW = "#FFB800";
const RAY = "#FFE566";

export function sunIconSize(diameter: number) {
  const sun = Math.round(diameter * 0.42);
  const rayLength = Math.round(diameter * 0.14);
  const rayWidth = Math.max(8, Math.round(diameter * 0.06));
  const rays = 8;

  const rayStyle = (rotation: number): CSSProperties => ({
    position: "absolute",
    left: "50%",
    top: "50%",
    width: rayWidth,
    height: rayLength,
    marginLeft: -rayWidth / 2,
    marginTop: -(sun / 2 + rayLength),
    background: RAY,
    borderRadius: rayWidth / 2,
    transform: `rotate(${rotation}deg)`,
    transformOrigin: `${rayWidth / 2}px ${sun / 2 + rayLength}px`,
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: SKY,
      }}
    >
      <div
        style={{
          position: "relative",
          width: diameter,
          height: diameter,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {Array.from({ length: rays }).map((_, i) => (
          <div key={i} style={rayStyle((360 / rays) * i)} />
        ))}
        <div
          style={{
            width: sun,
            height: sun,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #FFF8DC 0%, ${SUN} 45%, ${SUN_GLOW} 100%)`,
            boxShadow: `0 0 ${Math.round(diameter * 0.12)}px ${SUN_GLOW}`,
          }}
        />
      </div>
    </div>
  );
}
