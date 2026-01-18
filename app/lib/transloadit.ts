export async function uploadToTransloadit(
  file: File,
  templateId: string
): Promise<{ url: string }> {


  const authRes = await fetch("/api/transloadit/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId }),
  });

  if (!authRes.ok) {
    throw new Error("Failed to get Transloadit auth");
  }

  const { params, signature } = await authRes.json();

  // 2. Build form data (DO NOT MODIFY params)
  const formData = new FormData();
  formData.append("params", params);
  formData.append("signature", signature);
  formData.append("file", file);

  // 3. Upload
  const res = await fetch("https://api2.transloadit.com/assemblies", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("Transloadit response:", data);

  // 4. Extract output
  let url: string | undefined;

  if (data.uploads?.[0]?.ssl_url) {
    url = data.uploads[0].ssl_url;
  }

  if (!url && data.results) {
    for (const step of Object.values(data.results) as any[][]) {
      for (const file of step) {
        if (file.ssl_url) {
          url = file.ssl_url;
          break;
        }
      }
      if (url) break;
    }
  }

  if (!url) {
    throw new Error("Transloadit upload failed – no output file returned");
  }

  return { url };
}
