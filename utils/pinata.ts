export interface PinataUploadResponse {
  uri: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function uploadImageToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload image to Pinata');
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
      throw new Error('Failed to upload metadata');
    }

    const data: PinataUploadResponse = await response.json();
    return data.uri;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw new Error('Failed to upload metadata to Pinata');
  }
}
