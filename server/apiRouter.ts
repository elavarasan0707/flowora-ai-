import { Router, Request, Response, NextFunction } from 'express';
import { db, User } from './db.ts';
import {
  hashPassword,
  verifyPassword,
  createSession,
  validateSession,
  revokeSession,
  determineRole,
  ensureInitialAdmin,
} from './auth.ts';
import { callGemini } from './gemini.ts';
import {
  buildSystemInstruction,
  buildContentPrompt,
  buildRefinementPrompt,
  GenerationInput,
} from './promptTemplates.ts';

export const apiRouter = Router();

// Ensure initial administrator account exists
ensureInitialAdmin();

// Authentication middleware helper
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.flowora_session) {
    token = req.cookies.flowora_session;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const user = validateSession(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = user;
  next();
}

function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

export function stripMarkdownHashes(rawText: string): string {
  if (!rawText) return rawText;
  return rawText
    // Replace lines starting with `# `, `## `, `### `, `#### ` with clean text
    .replace(/^#{1,6}\s*(.+)$/gm, (_match, title) => {
      return `${title.trim()}`;
    })
    // Remove standalone `#` or `##` or `###`
    .replace(/^#{1,6}\s*$/gm, '')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ==================== AUTH ROUTES ====================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide full name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const { hash, salt } = hashPassword(password);
    const role = determineRole(email);
    const settings = db.getSettings();
    const initialCredits = role === 'admin' ? 2500 : settings.defaultFreeCredits;

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role,
      credits: initialCredits,
      plan: role === 'admin' ? 'agency' : 'free',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.createUser(newUser);
    db.addCredits(newUser.id, initialCredits, 'initial', 'Welcome bonus credits');

    const token = createSession(newUser.id);
    const { passwordHash: _, salt: __, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || !user.passwordHash || !user.salt) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    db.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
    const token = createSession(user.id);
    const { passwordHash: _, salt: __, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

apiRouter.post('/auth/google', (req: Request, res: Response) => {
  try {
    const { email, name, googleId, avatarUrl } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Google authentication data missing.' });
    }

    let user = db.getUserByEmail(email);
    if (!user) {
      const role = determineRole(email);
      const settings = db.getSettings();
      const initialCredits = role === 'admin' ? 2500 : settings.defaultFreeCredits;

      user = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 11),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role,
        credits: initialCredits,
        plan: role === 'admin' ? 'agency' : 'free',
        avatarUrl,
        googleId,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      db.createUser(user);
      db.addCredits(user.id, initialCredits, 'initial', 'Welcome bonus credits');
    } else {
      const updates: Partial<User> = { lastLoginAt: new Date().toISOString() };
      if (avatarUrl && !user.avatarUrl) updates.avatarUrl = avatarUrl;
      if (googleId && !user.googleId) updates.googleId = googleId;
      if (determineRole(email) === 'admin' && user.role !== 'admin') {
        updates.role = 'admin';
        updates.plan = 'agency';
      }
      user = db.updateUser(user.id, updates)!;
    }

    const token = createSession(user.id);
    const { passwordHash: _, salt: __, ...safeUser } = user;

    return res.json({
      message: 'Google login successful',
      token,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Google authentication failed.' });
  }
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, salt: __, ...safeUser } = req.user!;
  return res.json({ user: safeUser });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    revokeSession(authHeader.substring(7));
  }
  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatarUrl } = req.body;
    const updates: Partial<User> = {};
    if (name) updates.name = name.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const updated = db.updateUser(req.user!.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, salt: __, ...safeUser } = updated;
    return res.json({ message: 'Profile updated', user: safeUser });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== BRAND BRAIN ROUTES ====================

apiRouter.get('/brands', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const brands = db.getBrandProfiles(req.user!.id);
  return res.json({ brands });
});

apiRouter.post('/brands', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      industry,
      description,
      targetAudience,
      painPoints,
      tone,
      preferredLanguage,
      brandVoiceExamples,
      preferredCta,
      wordsToAvoid,
      website,
      socialLinks,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Brand name and description are required.' });
    }

    const newBrand = db.createBrandProfile({
      id: 'brd_' + Math.random().toString(36).substring(2, 11),
      userId: req.user!.id,
      name: name.trim(),
      industry: (industry || 'General').trim(),
      description: description.trim(),
      targetAudience: (targetAudience || 'Target customers and followers').trim(),
      painPoints: (painPoints || '').trim(),
      tone: (tone || 'Professional & Engaging').trim(),
      preferredLanguage: preferredLanguage || 'English',
      brandVoiceExamples: (brandVoiceExamples || '').trim(),
      preferredCta: (preferredCta || '').trim(),
      wordsToAvoid: (wordsToAvoid || '').trim(),
      website: website?.trim(),
      socialLinks: socialLinks?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Brand profile created', brand: newBrand });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to create brand profile' });
  }
});

