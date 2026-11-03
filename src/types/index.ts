export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  credits: number;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  industry: string;
  description: string;
  targetAudience: string;
  painPoints: string;
  tone: string;
  preferredLanguage: 'English' | 'Tamil' | 'Tanglish';
  brandVoiceExamples: string;
  preferredCta: string;
  wordsToAvoid: string;
  website?: string;
  socialLinks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVersion {
  versionNumber: number;
  content: string;
  timestamp: string;
  summary: string;
}

export interface ContentItem {
  id: string;
  userId: string;
  brandId?: string;
  brandName?: string;
  title: string;
  contentType: string;
  category: 'instagram' | 'youtube' | 'marketing' | 'universal';
  prompt: string;
  inputs: Record<string, any>;
  content: string;
  structuredData?: Record<string, any>;
  language: string;
  version: number;
  versionsHistory: ContentVersion[];
  isFavorite: boolean;
  isDraft: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'initial' | 'deduction' | 'refund' | 'bonus' | 'purchase' | 'admin_adjustment';
  description: string;
  balanceAfter: number;
  idempotencyKey?: string;
  createdAt: string;
}

export interface GenerationRequest {
  contentType: string;
  category: 'instagram' | 'youtube' | 'marketing' | 'universal';
  topic: string;
  duration?: string;
  platform?: string;
  language?: 'English' | 'Tamil' | 'Tanglish';
  tone?: string;
  targetAudience?: string;
  objective?: string;
  keywords?: string;
  preferredCta?: string;
  requiredFacts?: string;
  referenceText?: string;
  additionalInstructions?: string;
  brandId?: string;
  idempotencyKey?: string;
  saveToLibrary?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalGenerations: number;
  successRate: number;
  totalCreditsCharged: number;
  estimatedModelCost: string;
  activeUsersCount: number;
}

export interface SystemSettings {
  creditCosts: Record<string, number>;
  defaultFreeCredits: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
}
