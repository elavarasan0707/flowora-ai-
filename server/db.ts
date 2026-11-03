import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  credits: number;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  passwordHash?: string;
  salt?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  googleId?: string;
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
  contentType: string; // 'reel_script' | 'hook_generator' | 'caption_hashtags' | 'carousel_copy' | 'instagram_post' | 'youtube_shorts' | 'youtube_longform' | 'youtube_titles_desc' | 'ad_copy' | 'blog_draft' | 'email_campaign' | 'whatsapp_promo' | 'linkedin_post' | 'repurpose' | 'universal'
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

export interface GenerationLog {
  id: string;
  userId: string;
  contentType: string;
  creditsCharged: number;
  durationMs: number;
  status: 'success' | 'failed';
  error?: string;
  timestamp: string;
}

export interface SystemSettings {
  creditCosts: Record<string, number>;
  defaultFreeCredits: number;
  registrationOpen: boolean;
  maintenanceMode: boolean;
}

export interface DatabaseSchema {
  users: User[];
  brandProfiles: BrandProfile[];
  contentItems: ContentItem[];
  creditTransactions: CreditTransaction[];
  generationLogs: GenerationLog[];
  settings: SystemSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'flowora_db.json');

const DEFAULT_SETTINGS: SystemSettings = {
  creditCosts: {
    universal: 4,
    reel_script: 5,
    hook_generator: 2,
    caption_hashtags: 2,
    carousel_copy: 6,
    instagram_post: 3,
    youtube_shorts: 5,
    youtube_longform: 10,
    youtube_titles_desc: 3,
    ad_copy: 4,
    blog_draft: 12,
    email_campaign: 4,
    whatsapp_promo: 2,
    linkedin_post: 3,
    repurpose: 6,
    refine_rewrite: 2,
    refine_improve: 2,
    refine_expand: 3,
    refine_shorten: 2,
    refine_translate: 2,
    refine_tone: 2,
  },
  defaultFreeCredits: 50,
  registrationOpen: true,
  maintenanceMode: false,
};

