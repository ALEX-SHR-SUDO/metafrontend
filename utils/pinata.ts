export interface PinataUploadResponse {
  uri: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://metabackend-c4e4.onrender.com';

export async function uploadImageToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
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
      throw new Error(`Cannot connect to backend at ${BACKEND_URL}. Please ensure the backend server is running.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image to Pinata');
  }
}

export async function uploadMetadataToPinata(metadata: object): Promise<string> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/upload-metadata`, {
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
      throw new Error(`Cannot connect to backend at ${BACKEND_URL}. Please ensure the backend server is running.`);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to upload metadata to Pinata');
  }
}
