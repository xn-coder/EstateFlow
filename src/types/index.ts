

export type Role = 'Admin' | 'Seller' | 'Partner' | 'Manager' | 'Business Manager' | 'Support Team' | 'Wallet Manager';

export type PropertyType = 'House' | 'Apartment' | 'Villa' | 'Commercial' | 'Land';

export const qualifications = ["Post graduate", "Graduate", "Under graduate", "12th", "10th"] as const;
export type Qualification = typeof qualifications[number];

export const feeApplicablePartnerCategories = ['Super Affiliate Partner', 'Associate Partner', 'Channel Partner'] as const;
export type FeeApplicablePartnerCategory = typeof feeApplicablePartnerCategories[number];

export const partnerCategories = ['Affiliate Partner', ...feeApplicablePartnerCategories] as const;
export type PartnerCategory = typeof partnerCategories[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone?: string;
  partnerProfileId?: string;
  status?: 'Pending' | 'Active' | 'Deactivated';
  partnerCode?: string;
  feeStatus?: 'Pending Payment' | 'Paid' | 'Not Applicable';
  userCode?: string;
  websiteData?: Omit<WebsiteData, 'partnerFees'>;
  rewardPoints?: number;
}

export interface PartnerData {
  id: string;
  profileImage?: string;
  name: string;
  dob: string; // Stored as ISO string in Firestore
  gender: 'Male' | 'Female' | 'Other';
  qualification: Qualification;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessLogo?: string;
  businessType: string;
  gstn?: string;
  businessAge: number;
  areaCovered: string;
  aadhaarCard: string;
  aadhaarNumber?: string;
  panCard: string;
  panNumber?: string;
  position?: string;
  partnerCategory: PartnerCategory;
  paymentProof?: string;
}

export interface PartnerActivationInfo {
  user: User;
  profile: PartnerData;
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
  partnerFees: {
    [key in FeeApplicablePartnerCategory]?: number;
  };
}

export interface Contact {
  id: string;
  name: string;
  code: string;
  avatar: string;
}

export interface Message {
  id: string;
  createdAt: string; // ISO
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  details: string;
  attachment?: string;
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

export interface SubmittedEnquiry {
  id: string;
  enquiryId: string;
  createdAt: string; // ISO String
  catalogId: string;
  catalogCode: string;
  catalogTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerPincode: string;
  status: 'New' | 'Contacted' | 'Closed';
  submittedBy: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface Receivable {
  id: string;
  date: string;
  partnerName: string;
  partnerId: string;
  pendingAmount: number;
  status: 'Pending' | 'Received';
  description?: string;
}

export interface Payable {
  id: string;
  date: string;
  recipientName: string;
  recipientId: string;
  payableAmount: number;
  status: 'Pending' | 'Paid';
  description?: string;
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

export interface WalletSummary {
  totalBalance: number;
  revenue: number;
  receivable: number;
  payable: number;
}

export interface PartnerWalletData {
  totalEarning: number;
  paidAmount: number;
  pendingAmount: number;
  rewardPoints: number;
  transactions: Payable[];
}

export interface RewardPointTransaction {
  id: string;
  date: string; // ISO string
  partnerId: string;
  partnerName: string;
  sellerId: string;
  sellerName: string;
  points: number;
  type: 'Credit' | 'Debit';
  description: string;
}

export interface Customer {
  id: string; // document ID
  customerId: string; // custom ID
  name: string;
  email: string;
  phone: string;
  pincode: string;
  createdBy: string; // partner user ID
  createdAt: string; // ISO string
  sellerId?: string;
}

export interface CatalogSlideshow {
  id: string;
  image: string;
  title: string;
}

export interface CatalogFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CatalogMarketingKit {
  id: string;
  kitType: 'poster' | 'brochure';
  featuredImage: string;
  nameOrTitle: string;
  uploadedFile: string;
}

export interface Catalog {
  id: string;
  catalogCode: string;
  sellerId: string;
  // Step 1
  title: string;
  description: string;
  metaKeyword?: string;
  categoryId: string;
  categoryName: string;
  featuredImage: string;
  // Step 2
  pricingType: 'INR' | 'USD';
  sellingPrice: number;
  earningType: 'Fixed rate' | 'commission' | 'reward point';
  earning: number;
  partnerCategoryCommissions?: {
    'Affiliate Partner'?: number;
    'Super Affiliate Partner'?: number;
    'Associate Partner'?: number;
    'Channel Partner'?: number;
  };
  // Step 3
  slideshows: CatalogSlideshow[];
  // Step 4
  detailsContent: string;
  // Step 5
  faqs: CatalogFAQ[];
  // Step 6
  galleryImages: string[];
  // Step 7
  videoLink: string;
  // Step 8
  marketingKits: CatalogMarketingKit[];
  // Step 9
  notesContent?: string;
  termsContent?: string;
  policyContent?: string;
}

export interface MarketingKitInfo extends CatalogMarketingKit {
  catalogId: string;
  catalogTitle: string;
  catalogCode: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  categoryCode?: string;
  sellerId?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  featuredImage: string;
  catalogCode?: string;
  contentType: 'Article' | 'Video' | 'FAQs';
  contentCode?: string;
  sellerId?: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  createdAt: string; // ISO Date string
  userId: string;
  userName: string;
  userType: Role;
  queryCategory: string;
  subject: string;
  message: string;
  status: 'Latest' | 'Processing' | 'Solved';
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionDetails?: string;
  feedback?: string;
}