class Database {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = {
      users: [],
      brandProfiles: [],
      contentItems: [],
      creditTransactions: [],
      generationLogs: [],
      settings: DEFAULT_SETTINGS,
    };
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure settings are merged
        this.data.settings = { ...DEFAULT_SETTINGS, ...this.data.settings };
        this.data.settings.creditCosts = { ...DEFAULT_SETTINGS.creditCosts, ...(this.data.settings.creditCosts || {}) };
      } else {
        this.persist();
      }
      this.isInitialized = true;
    } catch (e) {
      console.error('Failed to initialize database, using in-memory store:', e);
      this.isInitialized = true;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Brand Profiles
  getBrandProfiles(userId: string): BrandProfile[] {
    return this.data.brandProfiles.filter(b => b.userId === userId);
  }

  getBrandProfileById(id: string, userId: string): BrandProfile | undefined {
    return this.data.brandProfiles.find(b => b.id === id && b.userId === userId);
  }

  createBrandProfile(brand: BrandProfile): BrandProfile {
    this.data.brandProfiles.push(brand);
    this.persist();
    return brand;
  }

  updateBrandProfile(id: string, userId: string, updates: Partial<BrandProfile>): BrandProfile | undefined {
    const idx = this.data.brandProfiles.findIndex(b => b.id === id && b.userId === userId);
    if (idx === -1) return undefined;
    this.data.brandProfiles[idx] = { ...this.data.brandProfiles[idx], ...updates, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data.brandProfiles[idx];
  }

  deleteBrandProfile(id: string, userId: string): boolean {
    const initialLen = this.data.brandProfiles.length;
    this.data.brandProfiles = this.data.brandProfiles.filter(b => !(b.id === id && b.userId === userId));
    const deleted = this.data.brandProfiles.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // Content Items
  getContentItems(userId: string): ContentItem[] {
    return this.data.contentItems
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getContentItemById(id: string, userId: string): ContentItem | undefined {
    return this.data.contentItems.find(c => c.id === id && c.userId === userId);
  }

  createContentItem(item: ContentItem): ContentItem {
    this.data.contentItems.unshift(item);
    this.persist();
    return item;
  }

  updateContentItem(id: string, userId: string, updates: Partial<ContentItem>): ContentItem | undefined {
    const idx = this.data.contentItems.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) return undefined;
    const existing = this.data.contentItems[idx];
    const newContent = updates.content !== undefined ? updates.content : existing.content;

    // Track version if content changed meaningfully
    let version = existing.version;
    let versionsHistory = [...existing.versionsHistory];
    if (updates.content && updates.content !== existing.content) {
      version += 1;
      versionsHistory.unshift({
        versionNumber: existing.version,
        content: existing.content,
        timestamp: new Date().toISOString(),
        summary: updates.title ? `Updated: ${updates.title}` : `Version ${existing.version}`
      });
      // Keep last 10 versions max
      if (versionsHistory.length > 10) versionsHistory.pop();
    }

    this.data.contentItems[idx] = {
      ...existing,
      ...updates,
      version,
      versionsHistory,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.contentItems[idx];
  }

  deleteContentItem(id: string, userId: string): boolean {
    const initialLen = this.data.contentItems.length;
    this.data.contentItems = this.data.contentItems.filter(c => !(c.id === id && c.userId === userId));
    const deleted = this.data.contentItems.length < initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // Credits & Atomic Deductions
  getCreditTransactions(userId: string): CreditTransaction[] {
    return this.data.creditTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findTransactionByIdempotency(userId: string, idempotencyKey: string): CreditTransaction | undefined {
    return this.data.creditTransactions.find(t => t.userId === userId && t.idempotencyKey === idempotencyKey);
  }

  /**
   * Atomic credit deduction with transaction log and rollback capability
   */
  deductCredits(
    userId: string,
    cost: number,
    description: string,
    idempotencyKey?: string
  ): { success: boolean; newBalance: number; error?: string; transactionId?: string } {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, newBalance: 0, error: 'User not found' };
    }

    // Check idempotency
    if (idempotencyKey) {
      const existing = this.findTransactionByIdempotency(userId, idempotencyKey);
      if (existing) {
        return { success: true, newBalance: user.credits, transactionId: existing.id };
      }
    }

    if (user.credits < cost) {
      return {
        success: false,
        newBalance: user.credits,
        error: `Insufficient credits. This operation requires ${cost} credits, but you have ${user.credits} remaining.`
      };
    }

    const newBalance = user.credits - cost;
    user.credits = newBalance;

    const tx: CreditTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      userId,
      amount: -cost,
      type: 'deduction',
      description,
      balanceAfter: newBalance,
      idempotencyKey,
      createdAt: new Date().toISOString()
    };

    this.data.creditTransactions.unshift(tx);
    this.persist();

    return { success: true, newBalance, transactionId: tx.id };
  }

  refundCredits(userId: string, amount: number, description: string): { newBalance: number } {
    const user = this.getUserById(userId);
    if (!user) return { newBalance: 0 };

    const newBalance = user.credits + amount;
    user.credits = newBalance;

    const tx: CreditTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      userId,
      amount,
      type: 'refund',
      description,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString()
    };

    this.data.creditTransactions.unshift(tx);
    this.persist();
    return { newBalance };
  }

  addCredits(userId: string, amount: number, type: CreditTransaction['type'], description: string): { newBalance: number } {
    const user = this.getUserById(userId);
    if (!user) return { newBalance: 0 };

    const newBalance = user.credits + amount;
    user.credits = newBalance;

    const tx: CreditTransaction = {
      id: 'tx_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      userId,
      amount,
      type,
      description,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString()
    };

    this.data.creditTransactions.unshift(tx);
    this.persist();
    return { newBalance };
  }

  // Generation Logs
  logGeneration(log: Omit<GenerationLog, 'id' | 'timestamp'>): GenerationLog {
    const record: GenerationLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString()
    };
    this.data.generationLogs.unshift(record);
    // Keep last 500 logs
    if (this.data.generationLogs.length > 500) {
      this.data.generationLogs.pop();
    }
    this.persist();
    return record;
  }

  getGenerationLogs(): GenerationLog[] {
    return this.data.generationLogs;
  }

  // Settings
  getSettings(): SystemSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }
}

export const db = new Database();
