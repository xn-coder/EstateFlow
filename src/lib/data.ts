
import type { Property, User, Lead, PropertyType, Contact, UpdateMessage, Enquiry } from '@/types';

export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@estateflow.com', role: 'Admin', avatar: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Seller User', email: 'seller@estateflow.com', role: 'Seller', avatar: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Partner User', email: 'partner@estateflow.com', role: 'Partner', avatar: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Seller', avatar: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Mike Johnson', email: 'mike.j@example.com', role: 'Partner', avatar: 'https://placehold.co/40x40.png' },
];

export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Modern Downtown Loft',
    description: 'A beautiful and spacious loft in the heart of the city. Features an open layout, high ceilings, and modern finishes. Perfect for young professionals. This is an apartment.',
    price: 750000,
    location: 'Metropolis, USA',
    type: 'Apartment',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Seller User', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 2, bathrooms: 2, area: 1200 },
  },
  {
    id: 'p2',
    title: 'Suburban Family House',
    description: 'A charming house with a large backyard, perfect for families. Located in a quiet and friendly neighborhood with excellent schools. This is a house.',
    price: 550000,
    location: 'Green Valley, USA',
    type: 'House',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Jane Smith', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 4, bathrooms: 3, area: 2500 },
  },
  {
    id: 'p3',
    title: 'Luxury Beachfront Villa',
    description: 'An exquisite villa with stunning ocean views. Includes a private pool, direct beach access, and top-of-the-line amenities. This is a villa.',
    price: 2500000,
    location: 'Sunset Coast, USA',
    type: 'Villa',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Seller User', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 5, bathrooms: 6, area: 5000 },
  },
  {
    id: 'p4',
    title: 'Prime Commercial Space',
    description: 'A versatile commercial property in a high-traffic area. Ideal for retail or office use. Great investment opportunity. This is a commercial space.',
    price: 1200000,
    location: 'Business District, USA',
    type: 'Commercial',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Admin User', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 0, bathrooms: 2, area: 3000 },
  },
  {
    id: 'p5',
    title: 'Undeveloped Land Parcel',
    description: 'A large plot of land with great potential for development. Zoned for residential or mixed-use. This is a land parcel.',
    price: 300000,
    location: 'Oakwood, USA',
    type: 'Land',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Jane Smith', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 0, bathrooms: 0, area: 435600 },
  },
  {
    id: 'p6',
    title: 'Cozy City Apartment',
    description: 'A compact and cozy apartment with great city views. Perfect for a single person or a couple. This is a small apartment.',
    price: 450000,
    location: 'Metropolis, USA',
    type: 'Apartment',
    imageUrl: 'https://placehold.co/600x400.png',
    agent: { name: 'Seller User', avatar: 'https://placehold.co/40x40.png' },
    features: { bedrooms: 1, bathrooms: 1, area: 800 },
  },
];

export const leads: Lead[] = [
  { id: 'l1', propertyId: 'p1', propertyName: 'Modern Downtown Loft', clientName: 'John Doe', clientEmail: 'john.d@example.com', status: 'New' },
  { id: 'l2', propertyId: 'p2', propertyName: 'Suburban Family House', clientName: 'Alice Williams', clientEmail: 'alice.w@example.com', status: 'Contacted' },
  { id: 'l3', propertyId: 'p1', propertyName: 'Modern Downtown Loft', clientName: 'Bob Brown', clientEmail: 'bob.b@example.com', status: 'New' },
];

export const propertyTypes: PropertyType[] = ['House', 'Apartment', 'Villa', 'Commercial', 'Land'];

export const contacts: Contact[] = Array.from({ length: 10 }, (_, i) => ({
  id: `c${i + 1}`,
  name: 'First Last',
  code: i % 2 === 0 ? `DSA 000 000 001` : `USR 000 000 001`,
  avatar: 'https://placehold.co/40x40.png',
}));

export const updateMessages: UpdateMessage[] = [
  {
    id: 'msg1',
    from: 'Admin Team',
    subject: 'Important System Update - Action Required',
    body: 'We will be performing a system update this weekend to improve performance and security. The platform may be temporarily unavailable on Saturday from 2 AM to 4 AM EST. We appreciate your patience.',
    date: '2 Days ago',
    read: false,
  },
  {
    id: 'msg2',
    from: 'Support Team',
    subject: 'RE: Regarding your recent ticket #12345',
    body: 'We have an update on your support ticket #12345. Our team has resolved the issue you reported. Please check your support dashboard for details and confirm the resolution. Thank you!',
    date: '3 Days ago',
    read: true,
  },
  {
    id: 'msg3',
    from: 'Marketing',
    subject: 'Exciting News: New Partner Program Benefits',
    body: 'We are excited to announce new benefits for our valued partners, including higher commission rates and exclusive marketing materials. Learn more in the partner portal.',
    date: '5 Days ago',
    read: true,
  },
   {
    id: 'msg4',
    from: 'Billing Department',
    subject: 'Your invoice for July 2024 is ready',
    body: 'Your monthly invoice is now available for review and payment in the Wallet & Billing section. Please ensure payment is made by the due date to avoid service interruption.',
    date: '1 Week ago',
    read: true,
  },
];

export const businessReportData = [
  { day: 'Mon', enquiry: 40, property: 24, booking: 24 },
  { day: 'Tue', enquiry: 30, property: 13, booking: 22 },
  { day: 'Wed', enquiry: 20, property: 58, booking: 29 },
  { day: 'Thu', enquiry: 27, property: 39, booking: 20 },
  { day: 'Fri', enquiry: 18, property: 48, booking: 21 },
  { day: 'Sat', enquiry: 23, property: 38, booking: 25 },
  { day: 'Sun', enquiry: 34, property: 43, booking: 31 },
];

export const enquiries: Enquiry[] = [
  { id: '1', enquiryId: 'ENQ-001', date: '2024-05-20', name: 'John Doe', phone: '+1-202-555-0181', partnerId: 'PRT-123', catalogName: 'Sunrise Apartments', catalogCode: 'CAT-001' },
  { id: '2', enquiryId: 'ENQ-002', date: '2024-05-19', name: 'Jane Smith', phone: '+1-202-555-0114', partnerId: 'PRT-124', catalogName: 'Ocean View Villas', catalogCode: 'CAT-002' },
  { id: '3', enquiryId: 'ENQ-003', date: '2024-05-18', name: 'Sam Wilson', phone: '+1-202-555-0168', partnerId: 'PRT-125', catalogName: 'Downtown Lofts', catalogCode: 'CAT-003' },
  { id: '4', enquiryId: 'ENQ-004', date: '2024-05-17', name: 'Lisa Ray', phone: '+1-202-555-0199', partnerId: 'PRT-123', catalogName: 'Sunrise Apartments', catalogCode: 'CAT-001' },
  { id: '5', enquiryId: 'ENQ-005', date: '2024-05-16', name: 'Peter Jones', phone: '+1-202-555-0145', partnerId: 'PRT-126', catalogName: 'Green Meadows', catalogCode: 'CAT-004' },
];
