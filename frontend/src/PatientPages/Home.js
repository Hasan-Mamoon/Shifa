import React from 'react';
import Header from '../PatientComponents/Header';
import SpecialityMenu from '../PatientComponents/SpecialityMenu';
import TopDoctors from '../PatientComponents/TopDoctors';
import Banner from '../PatientComponents/Banner';
import Calendar from './Calendar';

const Home = () => {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      <Calendar />
    </div>
  );
};

export default Home;
