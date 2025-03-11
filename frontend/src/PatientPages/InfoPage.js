import React from 'react';
import { useParams } from 'react-router-dom';

const services = {
  pharmacy1: {
    name: 'Dawaai',
    image:
      'https://play-lh.googleusercontent.com/fbiNNouePeMsgr4J7S9_EaweZK0vimsCnovGHhz_Fuuidh1J7uEX7Ps4KOGygvp-Uw=w600-h300-pc0xffffff-pd',
    description:
      'Dawaai is an innovative pharmacy-led healthcare group. Our mission is to provide integrated pharmacy services with Convenience and Quality. We are reinventing the concept of retail pharmacy by taking authentic medicines to patients’ door-step as quickly as possible',
    website: 'https://dawaai.pk/medicine-category',
  },
  pharmacy2: {
    name: 'Healthwire',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/7a/fd/1d/7afd1d1f-a127-82fa-f605-7ade79058537/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/1200x600wa.png',
    description:
      'Healthwire is on a mission to make quality healthcare more accessible and affordable for 220 Million+ Pakistanis. We believe in empowering our users with the most accurate, comprehensive, curated information, care and enabling them to make better healthcare decisions.',
    website: 'https://healthwire.pk/pharmacy',
  },
  pharmacy3: {
    name: 'Dvago',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/03/a3/73/03a373fa-f215-ed0b-04f0-3c97eba05873/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/1200x600wa.png',
    description:
      'DVAGO mission is to become neighborhood health and wellness experts, providing authentic, affordable medicines and wellness products, and ensuring they are delivered through expert, empathetic pharmacists. Their vision is to help create a world where everyone feels well looked after',
    website: 'https://www.dvago.pk',
  },
  lab1: {
    name: 'Islamabad Diagnostic Centre (IDC)',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/5b/c6/12/5bc6128c-43d4-b959-86e4-2e768a9cb5c5/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/1200x630wa.png',
    description:
      'The idea of Islamabad Diagnostic Center started with a mission to offer all under one roof clinical diagnostic services and to become the most trusted & reliable healthcare services provider in Pakistan.',
    website: 'https://idc.net.pk/service/',
  },
  lab2: {
    name: 'Chugtai Lab',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/b6/5e/e3/b65ee396-e8e9-e214-bd99-d8cb869d1dc9/AppIcon-0-0-1x_U007epad-0-10-0-85-220.png/1200x600wa.png',
    description:
      'Chughtai Labs mission is to deliver accurate and timely results with a focus on patient care and innovation, while their vision is to become a leading healthcare delivery platform in Pakistan',
    website: 'https://chughtailab.com/test-list/',
  },
  lab3: {
    name: 'Mughal Labs',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple124/v4/70/3d/d5/703dd5c1-8459-939c-c9f8-63228d4d9e17/AppIcon-1-1x_U007emarketing-0-7-0-0-85-220.png/1200x600wa.png',
    description:
      'Mughal Labs mission is to ensure every patient in Pakistan has access to the best possible laboratory services at affordable rates, while their vision is to improve healthcare accessibility and provide accurate, timely test results for disease prevention, diagnosis, and treatment',
    website: 'https://mughallabs.com/lab-test-rates/',
  },
  lab4: {
    name: 'Shifa4U',
    image:
      'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/c3/fa/3f/c3fa3ffd-79ae-b4cb-da86-9798585c839c/AppIcon-0-0-1x_U007emarketing-0-0-0-10-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/1200x600wa.png',
    description:
      'We envision to be a revolutionary digital healthcare organisation aiming to transform the international health markets into a global village, ensuring that accessible and affordable quality healthcare becomes a worldwide phenomenon.',
    website: 'https://www.shifa4u.com/lab-tests',
  },
};

const InfoPage = () => {
  const { id } = useParams();
  const data = services[id];

  if (!data) return <p className="text-center text-gray-600">Service not found.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <img src={data.image} alt={data.name} className="w-full h-64 object-cover rounded-md mb-4" />
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p className="text-gray-600">{data.description}</p>
      <button
        onClick={() => window.open(data.website, '_blank')}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md"
      >
        Visit Website
      </button>
    </div>
  );
};

export default InfoPage;
