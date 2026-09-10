declare module "wawoff2" {
  /** Decompresses a WOFF2 buffer into an OpenType/TrueType buffer. */
  export function decompress(input: Uint8Array): Promise<Uint8Array>;
  export function compress(input: Uint8Array): Promise<Uint8Array>;
}
