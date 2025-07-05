export type Role = 'Admin' | 'Seller' | 'Partner';

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Commercial' | 'Land';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: PropertyType;
  imageUrl: string;
  agent: {
    name: string;
    avatar: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in sqft
  };
}

export interface Lead {
  id: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  clientEmail: string;
  status: 'New' | 'Contacted' | 'Closed';
}

export interface WebsiteData {
  businessInfo: {
    name: string;
    tagline: string;
    avatar: string;
  };
  slideshowImage: {
    url: string;
    text: string;
  };
  contactDetails: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  legalInfo: {
    about: string;
    terms: string;
    privacy: string;
    refund: string;
    disclaimer: string;
  };
  links: {
    website: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
}
