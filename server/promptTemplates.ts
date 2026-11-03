import { BrandProfile } from './db.ts';

export interface GenerationInput {
  contentType: string;
  topic: string;
  category?: string;
  duration?: string; // 15s, 30s, 45s, 60s
  language?: 'English' | 'Tamil' | 'Tanglish';
  tone?: string;
  targetAudience?: string;
  platform?: string;
  objective?: string;
  keywords?: string;
  preferredCta?: string;
  requiredFacts?: string;
  referenceText?: string;
  additionalInstructions?: string;
}

export function buildSystemInstruction(brand?: BrandProfile): string {
  let instruction = `You are FLOWORA AI, the world-class content creation and digital marketing intelligence engine.
Your mission is to produce high-performing, authentic, compelling, and human-sounding content that connects deeply with audiences across social media, video platforms, and marketing channels.

CORE PRINCIPLES:
1. HUMAN CONNECTION: Write with authentic pulse, punchy rhythm, and relatable emotion. Ban generic AI corporate filler words ("delve", "unlock", "tapestry", "revolutionize", "game-changer", "beacon").
2. PLATFORM NATIVE: Respect the pacing, visual dynamics, and consumption behavior of each platform.
3. CONVERSATIONAL ACCURACY: For Tamil, use natural contemporary phrasing in Tamil script. For Tanglish, use realistic, engaging spoken Tamil written in the Latin alphabet (e.g., "Namma business-la...", "Indha trick kandippa help pannum", "Save this post for later!").
4. STRUCTURED EXCELLENCE: Organize output clearly with distinct visual section titles, scene directions, spoken scripts, timestamps, and actionable CTAs.
5. FACT INTEGRITY: Never hallucinate unverified statistics, fake testimonials, or false guarantees.
6. NO MARKDOWN HASHES: STRICT RULE - DO NOT use markdown hash characters like '#', '##', or '###' anywhere in the output! Present section headings cleanly using emojis and bold text, e.g.
🎬 VIRAL REEL BLUEPRINT: [Title]
🎧 AUDIO & VIBE RECOMMENDATION
⚡ 3 SCROLL-STOPPING HOOKS
📜 SCENE-BY-SCENE PRODUCTION SCRIPT
🔄 INFINITE REPLAY LOOP STRATEGY
📌 READY-TO-PUBLISH CAPTION
🏷️ 15 CURATED VIRAL HASHTAGS
💡 CREATOR TELEPROMPTER TIPS
Never prefix headings with '#' or '##'.`;

  if (brand) {
    instruction += `\n\n--- ACTIVE BRAND BRAIN CONTEXT ---
BRAND NAME: ${brand.name}
INDUSTRY: ${brand.industry}
DESCRIPTION: ${brand.description}
TARGET AUDIENCE: ${brand.targetAudience}
CUSTOMER PAIN POINTS: ${brand.painPoints}
BRAND VOICE / PERSONALITY: ${brand.tone}
PREFERRED LANGUAGE: ${brand.preferredLanguage}
PREFERRED CTA: ${brand.preferredCta}
WORDS / PHRASES TO AVOID: ${brand.wordsToAvoid || 'None'}
BRAND VOICE REFERENCE: ${brand.brandVoiceExamples || 'Natural, authoritative, engaging'}
CRITICAL: Embody this brand personality strictly. Avoid the specified banned words.`;
  }

  return instruction;
}