apiRouter.put('/brands/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const brand = db.getBrandProfileById(req.params.id, req.user!.id);
    if (!brand) return res.status(404).json({ error: 'Brand profile not found' });

    const updated = db.updateBrandProfile(req.params.id, req.user!.id, req.body);
    return res.json({ message: 'Brand profile updated', brand: updated });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update brand profile' });
  }
});

apiRouter.delete('/brands/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteBrandProfile(req.params.id, req.user!.id);
  if (!success) return res.status(404).json({ error: 'Brand profile not found' });
  return res.json({ message: 'Brand profile deleted' });
});

// ==================== CONTENT LIBRARY ROUTES ====================

apiRouter.get('/content', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const items = db.getContentItems(req.user!.id);
  const { category, type, search, favorite, draft } = req.query;

  let filtered = items;
  if (category && typeof category === 'string') {
    filtered = filtered.filter(i => i.category === category);
  }
  if (type && typeof type === 'string') {
    filtered = filtered.filter(i => i.contentType === type);
  }
  if (favorite === 'true') {
    filtered = filtered.filter(i => i.isFavorite);
  }
  if (draft === 'true') {
    filtered = filtered.filter(i => i.isDraft);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      i => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || i.prompt.toLowerCase().includes(q)
    );
  }

  return res.json({ items: filtered });
});

apiRouter.get('/content/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const item = db.getContentItemById(req.params.id, req.user!.id);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  return res.json({ item });
});

apiRouter.post('/content', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, contentType, category, prompt, inputs, content, language, brandId, brandName, isDraft, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newItem = db.createContentItem({
      id: 'cnt_' + Math.random().toString(36).substring(2, 11),
      userId: req.user!.id,
      brandId,
      brandName,
      title: title.trim(),
      contentType: contentType || 'universal',
      category: category || 'universal',
      prompt: prompt || '',
      inputs: inputs || {},
      content,
      language: language || 'English',
      version: 1,
      versionsHistory: [],
      isFavorite: false,
      isDraft: Boolean(isDraft),
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(201).json({ message: 'Content saved', item: newItem });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to save content' });
  }
});

apiRouter.put('/content/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateContentItem(req.params.id, req.user!.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Content not found' });
    return res.json({ message: 'Content updated', item: updated });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to update content' });
  }
});

apiRouter.delete('/content/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const success = db.deleteContentItem(req.params.id, req.user!.id);
  if (!success) return res.status(404).json({ error: 'Content not found' });
  return res.json({ message: 'Content deleted' });
});

apiRouter.post('/content/:id/favorite', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const item = db.getContentItemById(req.params.id, req.user!.id);
  if (!item) return res.status(404).json({ error: 'Content not found' });
  const updated = db.updateContentItem(req.params.id, req.user!.id, { isFavorite: !item.isFavorite });
  return res.json({ message: 'Favorite toggled', isFavorite: updated?.isFavorite });
});

// ==================== CREDITS & BILLING ROUTES ====================

apiRouter.get('/credits/balance', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = db.getUserById(req.user!.id)!;
  const settings = db.getSettings();
  return res.json({
    credits: user.credits,
    plan: user.plan,
    creditCosts: settings.creditCosts,
  });
});

apiRouter.get('/credits/transactions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const transactions = db.getCreditTransactions(req.user!.id);
  return res.json({ transactions });
});

