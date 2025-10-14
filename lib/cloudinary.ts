import axios from 'axios';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET || '');

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.secure_url;
  } catch (error: any) {
    // Show error details for debugging
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error('Cloudinary upload failed: ' + error.response.data.error.message);
    }
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}
