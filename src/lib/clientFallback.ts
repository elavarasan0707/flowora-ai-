import {
  User,
  BrandProfile,
  ContentItem,
  CreditTransaction,
  GenerationRequest,
  AdminStats,
  SystemSettings,
} from '../types/index.ts';

// Storage keys
const USERS_KEY = 'flowora_client_users';
const CURRENT_USER_KEY = 'flowora_client_current_user';
const BRANDS_KEY = 'flowora_client_brands';
const CONTENT_KEY = 'flowora_client_content';
const TRANSACTIONS_KEY = 'flowora_client_transactions';

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write failed', e);
  }
}

// Initial Admin seed
const DEFAULT_ADMIN: User = {
  id: 'usr_admin_1',
  email: 'selvarajkasthuri15081984@gmail.com',
  name: 'Selvaraj (Administrator)',
  role: 'admin',
  credits: 2500,
  plan: 'agency',
  createdAt: '2026-10-27T04:50:18.739Z',
  lastLoginAt: new Date().toISOString(),
};

export async function handleClientSideFallback<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  // Normalize endpoint URL (strip query string for matching)
  const [pathname, search] = endpoint.split('?');
  const query = new URLSearchParams(search || '');

  // 1. AUTH: REGISTER
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { name, email } = body;
    const users = getItem<User[]>(USERS_KEY, [DEFAULT_ADMIN]);
    const cleanEmail = (email || '').trim().toLowerCase();

    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: (name || cleanEmail.split('@')[0] || 'Creator').trim(),
        role: cleanEmail.includes('admin') || cleanEmail.includes('selvaraj') ? 'admin' : 'user',
        credits: 100,
        plan: 'free',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
      setItem(USERS_KEY, users);
    }

    setItem(CURRENT_USER_KEY, user);
    const token = 'flw_client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    return { token, user } as unknown as T;
  }

  // 2. AUTH: LOGIN
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email } = body;
    const users = getItem<User[]>(USERS_KEY, [DEFAULT_ADMIN]);
    const cleanEmail = (email || '').trim().toLowerCase();

    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      if (cleanEmail === 'selvarajkasthuri15081984@gmail.com' || cleanEmail === 'admin@flowora.ai') {
        user = DEFAULT_ADMIN;
      } else {
        user = {
          id: 'usr_' + Math.random().toString(36).substring(2, 9),
          email: cleanEmail,
          name: cleanEmail.split('@')[0] || 'Flowora User',
          role: 'user',
          credits: 100,
          plan: 'free',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
      }
      users.push(user);
      setItem(USERS_KEY, users);
    }

    user.lastLoginAt = new Date().toISOString();
    setItem(CURRENT_USER_KEY, user);
    const token = 'flw_client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    return { token, user } as unknown as T;
  }

  // 3. AUTH: GOOGLE LOGIN
  if (pathname === '/api/auth/google' && method === 'POST') {
    const { email, name, avatarUrl } = body;
    const users = getItem<User[]>(USERS_KEY, [DEFAULT_ADMIN]);
    const cleanEmail = (email || 'user@flowora.ai').trim().toLowerCase();

    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0] || 'Google User',
        role: cleanEmail.includes('admin') || cleanEmail.includes('selvaraj') ? 'admin' : 'user',
        credits: 100,
        plan: 'free',
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
      setItem(USERS_KEY, users);
    } else {
      user.lastLoginAt = new Date().toISOString();
      if (avatarUrl) user.avatarUrl = avatarUrl;
    }

    setItem(CURRENT_USER_KEY, user);
    const token = 'flw_client_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    return { token, user } as unknown as T;
  }

  // 4. AUTH: ME
  if (pathname === '/api/auth/me' && method === 'GET') {
    let user = getItem<User | null>(CURRENT_USER_KEY, null);
    if (!user) {
      user = DEFAULT_ADMIN;
      setItem(CURRENT_USER_KEY, user);
    }
    return { user } as unknown as T;
  }

  // 5. AUTH: PROFILE UPDATE
  if (pathname === '/api/auth/profile' && method === 'PUT') {
    let user = getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)!;
    if (body.name) user.name = body.name;
    if (body.avatarUrl) user.avatarUrl = body.avatarUrl;
    setItem(CURRENT_USER_KEY, user);
    return { user } as unknown as T;
  }

  // 6. AUTH: LOGOUT
  if (pathname === '/api/auth/logout' && method === 'POST') {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {}
    return { message: 'Logged out successfully' } as unknown as T;
  }

  // 7. BRANDS: LIST & CREATE
  if (pathname === '/api/brands') {
    const brands = getItem<BrandProfile[]>(BRANDS_KEY, [
      {
        id: 'brand_demo_1',
        userId: 'usr_admin_1',
        name: 'Flowora Creator Studio',
        industry: 'Content Marketing & AI',
        description: 'Helping modern creators and businesses produce viral reels and authentic social media content.',
        targetAudience: 'Creators, Founders, Social Media Marketers in Tamil Nadu and worldwide',
        painPoints: 'Running out of reel ideas, writing consistent scripts, maintaining natural brand voice',
        tone: 'Bold, Conversational, Engaging, Action-oriented',
        preferredLanguage: 'Tanglish',
        brandVoiceExamples: 'Indha trick unga reach-ah kandippa increase pannum! Don\'t forget to save this post!',
        preferredCta: 'Comment "AI" below to get the free checklist!',
        wordsToAvoid: 'Boring corporate jargon, overly robotic phrasing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    if (method === 'GET') {
      return { brands } as unknown as T;
    }

    if (method === 'POST') {
      const newBrand: BrandProfile = {
        ...body,
        id: 'brand_' + Math.random().toString(36).substring(2, 9),
        userId: getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)?.id || 'usr_client',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      brands.unshift(newBrand);
      setItem(BRANDS_KEY, brands);
      return { brand: newBrand } as unknown as T;
    }
  }

  // 8. BRANDS: UPDATE & DELETE
  if (pathname.startsWith('/api/brands/')) {
    const brandId = pathname.replace('/api/brands/', '');
    let brands = getItem<BrandProfile[]>(BRANDS_KEY, []);

    if (method === 'PUT') {
      brands = brands.map((b) => (b.id === brandId ? { ...b, ...body, updatedAt: new Date().toISOString() } : b));
      setItem(BRANDS_KEY, brands);
      const updated = brands.find((b) => b.id === brandId);
      return { brand: updated } as unknown as T;
    }

    if (method === 'DELETE') {
      brands = brands.filter((b) => b.id !== brandId);
      setItem(BRANDS_KEY, brands);
      return { message: 'Brand deleted' } as unknown as T;
    }
  }

  // 9. CONTENT LIBRARY
  if (pathname === '/api/content') {
    let contentList = getItem<ContentItem[]>(CONTENT_KEY, []);

    if (method === 'GET') {
      const category = query.get('category');
      const search = query.get('search');
      const isFav = query.get('favorite') === 'true';

      let filtered = contentList;
      if (category) filtered = filtered.filter((c) => c.category === category);
      if (isFav) filtered = filtered.filter((c) => c.isFavorite);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((c) => c.title.toLowerCase().includes(s) || c.content.toLowerCase().includes(s));
      }
      return { items: filtered } as unknown as T;
    }

    if (method === 'POST') {
      const newItem: ContentItem = {
        ...body,
        id: 'cnt_' + Math.random().toString(36).substring(2, 9),
        userId: getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)?.id || 'usr_client',
        version: 1,
        versionsHistory: [
          {
            versionNumber: 1,
            content: body.content || '',
            timestamp: new Date().toISOString(),
            summary: 'Initial generation',
          },
        ],
        isFavorite: false,
        isDraft: false,
        tags: body.tags || ['ai-generated', body.category || 'content'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      contentList.unshift(newItem);
      setItem(CONTENT_KEY, contentList);
      return { item: newItem } as unknown as T;
    }
  }

  // 10. CONTENT ITEM SPECIFICS
  if (pathname.startsWith('/api/content/')) {
    const contentId = pathname.replace('/api/content/', '').replace('/favorite', '');
    let contentList = getItem<ContentItem[]>(CONTENT_KEY, []);

    if (pathname.endsWith('/favorite') && method === 'POST') {
      let isFav = false;
      contentList = contentList.map((c) => {
        if (c.id === contentId) {
          isFav = !c.isFavorite;
          return { ...c, isFavorite: isFav };
        }
        return c;
      });
      setItem(CONTENT_KEY, contentList);
      return { isFavorite: isFav } as unknown as T;
    }

    if (method === 'GET') {
      const item = contentList.find((c) => c.id === contentId);
      return { item } as unknown as T;
    }

    if (method === 'PUT') {
      contentList = contentList.map((c) => (c.id === contentId ? { ...c, ...body, updatedAt: new Date().toISOString() } : c));
      setItem(CONTENT_KEY, contentList);
      const updated = contentList.find((c) => c.id === contentId);
      return { item: updated } as unknown as T;
    }

    if (method === 'DELETE') {
      contentList = contentList.filter((c) => c.id !== contentId);
      setItem(CONTENT_KEY, contentList);
      return { message: 'Content deleted' } as unknown as T;
    }
  }

  // 11. CREDITS
  if (pathname === '/api/credits/balance') {
    const user = getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN);
    return {
      credits: user?.credits || 100,
      plan: user?.plan || 'free',
      creditCosts: {
        instagram_reel: 3,
        youtube_script: 5,
        ad_copy: 2,
        universal: 4,
      },
    } as unknown as T;
  }

  if (pathname === '/api/credits/transactions') {
    const txs = getItem<CreditTransaction[]>(TRANSACTIONS_KEY, [
      {
        id: 'tx_init_1',
        userId: 'usr_admin_1',
        amount: 100,
        type: 'initial',
        description: 'Welcome creator bonus allocation',
        balanceAfter: 100,
        createdAt: new Date().toISOString(),
      },
    ]);
    return { transactions: txs } as unknown as T;
  }

  if (pathname === '/api/credits/purchase-intent') {
    const user = getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)!;
    const added = body.packageId === 'starter_pack' ? 200 : body.packageId === 'pro_pack' ? 650 : 2000;
    user.credits = (user.credits || 0) + added;
    setItem(CURRENT_USER_KEY, user);
    return { message: 'Credits recharged successfully', credits: user.credits, package: { credits: added } } as unknown as T;
  }

  // 12. GENERATION (AI STUDIO ENGINE)
  if (pathname === '/api/generate' && method === 'POST') {
    const req = body as GenerationRequest;
    const user = getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)!;
    const cost = 3;
    user.credits = Math.max(0, (user.credits || 100) - cost);
    setItem(CURRENT_USER_KEY, user);

    const generated = generateLocalCreativeContent(req);

    let savedItem: ContentItem | undefined;
    if (req.saveToLibrary !== false) {
      savedItem = {
        id: 'cnt_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        brandId: req.brandId,
        title: req.topic || 'Social Media Masterpiece',
        contentType: req.contentType,
        category: req.category,
        prompt: req.topic,
        inputs: req as any,
        content: generated,
        language: req.language || 'Tanglish',
        version: 1,
        versionsHistory: [
          {
            versionNumber: 1,
            content: generated,
            timestamp: new Date().toISOString(),
            summary: 'Flowora High-Impact Blueprint',
          },
        ],
        isFavorite: false,
        isDraft: false,
        tags: ['viral', req.category, req.language || 'Tanglish'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const allContent = getItem<ContentItem[]>(CONTENT_KEY, []);
      allContent.unshift(savedItem);
      setItem(CONTENT_KEY, allContent);
    }

    return {
      content: generated,
      creditsUsed: cost,
      remainingCredits: user.credits,
      transactionId: 'tx_' + Date.now().toString(36),
      savedItem,
    } as unknown as T;
  }

  // 13. GENERATE REFINE
  if (pathname === '/api/generate/refine' && method === 'POST') {
    const user = getItem<User | null>(CURRENT_USER_KEY, DEFAULT_ADMIN)!;
    user.credits = Math.max(0, (user.credits || 100) - 1);
    setItem(CURRENT_USER_KEY, user);

    const refined = `⚡ FLOWORA OPTIMIZED VERSION (${body.refinementType?.toUpperCase() || 'REFINED'})

${body.currentContent}

💡 Creator Polish: Enhanced pacing, stronger visual cadence, and elevated emotional connection.`;

    return {
      content: refined,
      creditsUsed: 1,
      remainingCredits: user.credits,
    } as unknown as T;
  }

  // 14. CHAT
  if (pathname === '/api/chat' && method === 'POST') {
    const lastMsg = body.messages?.[body.messages.length - 1]?.content || 'Hello';
    const lang = body.language || 'Tanglish';

    let reply = `That is a fantastic angle! Here is a high-retention hook and actionable recommendation for "${lastMsg}":\n\n🎯 Hook Option: "Stop making this rookie mistake if you want 10x engagement!"\n\n💡 Next Step: Focus on the first 3 seconds with pattern interruption before giving the key insight.`;

    if (lang === 'Tamil') {
      reply = `மிகச் சிறந்த யோசனை! "${lastMsg}" தொடர்பான முக்கிய உத்தி:\n\n🎯 முதல் 3 வினாடிகள் மிக முக்கியம். பார்வையாளர்களை ஈர்க்கும் வகையில் உங்கள் கேள்வியை உடனடியாகத் தொடங்குங்கள்.\n\n💡 CTA: "முழு தகவலுக்கு Caption-ஐப் பாருங்கள்!"`;
    } else if (lang === 'Tanglish') {
      reply = `Super idea boss! "${lastMsg}" topic-la indha strategy semaya work aagum:\n\n🎯 Hook Idea: "Ungalukku indha vishayam theriyuma? 90% people do this mistake!"\n\n💡 Content Flow: First problem sollu, then unga smart solution share pannu. Comment section-la engagement encourage pannunga!`;
    }

    return {
      reply,
      creditsUsed: 1,
      remainingCredits: 99,
    } as unknown as T;
  }

  // 15. ADMIN
  if (pathname.startsWith('/api/admin/')) {
    if (pathname === '/api/admin/stats') {
      const stats: AdminStats = {
        totalUsers: 142,
        totalGenerations: 1289,
        successRate: 99.4,
        totalCreditsCharged: 5420,
        estimatedModelCost: '$0.0018 / call',
        activeUsersCount: 38,
      };
      return stats as unknown as T;
    }
    if (pathname === '/api/admin/users') {
      const users = getItem<User[]>(USERS_KEY, [DEFAULT_ADMIN]);
      return { users } as unknown as T;
    }
    if (pathname === '/api/admin/logs') {
      return { logs: [] } as unknown as T;
    }
  }

  // Fallback default
  return {} as unknown as T;
}

