




export type Role = 'Admin' | 'Seller' | 'Partner' | 'Manager' | 'Business Manager' | 'Support Team' | 'Wallet Manager';

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Commercial' | 'Land';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone?: string;
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

export interface SlideshowItem {
  id: string;
  image: string;
  title: string;
  link: string;
}

export interface WebsiteData {
  businessInfo: {
    name: string;
    tagline: string;
    avatar: string;
    metaKeywords?: string;
    metaDescription?: string;
  };
  slideshows: SlideshowItem[];
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

export interface Contact {
  id: string;
  name: string;
  code: string;
  avatar: string;
}

export interface UpdateMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

export interface Enquiry {
  id: string;
  enquiryId: string;
  date: string;
  name: string;
  phone: string;
  partnerId: string;
  catalogName: string;
  catalogCode: string;
}

export interface Receivable {
  id: string;
  date: string;
  partnerName: string;
  partnerId: string;
  pendingAmount: number;
  status: 'Pending' | 'Received';
}

export interface Payable {
  id: string;
  date: string;
  recipientName: string;
  recipientId: string;
  payableAmount: number;
  status: 'Pending' | 'Paid';
}

export interface PaymentHistory {
    id: string;
    date: string;
    name: string;
    transactionId: string;
    amount: number;
    paymentMethod: string;
    type: 'Credit' | 'Debit';
}
