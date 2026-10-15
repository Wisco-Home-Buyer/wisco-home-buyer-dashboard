/** True for a video file uploaded to our own server (`video-<uuid>.mp4|mov|webm`). */
export function isUploadedVideo(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\/video-[0-9a-f-]{36}\.(mp4|mov|webm)$/i.test(url.split("?")[0]);
}
