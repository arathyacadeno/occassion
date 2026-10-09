"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

export default function ImageUploadDemo() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px" }}>
      <h3>Upload a Product Image</h3>
      
      <CldUploadWidget 
        uploadPreset="ml_default" // The default un-signed upload preset
        onSuccess={(result) => {
          // Cloudinary gives us the secure URL of the image!
          if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
             const url = result.info.secure_url;
             setImageUrl(url);
             
             // HERE IS WHERE WE TALK TO NEON DB!
             // We would do something like:
             // await fetch('/api/save-image', { method: 'POST', body: JSON.stringify({ url }) })
             console.log("Image uploaded to Cloudinary! URL:", url);
          }
        }}
      >
        {({ open }) => {
          return (
            <button 
              onClick={() => open()}
              style={{
                background: "#E6004C",
                color: "white",
                padding: "10px 16px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Upload an Image
            </button>
          );
        }}
      </CldUploadWidget>

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Successfully uploaded! Here is the image:</p>
          <img src={imageUrl} alt="Uploaded preview" style={{ width: "100%", borderRadius: "8px" }} />
        </div>
      )}
    </div>
  );
}