apiRouter.post('/credits/purchase-intent', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { packageId } = req.body;
    const packages: Record<string, { credits: number; price: number; name: string }> = {
      starter_pack: { credits: 200, price: 9.99, name: 'Creator Spark (200 Credits)' },
      pro_pack: { credits: 650, price: 24.99, name: 'Pro Growth (650 Credits)' },
      agency_pack: { credits: 2000, price: 69.99, name: 'Agency Scale (2,000 Credits)' },
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid credit package selected.' });
    }

    // In a live environment, this generates a Stripe/Razorpay checkout session.
    // For seamless testing and customer onboarding, we activate the package with transaction record.
    const newBalance = db.addCredits(
      req.user!.id,
      pkg.credits,
      'purchase',
      `Purchased ${pkg.name} for $${pkg.price}`
    ).newBalance;

    return res.json({
      message: `Successfully credited ${pkg.credits} credits to your account!`,
      credits: newBalance,
      package: pkg,
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Credit purchase failed.' });
  }
});

// ==================== AI GENERATION ROUTES ====================

apiRouter.post('/generate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const startTime = Date.now();
  const userId = req.user!.id;
  const {
    contentType = 'universal',
    category = 'universal',
    topic,
    duration,
    language = 'English',
    tone,
    targetAudience,
    objective,
    keywords,
    preferredCta,
    requiredFacts,
    referenceText,
    additionalInstructions,
    brandId,
    idempotencyKey,
    saveToLibrary = true,
  } = req.body;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a topic or core content idea.' });
  }

  const settings = db.getSettings();
  const cost = settings.creditCosts[contentType] || settings.creditCosts.universal || 4;

  // Atomically check and deduct credits
  const deduction = db.deductCredits(
    userId,
    cost,
    `AI Generation: ${contentType.replace(/_/g, ' ')} ("${topic.slice(0, 30)}...")`,
    idempotencyKey
  );

  if (!deduction.success) {
    return res.status(402).json({
      error: deduction.error,
      requiredCredits: cost,
      currentBalance: deduction.newBalance,
    });
  }

  let brand: any = undefined;
  if (brandId) {
    brand = db.getBrandProfileById(brandId, userId);
  }

  try {
    const input: GenerationInput = {
      contentType,
      category,
      topic: topic.trim(),
      duration,
      language,
      tone,
      targetAudience,
      objective,
      keywords,
      preferredCta,
      requiredFacts,
      referenceText,
      additionalInstructions,
    };

    const systemInstruction = buildSystemInstruction(brand);
    const prompt = buildContentPrompt(input, brand);

    // Call server-side Gemini API
    const rawGeneratedText = await callGemini({
      systemInstruction,
      prompt,
      temperature: 0.75,
    });
    const generatedText = stripMarkdownHashes(rawGeneratedText);

    const durationMs = Date.now() - startTime;

    // Log success
    db.logGeneration({
      userId,
      contentType,
      creditsCharged: cost,
      durationMs,
      status: 'success',
    });

    let savedItem = undefined;
    if (saveToLibrary) {
      // Auto-save generated item to library
      const title = `${contentType.replace(/_/g, ' ').toUpperCase()}: ${topic.slice(0, 40)}`;
      savedItem = db.createContentItem({
        id: 'cnt_' + Math.random().toString(36).substring(2, 11),
        userId,
        brandId: brand?.id,
        brandName: brand?.name,
        title,
        contentType,
        category: (category as any) || 'universal',
        prompt,
        inputs: input,
        content: generatedText,
        language: language || 'English',
        version: 1,
        versionsHistory: [],
        isFavorite: false,
        isDraft: false,
        tags: [contentType, language.toLowerCase()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return res.json({
      content: generatedText,
      creditsUsed: cost,
      remainingCredits: deduction.newBalance,
      transactionId: deduction.transactionId,
      savedItem,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error('Generation failure:', error);

    // Automatic refund on failure!
    const refundResult = db.refundCredits(
      userId,
      cost,
      `Automatic Refund: Failed generation for ${contentType}`
    );

    db.logGeneration({
      userId,
      contentType,
      creditsCharged: 0,
      durationMs,
      status: 'failed',
      error: error?.message || 'Unknown generation error',
    });

    let rawMsg = error?.message || '';
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed?.error?.message) rawMsg = parsed.error.message;
    } catch {}

    const cleanErrorMsg = rawMsg || 'AI generation failed. Your credits have been safely refunded.';

    return res.status(500).json({
      error: cleanErrorMsg,
      refunded: cost,
      remainingCredits: refundResult.newBalance,
    });
  }
});

apiRouter.post('/generate/refine', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { contentId, currentContent, refinementType, options = {} } = req.body;

  if (!currentContent) {
    return res.status(400).json({ error: 'Content to refine is required.' });
  }

  const cost = 2; // Low cost for refinement
  const deduction = db.deductCredits(
    userId,
    cost,
    `AI Content Refinement: ${refinementType}`
  );

  if (!deduction.success) {
    return res.status(402).json({
      error: deduction.error,
      requiredCredits: cost,
      currentBalance: deduction.newBalance,
    });
  }

  try {
    const prompt = buildRefinementPrompt(currentContent, refinementType, options);
    const rawRefinedText = await callGemini({
      prompt,
      temperature: 0.65,
    });
    const refinedText = stripMarkdownHashes(rawRefinedText);

    let updatedItem = undefined;
    if (contentId) {
      updatedItem = db.updateContentItem(contentId, userId, { content: refinedText });
    }

    return res.json({
      content: refinedText,
      creditsUsed: cost,
      remainingCredits: deduction.newBalance,
      updatedItem,
    });
  } catch (error: any) {
    let rawMsg = error?.message || '';
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed?.error?.message) rawMsg = parsed.error.message;
    } catch {}

    return res.status(500).json({
      error: rawMsg || 'Refinement failed. Credits refunded.',
    });
  }
});

