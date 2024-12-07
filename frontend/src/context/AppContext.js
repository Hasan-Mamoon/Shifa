// import { createContext, useEffect, useState } from "react";
// import axios from "axios";

// export const AppContext = createContext();

// const AppContextProvider = (props) => {
//     const [doctors, setDoctors] = useState([]);
//     const currencySymbol = 'Rs';

//     useEffect(() => {
//         const fetchDoctors = async () => {
//             try {
//                 const response = await axios.get('http://localhost:3080/doctor/doctors-all'); // Update with your backend URL
//                 setDoctors(response.data);
//             } catch (error) {
//                 console.error("Error fetching doctors:", error);
//             }
//         };

//         fetchDoctors();
//     }, []);

//     const value = {
//         doctors,
//         currencySymbol,
//     };

//     return (
//         <AppContext.Provider value={value}>
//             {props.children}
//         </AppContext.Provider>
//     );
// };

// export default AppContextProvider;

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [doctors, setDoctors] = useState([]);
    const [patientId, setPatientId] = useState(null); // Store patient ID
    const [slotId, setSlotId] = useState(null); // Store slot ID
    const currencySymbol = "Rs";

    // Fetch all doctors on component mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get("http://localhost:3080/doctor/doctors-all"); // Update with your backend URL
                setDoctors(response.data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctors();
    }, []);

    // Fetch patient ID dynamically (e.g., from an API or localStorage)
    // useEffect(() => {
    //     const fetchPatientId = () => {
    //         // Example: Fetch from local storage or API
    //         const storedPatientId = localStorage.getItem("patientId") || "default_patient_id"; // Replace with actual logic
    //         setPatientId(storedPatientId);
    //     };

    //     fetchPatientId();
    // }, []);

    // Context value that includes all state and functions
    const value = {
        doctors,
        currencySymbol,
        //patientId,
        //setPatientId, // Allow child components to update the patient ID
        slotId,
        setSlotId, // Allow child components to update the slot ID
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
