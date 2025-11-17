export interface PinataUploadResponse {
  uri: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://metabackend-c4e4.onrender.com';
const UPLOAD_TIMEOUT = 90000; // 90 seconds to handle cold starts and large uploads
const MAX_RETRIES = 2;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      
      // Don't retry on timeout/abort errors for the last attempt
      if (isLastAttempt || isAbortError) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`Request failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('All retry attempts failed');
}

export async function uploadImageToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error uploading to Pinata:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Upload timeout: The backend is taking longer than expected (${UPLOAD_TIMEOUT / 1000} seconds). This may be due to the server starting up or a large file. Please try again in a moment.`);
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend. Please check your internet connection and try again.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image to Pinata');
  }
}

export async function uploadMetadataToPinata(metadata: object): Promise<string> {
  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/api/upload-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload metadata: ${response.status} ${errorText}`);
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error uploading metadata to Pinata:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Upload timeout: The backend is taking longer than expected (${UPLOAD_TIMEOUT / 1000} seconds). This may be due to the server starting up. Please try again in a moment.`);
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend. Please check your internet connection and try again.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to Pinata');
  }
}
