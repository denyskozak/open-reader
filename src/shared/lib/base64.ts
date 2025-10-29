const BASE64_CHUNK_SIZE = 0x8000;

export async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (let offset = 0; offset < bytes.length; offset += BASE64_CHUNK_SIZE) {
    const slice = bytes.subarray(offset, offset + BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary);
}
