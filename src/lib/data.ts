import type { Property, User, Lead, PropertyType } from '@/types';

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