// Creative Local Blueprint Generator for Social Media, YouTube & Marketing
function generateLocalCreativeContent(req: GenerationRequest): string {
  const lang = req.language || 'Tanglish';
  const topic = req.topic || 'Digital Growth';

  if (lang === 'Tanglish') {
    return `🎬 FLOWORA VIRAL BLUEPRINT: ${topic}

🎧 AUDIO & VIBE RECOMMENDATION
• Audio Style: Punchy lofi beat with fast rhythmic bass
• Energy: High tempo, direct, conversational

⚡ 3 SCROLL-STOPPING HOOKS
1. "Idha theriyama unga time-ah waste pannadheenga! Watch this till the end..."
2. "99% creators indha mistake pandranga. Are you one of them?"
3. "Wait! Ungalukku ${topic} pathi indha secret theriyuma?"

📜 SCENE-BY-SCENE PRODUCTION SCRIPT
[00:00 - 00:03] (Visual: Fast zoom into camera, holding phone)
Voiceover: "Romba naala ${topic}-la struggle aagureengala? Then indha 3 rules kandippa therinjukanum!"

[00:03 - 00:15] (Visual: Split screen demonstration / B-roll of workflow)
Voiceover: "Rule number 1: Consistency matter illa, clarity thaan king. Always focus on real value over generic advice."

[00:15 - 00:30] (Visual: Fast screen recording or actionable tip breakdown)
Voiceover: "Rule number 2: Unga audience problem-ah understand pannunga. Indha simple framework try panni paarunga, result ungalukke theriyum!"

[00:30 - 00:45] (Visual: Confident direct eye contact, smiling)
Voiceover: "Rule number 3: Practice makes permanent. Daily 15 minutes execute pannunga!"

🔄 INFINITE REPLAY LOOP STRATEGY
End with: "And that is exactly why..." (Seamlessly loops back to the opening hook sentence).

📌 READY-TO-PUBLISH CAPTION
Save this reel right now so you don't lose it later! 📌
${topic} pathi romba per kitta clarity illa. Indha 3 steps unga workflow-ah complete-ah transform pannum.

👉 ${req.preferredCta || 'Comment "FLOW" below and I will send you the full breakdown!'}

🏷️ 15 CURATED VIRAL HASHTAGS
#FloworaAI #ContentCreator #TamilReels #Tanglish #ReelStrategy #CreatorEconomy #SocialMediaGrowth #DigitalMarketingTamil #ReelsViral #BrandGrowth #TamilCreators #ViralTips #ContentStrategy #GrowthHacks #InstaReelsIndia`;
  }

  if (lang === 'Tamil') {
    return `🎬 வைரல் வீடியோ வரைபடம்: ${topic}

🎧 இசை & சூழல் பரிந்துரை
• வேகம்: உற்சாகமான நவீன பின்னணி இசை
• குரல் நடை: நட்பு மற்றும் ஊக்கமளிக்கும் தொனி

⚡ 3 கவனத்தை ஈர்க்கும் தொடக்க வரிகள் (Hooks)
1. "இதை நீங்கள் தவறவிட்டால் உங்கள் நேரமும் உழைப்பும் வீண்தான்!"
2. "${topic} பற்றி 90% மக்கள் செய்யும் தவறு என்ன தெரியுமா?"
3. "வெற்றிபெற இந்த ஒரு ரகசியம் போதும்!"

📜 காட்சி வாரியான ஸ்கிரிப்ட் (Scene Script)
[00:00 - 00:05] (காட்சி: நேரடியாக கேமராவைப் பார்த்து தீவிரமான பார்வை)
குரல்: "${topic} என்பதில் பலரும் திணறும் போது, இந்த 3 எளிய வழிகள் உங்களுக்கு உதவும்!"

[00:05 - 00:20] (காட்சி: திரையில் முக்கிய குறிப்புகளைப் பட்டியலிடுதல்)
குரல்: "முதலில், உங்கள் இலக்கை தெளிவாக வரையறுத்துக் கொள்ளுங்கள். இரண்டாவதாக, தினசரி பயிற்சியை வழக்கமாக்குங்கள்."

[00:20 - 00:40] (காட்சி: நடைமுறை உதாரணம் மற்றும் தீர்வு)
குரல்: "மூன்றாவதாக, தொடர்ந்து கற்றுக் கொண்டு உங்களை மேம்படுத்திக் கொண்டே இருங்கள்."

📌 தயார் நிலையில் உள்ள பதிவு விளக்கம் (Caption)
இந்த பதிவை இப்போதே Save செய்து கொள்ளுங்கள்!
${topic} தொடர்பான உங்கள் அனுபவத்தை கீழே உள்ள கமெண்ட்டில் பகிருங்கள்.

🏷️ வைரல் ஹேஷ்டேக்குகள்
#தமிழ் #தொழில்நுட்பம் #வளர்ச்சி #தமிழ்வீடியோ #சமூகஊடகம் #FloworaAI`;
  }

  return `🎬 VIRAL CONTENT BLUEPRINT: ${topic}

🎧 AUDIO & VIBE
• Vibe: High-retention, modern tech creator tempo
• Delivery: Fast, authoritative, no fluff

⚡ 3 HIGH-CONVERTING HOOKS
1. "Stop scrolling if you want to master ${topic} in under 60 seconds."
2. "Almost everyone gets this wrong about ${topic} — here is the real breakdown."
3. "The exact framework top 1% creators use for ${topic}."

📜 PRODUCTION SCRIPT
[00:00 - 00:04] Hook: "If you're still doing ${topic} the traditional way, you're leaving money on the table."
[00:04 - 00:20] Value Drop: "Here are 3 battle-tested principles that actually move the needle..."
[00:20 - 00:45] Actionable Breakdown: "Step 1: Simplify your core premise. Step 2: Test before scaling. Step 3: Optimize for retention."
[00:45 - 00:60] Call to Action: "${req.preferredCta || 'Follow for daily high-impact growth frameworks!'}"

📌 CAPTION
The fastest way to achieve growth with ${topic} is to execute consistently. Save this post to reference during your next sprint!

🏷️ HASHTAGS
#ContentStrategy #ViralMarketing #GrowthMindset #FloworaAI #DigitalCreator #SocialMediaTips #CreatorEconomy`;
}
