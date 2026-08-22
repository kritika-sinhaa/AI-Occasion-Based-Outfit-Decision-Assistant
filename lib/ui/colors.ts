export const COLOR_HEX: Record<string, string> = {
  Black: "#1c1a17",
  White: "#f7f4ee",
  Beige: "#dccbb0",
  Navy: "#202b47",
  Blue: "#3d5a99",
  Emerald: "#1f6f52",
  Rust: "#a8532f",
  Camel: "#b48c5a",
  Gold: "#c8a546",
  Silver: "#c7c7cb",
  Brown: "#5a3c28",
  Charcoal: "#3c3c3f",
  Nude: "#e1bea5",
  Grey: "#8c8c8c",
};

export function colorHex(name: string): string {
  return COLOR_HEX[name] ?? "#a99f8e";
}

export function readableTextOn(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1c1a17" : "#faf7f2";
}