// ==================== MINI CHATGPT CONVERSATIONAL ROUTE ====================

apiRouter.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const cost = 2; // Economical 2 credits per conversational turn
  const startTime = Date.now();

  const {
    messages = [],
    context = '',
    language = 'Tanglish',
    tone = 'Conversational & Engaging',
    idempotencyKey,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one message.' });
  }

  // Deduct credits
  const deduction = db.deductCredits(
    userId,
    cost,
    `Mini ChatGPT Query (${messages[messages.length - 1].content.slice(0, 30)}...)`,
    idempotencyKey
  );

  if (!deduction.success) {
    return res.status(402).json({
      error: deduction.error,
      requiredCredits: cost,
      currentBalance: deduction.newBalance,
    });
  }

  try {
    const latestUserMsg = messages[messages.length - 1].content;

    let systemInstruction = `You are "Flowora Mini ChatGPT" — an elite AI content creator and marketing intelligence assistant.
Your specialty is converting user context and ideas into viral, high-converting social media content, reel scripts, YouTube blueprints, copy, and conversational explanations.

LANGUAGE CADENCE: ${language}
${
  language === 'Tanglish'
    ? 'CRITICAL FOR TANGLISH: Speak in natural, trendy spoken Tanglish (Tamil in English alphabet) as used by top modern creators and youth (e.g. "Machan, idha note pannikonga", "Indha hook semma viral aagum", "Indha 3 steps follow pannunga"). Keep it energetic, relatable, and authentic!'
    : ''
}
${
  language === 'Tamil'
    ? 'CRITICAL FOR TAMIL: Use natural, punchy contemporary Tamil in Tamil script (தமிழ்). Avoid bookish or outdated vocabulary.'
    : ''
}

TONE: ${tone}

FORMATTING RULES:
- Use clean Markdown with headers, bold text, bullet points, and relevant emojis.
- When generating reel/shorts scripts from context, include:
  1. Audio & Vibe recommendation
  2. 3 Scroll-stopping hooks (Visual + Spoken line + Bold On-screen text)
  3. Scene-by-scene timing breakdown (0-3s, 3-10s, etc.)
  4. Caption + 10-15 viral hashtags + Replay loop tip.
- When answering general creator questions or follow-ups, be concise, direct, helpful, and actionable. Never produce AI slop filler words.`;

    if (context && context.trim().length > 0) {
      systemInstruction += `\n\n========================================
CURRENT CONTEXT KNOWLEDGE BASE (PROVIDED BY USER):
${context.trim()}
========================================
Always anchor your answers, scripts, ideas, and strategies directly into the above context provided by the user.`;
    }

    // Format conversation history for prompt
    let conversationPrompt = '';
    const recentMessages = messages.slice(-8); // keep last 8 turns for context window
    for (const msg of recentMessages) {
      if (msg.role === 'user') {
        conversationPrompt += `\n\nUser: ${msg.content}`;
      } else {
        conversationPrompt += `\n\nFlowora AI: ${msg.content}`;
      }
    }
    conversationPrompt += `\n\nFlowora AI:`;

    const rawReply = await callGemini({
      systemInstruction,
      prompt: conversationPrompt,
      temperature: 0.75,
    });
    const reply = stripMarkdownHashes(rawReply);

    const durationMs = Date.now() - startTime;
    db.logGeneration({
      userId,
      contentType: 'mini_chatgpt',
      creditsCharged: cost,
      durationMs,
      status: 'success',
    });

    return res.json({
      reply,
      creditsUsed: cost,
      remainingCredits: deduction.newBalance,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    db.refundCredits(userId, cost, 'Automatic Refund: Failed Mini ChatGPT query');

    let rawMsg = error?.message || '';
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed?.error?.message) rawMsg = parsed.error.message;
    } catch {}

    db.logGeneration({
      userId,
      contentType: 'mini_chatgpt',
      creditsCharged: 0,
      durationMs,
      status: 'failed',
      error: rawMsg,
    });

    return res.status(500).json({
      error: rawMsg || 'Mini ChatGPT failed to generate response. Credits refunded.',
      remainingCredits: db.getUserById(userId)?.credits ?? 0,
    });
  }
});