export function buildContentPrompt(input: GenerationInput, brand?: BrandProfile): string {
  const language = input.language || brand?.preferredLanguage || 'English';

  let prompt = `TASK: Generate elite, high-retention ${input.contentType.replace(/_/g, ' ')} content for the following brief:
TOPIC / CONCEPT: ${input.topic}
LANGUAGE CADENCE: ${language}
${input.duration ? `TARGET DURATION: ${input.duration}` : ''}
${input.tone ? `TONE: ${input.tone}` : ''}
${input.targetAudience ? `TARGET AUDIENCE: ${input.targetAudience}` : ''}
${input.objective ? `OBJECTIVE: ${input.objective}` : ''}
${input.keywords ? `KEYWORDS / KEY PHRASES: ${input.keywords}` : ''}
${input.preferredCta ? `PREFERRED CALL-TO-ACTION (CTA): ${input.preferredCta}` : ''}
${input.requiredFacts ? `KEY FACTS / NUMBERS TO INCLUDE:\n${input.requiredFacts}` : ''}
${input.referenceText ? `RAW CONTEXT / SOURCE MATERIAL:\n${input.referenceText}` : ''}
${input.additionalInstructions ? `SPECIFIC INSTRUCTIONS:\n${input.additionalInstructions}` : ''}

STRICT FORMATTING RULE:
DO NOT output any markdown '#' or '##' or '###' characters. Write clean section headers surrounded by emojis and bold titles.`;

  switch (input.contentType) {
    case 'reel_script':
      prompt += `\n\n========================================
REQUIRED OUTPUT STRUCTURE: CHATGPT-STYLE VIRAL INSTAGRAM REEL BLUEPRINT
========================================
CRITICAL FORMATTING: Do NOT use markdown hash characters ('#', '##', '###'). Present section headers cleanly.

LANGUAGE CADENCE: ${language}
${language === 'Tanglish' ? 'CRITICAL FOR TANGLISH: Use authentic, natural conversational spoken Tanglish (Tamil in English alphabet) as spoken by trendy creators, influencers, and digital marketers (e.g. "Machan, idha gavanicheengala?", "Indha oru mistake-naala unga sales stop aagalam", "Ippo solra 3 steps-ah note pannikonga", "Save pannikonga, kandippa help pannum!"). Avoid formal bookish translation!' : ''}
${language === 'Tamil' ? 'CRITICAL FOR TAMIL: Use natural, punchy, conversational spoken Tamil in Tamil script (தமிழ்). Avoid overly archaic or bookish textbook words. Keep the spoken rhythm lively and engaging!' : ''}

OUTPUT FORMAT (Follow this exact template without '#' or '##'):

🎬 VIRAL REEL BLUEPRINT: [Catchy Hook Title]

🎧 AUDIO & VIBE RECOMMENDATION
- Suggested Audio Track / Mood: (e.g. Trending upbeat lo-fi, fast bass drop, intense cinematic riser, mysterious synthesizer)
- Voice Delivery: (e.g. Confident, whispering mystery, high-energy smiling to camera, serious eye-contact)

---

⚡ 3 SCROLL-STOPPING HOOK OPTIONS (First 0-3 Seconds)
(The hook determines 80% of reel reach. Make them impossible to swipe away!)
1. The Contrarian / Warning Hook:
   - 🎥 Visual Action: [Describe exact physical action, zoom-in, or prop]
   - 🗣️ Spoken Line: "..."
   - 🔤 On-Screen Bold Text: [...]
2. The Curiosity Gap Hook:
   - 🎥 Visual Action: [...]
   - 🗣️ Spoken Line: "..."
   - 🔤 On-Screen Bold Text: [...]
3. The Direct Value / Secret Hook:
   - 🎥 Visual Action: [...]
   - 🗣️ Spoken Line: "..."
   - 🔤 On-Screen Bold Text: [...]

---

📜 MASTER PRODUCTION SCRIPT (${input.duration || '30s'} Breakdown)
| Timestamp | 🎥 Visual & Camera Direction | 🗣️ Spoken Audio Script (${language}) | 🔤 Animated On-Screen Text | 🔊 Sound FX (SFX) |
|---|---|---|---|---|
| 00:00 - 00:03 | [Talking head, sudden punch-in zoom] | "[The Hook - Spoken with immediate urgency]" | [HOOK KEYWORDS IN YELLOW] | [Whoosh] |
| 00:03 - 00:10 | [Screen record / B-roll of problem / Gesture] | "[The Problem / Context - Why this matters to the viewer]" | [KEY CHALLENGE PHRASE] | [Tension riser] |
| 00:10 - 00:20 | [Step 1 & Step 2 visual demonstrations] | "[The Core Solution / 2 Actionable Steps from context]" | [STEP 1 / STEP 2 HIGHLIGHTS] | [Pop / Click] |
| 00:20 - 00:27 | [Punchy summary / Result reveal] | "[The Secret / Big Takeaway & Transformation]" | [RESULT NUMBER / BENEFIT] | [Ding / Cash chime] |
| 00:27 - ${input.duration || '00:30'} | [Pointing down / Looking into camera] | "[Seamless Call-To-Action connecting to loop]" | [COMMENT / SAVE CTA] | [Bass hit] |

---

🔄 INFINITE REPLAY LOOP SECRET
- Seamless Loop Line: Explain how the very last sentence connects back to the first word of the hook so the video loops infinitely on auto-play!

---

📌 READY-TO-PUBLISH INSTAGRAM CAPTION
- Hook Line: (Curiosity-packed line that stops the scroll before "...more")
- Value Summary: (3 clear bullet points with emojis summarizing the key steps)
- Engagement Trigger: (Specific question that compels people to comment)
- Call-To-Action (CTA): ("Comment '[KEYWORD]' below and I'll DM you the link / Save this for later!")

---

🏷️ 15 CURATED VIRAL HASHTAGS
- Niche Focus (5): #...
- Industry & Creator (5): #...
- Broad Explore Reach (5): #...

---

💡 CREATOR PRODUCTION & TELEPROMPTER TIP
- (Give 2 quick actionable tips on facial expression, jump cuts, and text placement so it isn't blocked by Instagram UI icons).`;
      break;

    case 'hook_generator':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
⚡ 10 MAGNETIC VIRAL HOOKS:
Categorize by psychological triggers:
1. The Curiosity Gap Hook (Makes scrolling past impossible)
2. The "Stop Doing This" Warning Hook (Exposes a common mistake)
3. The Counter-Intuitive Truth Hook (Flips conventional wisdom)
4. The Step-by-Step Secret Hook (Promises actionable blueprint)
5. The Urgent FOMO Hook (Highlights time/opportunity loss)
6. The Story Opening Hook ("Last week, something crazy happened...")
7. The Question That Hits A Nerve Hook
8. The Relatable Struggle Hook
9. The Authority & Results Hook
10. The Fast Quick-Win Hook

Include visual action suggestion for each hook!`;
      break;

    case 'carousel_copy':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE FOR INSTAGRAM CAROUSEL (NO '#' or '##'):
📑 8-SLIDE HIGH-SAVE CAROUSEL BLUEPRINT

- Slide 1 (Cover / Thumb-Stopper): Big headline, compelling subtitle, swipe indicator graphic note.
- Slide 2 (The Hook / Problem): Agitate the challenge the audience faces.
- Slide 3 (Insight 1): First tactical point with concise explanation.
- Slide 4 (Insight 2): Second tactical point with real-world context.
- Slide 5 (Insight 3): Third tactical point with key takeaway.
- Slide 6 (Common Pitfall): What happens if you ignore this.
- Slide 7 (Summary Cheat Sheet): Quick-reference recap.
- Slide 8 (Call to Action): Save this post, share with a friend, comment keyword.

Companion Caption: Write a high-engagement caption formatted with clean whitespace and hashtags.`;
      break;

    case 'caption_hashtags':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
📌 3 VIRAL CAPTION VARIATIONS:
1. Short & Punchy (Under 50 words, ideal for dynamic reels)
2. Storytelling & Value-Packed (Micro-blog style with relatable context)
3. Question & Engagement Driver (Designed to spark comments)

🏷️ 25 CATEGORIZED HASHTAGS:
(High volume, Medium niche, Low competition micro-tags).`;
      break;

    case 'youtube_shorts':
      prompt += `\n\n========================================
REQUIRED OUTPUT STRUCTURE: CHATGPT-STYLE VIRAL YOUTUBE SHORTS BLUEPRINT (NO '#' or '##')
========================================
LANGUAGE: ${language}
${language === 'Tanglish' ? 'Use natural, punchy, conversational spoken Tanglish (Tamil in English letters). Avoid textbook words.' : ''}
${language === 'Tamil' ? 'Use contemporary, lively spoken Tamil in Tamil script (தமிழ்).' : ''}

⚡ VIRAL YOUTUBE SHORTS BLUEPRINT: [High-CTR Title]

🎯 3 CLICK-WORTHY SHORTS TITLES (Under 50 Characters)
1. "..."
2. "..."
3. "..."

---

🪝 3-SECOND VISUAL & AUDIO HOOK (0-3s)
- Visual Action / B-Roll: [Shocked face / Quick zoom / High-action visual]
- Opening Spoken Line: "..."
- Bold On-Screen Text: [YELLOW CAPTION KEYWORD]

---

📜 BEAT-BY-BEAT PRODUCTION SCRIPT (60s Max)
| Timestamp | 🎥 Visual & Camera Direction | 🗣️ Spoken Voiceover (${language}) | 🔤 Animated On-Screen Captions | 🔊 Sound FX |
|---|---|---|---|---|
| 00:00 - 00:03 | [Talking head, sudden zoom-in] | "[The Hook - High-energy pattern interrupt]" | [HOOK KEYWORDS] | [Whoosh] |
| 00:03 - 00:15 | [B-Roll / Demonstration of the problem] | "[The Problem / Context - Why viewers struggle with this]" | [PROBLEM TEXT] | [Tension riser] |
| 00:15 - 00:35 | [Fast-paced step-by-step solution] | "[Tactical breakdown - Step 1, Step 2]" | [STEP 1 / STEP 2] | [Pop / Ding] |
| 00:35 - 00:50 | [Big reveal / Transformation] | "[The Pro Tip & Secret Hack]" | [RESULT NUMBER] | [Cash chime] |
| 00:50 - 00:60 | [Looking into camera, subscribe gesture] | "[CTA connecting back to the loop]" | [SUBSCRIBE / COMMENT] | [Impact boom] |

---

🔄 INFINITE REPLAY LOOP STRATEGY
- Loop Connection: How the final spoken sentence seamlessly flows back into the opening hook line on YouTube auto-loop.

---

📌 SEO VIDEO DESCRIPTION & PINNED COMMENT
- Description: 2 punchy lines + Target keywords + Relevant links placeholder.
- Pinned Comment Draft: Engaging question to spark comment debate and boost Shorts algorithm ranking.

---

🏷️ 15 YOUTUBE SHORTS SEO TAGS
- #shorts #youtubeshorts #...`;
      break;

    case 'youtube_longform':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE FOR YOUTUBE VIDEO (NO '#' or '##'):
🎥 FULL YOUTUBE VIDEO BLUEPRINT

🎯 5 CLICK-WORTHY TITLE OPTIONS (CTR Focused)
🖼️ THUMBNAIL CONCEPT (Visual layout, facial expression, and 3-word bold overlay)
⏱️ RETENTION HOOK (First 0:00 - 0:45s)
🗺️ VIDEO CHAPTER OUTLINE & TIMESTAMP GUIDE
- 00:00 - Intro & The Core Promise
- 01:30 - Chapter 1: The Foundation
- 04:15 - Chapter 2: The Core Strategy / Breakdown
- 08:00 - Chapter 3: Advanced Execution / Step-by-Step
- 11:30 - Chapter 4: Common Traps to Avoid
- 14:00 - Summary & Next Action
📝 DETAILED SPOKEN SCRIPT FOR CHAPTERS
💬 AUDIENCE RETENTION ELEMENTS (Pattern interrupts, visual callouts, interactive question)
🔎 SEO VIDEO DESCRIPTION WITH TIMESTAMPS AND KEYWORDS
🏷️ 15 YOUTUBE SEO SEARCH TAGS`;
      break;

    case 'youtube_titles_desc':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
🎯 10 HIGH-CTR YOUTUBE TITLES (Under 60 chars, tested psychological angles)
🖼️ 3 THUMBNAIL CONCEPTS (Imagery, expression, bold text overlay)
🔎 250-WORD SEO VIDEO DESCRIPTION (Keywords placed in first 2 lines, timestamp placeholders, links)
🏷️ 20 SEARCH TAGS (Separated by commas)`;
      break;

    case 'ad_copy':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
Provide 3 high-converting ad copy frameworks:
1. PAS Framework (Problem, Agitation, Solution)
2. AIDA Framework (Attention, Interest, Desire, Action)
3. Direct Response Story Framework (Personal journey / customer transformation)
Plus 5 punchy ad headline variants and CTA button recommendations.`;
      break;

    case 'email_newsletter':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
✉️ COMPLETE EMAIL NEWSLETTER:
- 5 Subject Line Variations (Curiosity, Benefit, Urgency, Personal)
- Preview Text (Snippet line)
- Hook & Personal Greeting
- Core Story / Educational Insight (Scannable, short paragraphs)
- Actionable Takeaway / Challenge
- Clear Primary CTA Button / Link
- P.S. Hook (High open-rate secondary message)`;
      break;

    case 'linkedin_post':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
💼 LINKEDIN THOUGHT LEADERSHIP POST:
- 2-Line Scroll-Stopping Hook (Must trigger "...see more" click)
- Story / Vulnerable Lesson / Counter-Intuitive Business Insight
- Core Principles (Bulleted with clean spacing)
- Discussion Question (Drives comment algorithm)
- 4 Targeted Professional Hashtags`;
      break;

    case 'blog_post':
      prompt += `\n\nREQUIRED OUTPUT STRUCTURE (NO '#' or '##'):
📰 SEO-OPTIMIZED BLOG ARTICLE:
- SEO Title (Under 60 chars)
- Meta Description (155 chars)
- Engaging Introduction with Hook
- Key Subheadings with tactical, actionable advice
- Practical Examples / Action Steps
- FAQ Section (3 high-intent search queries)
- Conclusion & Final CTA`;
      break;

    default:
      prompt += `\n\nProvide structured, highly engaging content with clear headings, actionable advice, and impactful CTAs. Do NOT use markdown '#' or '##' headers.`;
  }

  return prompt;
}

export function buildRefinementPrompt(
  currentContent: string,
  refinementType: 'rewrite' | 'improve' | 'expand' | 'shorten' | 'tone' | 'translate',
  options?: { targetTone?: string; targetLanguage?: string; customInstruction?: string }
): string {
  let instruction = `You are Flowora AI's Content Refinement Specialist.
Analyze the following existing content and refine it according to the requested instruction.
Preserve the core facts, brand voice, and intent while executing the enhancement.
CRITICAL FORMATTING: Do NOT output any '#' or '##' or '###' markdown hash characters anywhere in the response!

ORIGINAL CONTENT:
${currentContent}

REFINEMENT DIRECTIVE:`;

  switch (refinementType) {
    case 'improve':
      instruction += ` Elevate the opening hook and punchiness. Make the first 3 seconds 10x more captivating and increase emotional resonance.`;
      break;
    case 'rewrite':
      instruction += ` Give this content a fresh, dynamic alternative take. Use different analogies, fresh phrasing, and an alternative hook angle.`;
      break;
    case 'expand':
      instruction += ` Deepen the tactical depth. Add more specific examples, clearer scene directions, and richer step-by-step explanations without unnecessary fluff.`;
      break;
    case 'shorten':
      instruction += ` Trim all non-essential words. Make every line punchy, rapid-fire, and concise for maximum retention. Cut length by 25-35%.`;
      break;
    case 'tone':
      instruction += ` Adjust the tone to: "${options?.targetTone || 'Conversational & Energetic'}". Modify vocabulary and cadence to match this personality.`;
      break;
    case 'translate':
      instruction += ` Adapt the language to: "${options?.targetLanguage || 'Tanglish'}". For Tanglish, use realistic, vibrant spoken Tamil written in English letters. For Tamil, use contemporary natural Tamil script (தமிழ்).`;
      break;
  }

  if (options?.customInstruction) {
    instruction += `\nADDITIONAL USER INSTRUCTION: ${options.customInstruction}`;
  }

  instruction += `\n\nOutput only the refined content. Do not use '#' or '##'.`;
  return instruction;
}
