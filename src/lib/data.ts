import type { Property, User, Lead, PropertyType, Contact, UpdateMessage, Enquiry, Receivable, Payable, PaymentHistory, SupportTicket } from '@/types';

export const initialUsersForSeed: User[] = [
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
  { day: 'Day 0', leads: 5, sales: 2, customers: 3 },
  { day: 'Day 1', leads: 20, sales: 10, customers: 8 },
  { day: 'Day 2', leads: 35, sales: 52, customers: 20 },
  { day: 'Day 3', leads: 40, sales: 38, customers: 22 },
  { day: 'Day 4', leads: 35, sales: 30, customers: 25 },
  { day: 'Day 5', leads: 50, sales: 60, customers: 22 },
  { day: 'Day 6', leads: 68, sales: 40, customers: 30 },
  { day: 'Day 7', leads: 60, sales: 45, customers: 28 },
];

export const enquiries: Enquiry[] = [
  { id: '1', enquiryId: 'ENQ-001', date: '2024-05-20', name: 'John Doe', phone: '+1-202-555-0181', partnerId: 'PRT-123', catalogName: 'Sunrise Apartments', catalogCode: 'CAT-001' },
  { id: '2', enquiryId: 'ENQ-002', date: '2024-05-19', name: 'Jane Smith', phone: '+1-202-555-0114', partnerId: 'PRT-124', catalogName: 'Ocean View Villas', catalogCode: 'CAT-002' },
  { id: '3', enquiryId: 'ENQ-003', date: '2024-05-18', name: 'Sam Wilson', phone: '+1-202-555-0168', partnerId: 'PRT-125', catalogName: 'Downtown Lofts', catalogCode: 'CAT-003' },
  { id: '4', enquiryId: 'ENQ-004', date: '2024-05-17', name: 'Lisa Ray', phone: '+1-202-555-0199', partnerId: 'PRT-123', catalogName: 'Sunrise Apartments', catalogCode: 'CAT-001' },
  { id: '5', enquiryId: 'ENQ-005', date: '2024-05-16', name: 'Peter Jones', phone: '+1-202-555-0145', partnerId: 'PRT-126', catalogName: 'Green Meadows', catalogCode: 'CAT-004' },
];

export const initialReceivables: Receivable[] = [
  { id: 'rec1', date: '2024-05-20', partnerName: 'Mike Johnson', partnerId: 'PRT-123', pendingAmount: 15000, status: 'Pending' },
  { id: 'rec2', date: '2024-05-18', partnerName: 'Partner User', partnerId: 'PRT-124', pendingAmount: 2500, status: 'Pending' },
  { id: 'rec3', date: '2024-05-15', partnerName: 'Mike Johnson', partnerId: 'PRT-123', pendingAmount: 8000, status: 'Received' },
  { id: 'rec4', date: '2024-05-12', partnerName: 'Partner User', partnerId: 'PRT-124', pendingAmount: 32000, status: 'Pending' },
  { id: 'rec5', date: '2024-05-10', partnerName: 'Mike Johnson', partnerId: 'PRT-123', pendingAmount: 500, status: 'Received' },
];

export const initialPayables: Payable[] = [
  { id: 'pay1', date: '2024-05-21', recipientName: 'Office Supplies Inc.', recipientId: 'SUP-001', payableAmount: 5000, status: 'Pending' },
  { id: 'pay2', date: '2024-05-20', recipientName: 'Marketing Agency', recipientId: 'SP-002', payableAmount: 7500, status: 'Paid' },
  { id: 'pay3', date: '2024-05-19', recipientName: 'Utilities Co.', recipientId: 'UTIL-003', payableAmount: 2200, status: 'Pending' },
  { id: 'pay4', date: '2024-05-17', recipientName: 'Freelance Developer', recipientId: 'FREEL-004', payableAmount: 12000, status: 'Paid' },
];

export const initialPaymentHistory: PaymentHistory[] = [
    { id: 'ph1', date: '2024-05-21', name: 'Wallet Top-up', transactionId: 'TXN123456', amount: 10000, paymentMethod: 'Credit Card', type: 'Credit' },
    { id: 'ph2', date: '2024-05-20', name: 'Payment from Mike Johnson', transactionId: 'TXN123457', amount: 8000, paymentMethod: 'Bank Transfer', type: 'Credit' },
    { id: 'ph3', date: '2024-05-20', name: 'Payment to Marketing Agency', transactionId: 'TXN123458', amount: 7500, paymentMethod: 'Wallet', type: 'Debit' },
    { id: 'ph4', date: '2024-05-18', name: 'Payment from Partner User', transactionId: 'TXN123459', amount: 2500, paymentMethod: 'Bank Transfer', type: 'Credit' },
    { id: 'ph5', date: '2024-05-17', name: 'Payment to Freelance Developer', transactionId: 'TXN123460', amount: 12000, paymentMethod: 'Wallet', type: 'Debit' },
];

export const supportTickets: SupportTicket[] = [
  {
    id: 't1',
    ticketId: 'TID1',
    date: '3/10/2024',
    userName: 'Rameshwari Maheshwari',
    userType: 'Customer',
    supportFor: 'C00001 - Digital Marketing Services',
    status: 'Latest',
  },
  {
    id: 't2',
    ticketId: 'TID2',
    date: '3/09/2024',
    userName: 'John Doe',
    userType: 'Partner',
    supportFor: 'CAT-002 - Payout Issue',
    status: 'Processing',
  },
  {
    id: 't3',
    ticketId: 'TID3',
    date: '3/08/2024',
    userName: 'Jane Smith',
    userType: 'Seller',
    supportFor: 'Login problem',
    status: 'Solved',
  },
];


// Mock user data is now in initialUsersForSeed and will be removed from general export
// export const users: User[] = [ ... ];
export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@estateflow.com', role: 'Admin', avatar: 'https://placehold.co/40x40.png' },
  { id: '2', name: 'Seller User', email: 'seller@estateflow.com', role: 'Seller', avatar: 'https://placehold.co/40x40.png' },
  { id: '3', name: 'Partner User', email: 'partner@estateflow.com', role: 'Partner', avatar: 'https://placehold.co/40x40.png' },
  { id: '4', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Seller', avatar: 'https://placehold.co/40x40.png' },
  { id: '5', name: 'Mike Johnson', email: 'mike.j@example.com', role: 'Partner', avatar: 'https://placehold.co/40x40.png' },
];
