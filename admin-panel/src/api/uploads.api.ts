import { httpClient } from "./httpClient";
import { ENDPOINTS } from "./endpoints";

export async function adminUploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await httpClient.post<{ success: boolean; data: { url: string } }>(
    ENDPOINTS.ADMIN_UPLOAD,
    form,
  );
  if (data.success !== true) {
    throw new Error("Upload failed");
  }
  return data.data.url;
}
