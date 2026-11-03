import {
  User,
  BrandProfile,
  ContentItem,
  CreditTransaction,
  GenerationRequest,
  AdminStats,
  SystemSettings,
} from '../types/index.ts';

const TOKEN_KEY = 'flowora_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async googleLogin(data: { email: string; name: string; avatarUrl?: string; googleId?: string }): Promise<{ token: string; user: User }> {
    const res = await request<{ token: string; user: User }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(updates: { name?: string; avatarUrl?: string }): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
    }
  },

  // Brands
  async getBrands(): Promise<{ brands: BrandProfile[] }> {
    return request<{ brands: BrandProfile[] }>('/api/brands');
  },

  async createBrand(brand: Omit<BrandProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ brand: BrandProfile }> {
    return request<{ brand: BrandProfile }>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    });
  },

  async updateBrand(id: string, updates: Partial<BrandProfile>): Promise<{ brand: BrandProfile }> {
    return request<{ brand: BrandProfile }>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteBrand(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/brands/${id}`, {
      method: 'DELETE',
    });
  },

  // Content Library
  async getContent(params?: { category?: string; type?: string; search?: string; favorite?: boolean }): Promise<{ items: ContentItem[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    if (params?.favorite) query.set('favorite', 'true');
    const qs = query.toString();
    return request<{ items: ContentItem[] }>(`/api/content${qs ? `?${qs}` : ''}`);
  },

  async getContentItem(id: string): Promise<{ item: ContentItem }> {
    return request<{ item: ContentItem }>(`/api/content/${id}`);
  },

  async saveContent(item: Partial<ContentItem>): Promise<{ item: ContentItem }> {
    return request<{ item: ContentItem }>('/api/content', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async updateContent(id: string, updates: Partial<ContentItem>): Promise<{ item: ContentItem }> {
    return request<{ item: ContentItem }>(`/api/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteContent(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/content/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    return request<{ isFavorite: boolean }>(`/api/content/${id}/favorite`, {
      method: 'POST',
    });
  },

  // Credits
  async getCreditBalance(): Promise<{ credits: number; plan: string; creditCosts: Record<string, number> }> {
    return request<{ credits: number; plan: string; creditCosts: Record<string, number> }>('/api/credits/balance');
  },

  async getCreditTransactions(): Promise<{ transactions: CreditTransaction[] }> {
    return request<{ transactions: CreditTransaction[] }>('/api/credits/transactions');
  },

  async purchaseCredits(packageId: string): Promise<{ message: string; credits: number; package: any }> {
    return request<{ message: string; credits: number; package: any }>('/api/credits/purchase-intent', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  },

  // Generation
  async generate(req: GenerationRequest): Promise<{
    content: string;
    creditsUsed: number;
    remainingCredits: number;
    transactionId: string;
    savedItem?: ContentItem;
  }> {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async refine(data: {
    contentId?: string;
    currentContent: string;
    refinementType: 'rewrite' | 'improve' | 'expand' | 'shorten' | 'tone' | 'translate';
    options?: { targetTone?: string; targetLanguage?: string; customInstruction?: string };
  }): Promise<{ content: string; creditsUsed: number; remainingCredits: number; updatedItem?: ContentItem }> {
    return request('/api/generate/refine', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Mini ChatGPT Conversational API
  async chat(data: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    context?: string;
    language?: 'English' | 'Tamil' | 'Tanglish';
    tone?: string;
    idempotencyKey?: string;
  }): Promise<{ reply: string; creditsUsed: number; remainingCredits: number }> {
    return request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async adjustUserCredits(targetUserId: string, amount: number, reason: string): Promise<{ message: string; newBalance: number }> {
    return request('/api/admin/credits/adjust', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, amount, reason }),
    });
  },

  async getAdminLogs(): Promise<{ logs: any[] }> {
    return request<{ logs: any[] }>('/api/admin/logs');
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ message: string; settings: SystemSettings }> {
    return request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
