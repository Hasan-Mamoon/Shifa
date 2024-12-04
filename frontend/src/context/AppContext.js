import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [doctors, setDoctors] = useState([]);
    const currencySymbol = 'Rs';

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:3080/doctor/doctors-all'); // Update with your backend URL
                setDoctors(response.data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctors();
    }, []);

    const value = {
        doctors,
        currencySymbol,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;