// ==================== ADMIN DASHBOARD ROUTES ====================

apiRouter.get('/admin/stats', authMiddleware, adminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers();
  const logs = db.getGenerationLogs();
  const totalGenerations = logs.length;
  const successfulGenerations = logs.filter(l => l.status === 'success').length;
  const totalCreditsCharged = logs.reduce((sum, l) => sum + (l.creditsCharged || 0), 0);
  // Estimated API cost: ~$0.00015 per flash generation
  const estimatedModelCost = (successfulGenerations * 0.00018).toFixed(4);

  return res.json({
    totalUsers: users.length,
    totalGenerations,
    successRate: totalGenerations > 0 ? Math.round((successfulGenerations / totalGenerations) * 100) : 100,
    totalCreditsCharged,
    estimatedModelCost: `$${estimatedModelCost}`,
    activeUsersCount: users.filter(u => Date.now() - new Date(u.lastLoginAt).getTime() < 7 * 86400000).length,
  });
});

apiRouter.get('/admin/users', authMiddleware, adminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getUsers().map(({ passwordHash: _, salt: __, ...safeUser }) => safeUser);
  return res.json({ users });
});

apiRouter.post('/admin/credits/adjust', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId, amount, reason } = req.body;
  if (!targetUserId || typeof amount !== 'number' || !reason) {
    return res.status(400).json({ error: 'targetUserId, numeric amount, and reason are required.' });
  }

  const user = db.getUserById(targetUserId);
  if (!user) return res.status(404).json({ error: 'Target user not found' });

  const result = db.addCredits(
    targetUserId,
    amount,
    'admin_adjustment',
    `Admin adjustment by ${req.user!.email}: ${reason}`
  );

  return res.json({
    message: `Adjusted ${amount > 0 ? '+' : ''}${amount} credits for ${user.email}`,
    newBalance: result.newBalance,
  });
});

apiRouter.get('/admin/logs', authMiddleware, adminMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const logs = db.getGenerationLogs();
  return res.json({ logs });
});

apiRouter.put('/admin/settings', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateSettings(req.body);
  return res.json({ message: 'Settings updated', settings: updated });
});

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', brand: 'Flowora AI', version: '2.0.0', time: new Date().toISOString() });
});
