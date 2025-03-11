import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDiscounts = () => {
  const [discount, setDiscount] = useState('');
  const [message, setMessage] = useState('');
  const [activeDiscount, setActiveDiscount] = useState(null);

  useEffect(() => {
    // Check for an active discount
    const storedDiscount = localStorage.getItem('lastDiscount');
    if (storedDiscount) {
      setActiveDiscount(parseInt(storedDiscount));
    } else {
      estimateDiscount();
    }
  }, []);

  const applyDiscount = async () => {
    try {
      const discountPercentage = parseInt(discount);
      if (isNaN(discountPercentage) || discountPercentage <= 0) {
        setMessage('Enter a valid discount percentage.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/admin/apply-discount`, {
        discountPercentage,
      });

      setMessage(response.data.message);
      setActiveDiscount(discountPercentage);
      localStorage.setItem('lastDiscount', discountPercentage);
    } catch (error) {
      setMessage('Error applying discount');
      console.error('Error:', error);
    }
  };

  const removeDiscount = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/admin/remove-discount`);
      setMessage(response.data.message);
      setActiveDiscount(null);
      localStorage.removeItem('lastDiscount');
    } catch (error) {
      setMessage('Error removing discount');
      console.error('Error:', error);
    }
  };

  const estimateDiscount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/doctors`);
      const doctors = response.data;

      if (doctors.length > 0) {
        const doctor = doctors[0]; // Pick the first doctor to estimate
        if (doctor.originalFees) {
          const estimatedDiscount = Math.round((1 - doctor.fees / doctor.originalFees) * 100);
          if (estimatedDiscount > 0) {
            setActiveDiscount(estimatedDiscount);
          }
        }
      }
    } catch (error) {
      console.error('Error estimating discount:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Manage Discounts</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        {activeDiscount === null ? (
          <>
            <label className="block text-gray-700 font-semibold mb-2">Discount Percentage:</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter discount (e.g., 10)"
            />

            <button onClick={applyDiscount} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              Apply Discount
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-700">Active Discount: <strong>{activeDiscount}%</strong></p>
            <button onClick={removeDiscount} className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700">
              Remove Discount
            </button>
          </>
        )}

        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default AdminDiscounts;
