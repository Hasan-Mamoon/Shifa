import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./useAuthContext";

// Handle image upload to AWS S3 using signed URL
const uploadImageToS3 = async (uploadURL, imageFile) => {
  try {
    const response = await fetch(uploadURL, {
      method: "PUT",
      body: imageFile,
      headers: {
        "Content-Type": imageFile.type,
      },
    });

    if (response.ok) {
      return true;
    } else {
      console.error(" Failed to upload image.");
      return false;
    }
  } catch (error) {
    console.error("Error during image upload:", error);
    return false;
  }
};

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();

  const signup = async (email, password, role, licenseNo, licenseImage) => {
    setIsLoading(true);
    setError(null);

    // Build the request body
    const body = { email, password, role };

    if (role === "doctor") {
      body.licenseNo = licenseNo; // Pass licenseNo only if role is doctor
    }

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
        return;
      }
      if (role === "doctor" && json.uploadURL && licenseImage) {
        // Upload the image directly to AWS S3 using the signed URL
        const success = await uploadImageToS3(json.uploadURL, licenseImage);
        alert(json.message);
        navigate("/");
        if (!success) {
          throw new Error("Failed to upload image to S3");
        }
      }
      if (json.message === "Registration pending admin approval") {
        setIsLoading(false);
        return;
      }

      // Save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // Update the auth context
      dispatch({ type: "LOGIN", payload: json });

      // Update loading state
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  return { signup, isLoading, error };
};
