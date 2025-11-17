export interface PinataUploadResponse {
  uri: string;
}

// Get backend URL and ensure protocol matches frontend when in production
function getBackendURL(): string {
  const envBackendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:10000';
  
  // If running in browser and frontend is HTTPS, ensure backend URL is also HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // Only upgrade if the backend URL is HTTP (not already HTTPS)
    if (envBackendURL.startsWith('http://')) {
      // Replace http:// with https:// to avoid mixed content
      return envBackendURL.replace('http://', 'https://');
    }
  }
  
  return envBackendURL;
}

export async function uploadImageToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const backendURL = getBackendURL();

  try {
    const response = await fetch(`${backendURL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${backendURL}. Please ensure the backend server is running.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image to Pinata');
  }
}

export async function uploadMetadataToPinata(metadata: object): Promise<string> {
  const backendURL = getBackendURL();
  
  try {
    const response = await fetch(`${backendURL}/api/upload-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload metadata: ${response.status} ${errorText}`);
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${backendURL}. Please ensure the backend server is running.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to Pinata');
  }
}
