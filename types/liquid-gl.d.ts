declare module "liquid-gl" {
  type LiquidGLOptions = {
    target: string;
    snapshot?: string;
    resolution?: number;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: "none" | "fade";
    tilt?: boolean;
    tiltFactor?: number;
    tiltEase?: number;
    magnify?: number;
    on?: { init?: (instance: unknown) => void };
  };

  type LiquidGL = ((options: LiquidGLOptions) => unknown) & {
    registerDynamic(elements: string | Element[]): void;
  };

  const liquidGL: LiquidGL;
  export default liquidGL;
}
