import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, role, licenseNo, licenseImage) => {
    setIsLoading(true);
    setError(null);

    // Build the request body
    const body = { email, password, role };
    if (role === 'doctor') {
      body.licenseNo = licenseNo;

      // Optionally handle the license image (if required to send)
      if (licenseImage) {
        const reader = new FileReader();
        reader.onload = async () => {
          body.licenseImage = reader.result; // Base64 encoded string
          await sendRequest(body);
        };
        reader.readAsDataURL(licenseImage);
        return; // Wait for FileReader to complete
      }
    }

    await sendRequest(body);
  };

  const sendRequest = async (body) => {
    try {
      const response = await fetch('/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
      } else {
        // Save the user to local storage
        localStorage.setItem('user', JSON.stringify(json));

        // Update the auth context
        dispatch({ type: 'LOGIN', payload: json });

        // Update loading state
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred. Please try again.');
    }
  };

  return { signup, isLoading, error };
};
