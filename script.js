/**
 * AvalonFlow: Kairos Intelligent Voice & UI Controller
 * Comprehensive Master Core Edition (Flicker-Free Optimized)
 * * PATCH VERIFIED: Persistent LLM & Interactive Music State Integration + Option B Full Shuffle
 */

// ==========================================
// DYNAMIC TIME & USER IDENTITY RESOLVER (MIRRORING SCRIPT A)
// ==========================================
function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getUserDisplayName() {
  try {
    // Mirror the exact name synced by Script A into localStorage
    const localData = localStorage.getItem("section2Data");
    if (localData) {
      const savedData = JSON.parse(localData);
      if (savedData.fullName && savedData.fullName.trim() !== "") {
        const rawFirstName = savedData.fullName.trim().split(" ")[0];
        return rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase();
      }
    }
  } catch (e) {
    console.error("Failed to read synced contractor name:", e);
  }
  return "You";
}

function getUserSignature() {
  const name = getUserDisplayName();
  return `◆━ ${name} ━◆`;
}

// Update initial static time on load
document.addEventListener('DOMContentLoaded', () => {
  const initialTimeElem = document.getElementById('initialKairosTime');
  if (initialTimeElem) {
    initialTimeElem.textContent = getCurrentTime();
  }
});


function copyText(btn) {
  const bubble = btn.closest('.chat-bubble');
  if (!bubble) return;

  const textElem = bubble.querySelector('.streaming-text, .user-text, p');
  if (textElem) {
    navigator.clipboard.writeText(textElem.innerText);
  }
}


// ==========================================
// 1. TELEGRAM VISITOR TRACKING CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "8074365555:AAGL7by0c0TJCVutfkPhAZNCXCYopdInn2E";
const TELEGRAM_CHAT_ID = "-1003913850436";

async function sendVisitorDetailsToTelegram() {
  try {
    if (sessionStorage.getItem('visitor_logged_tg')) return;

    const ipResponse = await fetch('https://ipapi.co/json/').catch(() => null);
    const ipData = ipResponse ? await ipResponse.json() : {};

    const payload = {
      device: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      ip: ipData.ip || "Unknown",
      city: ipData.city || "Unknown",
      region: ipData.region || "Unknown",
      country: ipData.country_name || "Unknown",
      isp: ipData.org || "Unknown",
      timestamp: new Date().toLocaleString()
    };

    const messageText = `⚡ *New Visitor Alert | AvalonFlow*\n\n` +
                        `🌐 *IP:* ${payload.ip}\n` + 
                        `📍 *Location:* ${payload.city}, ${payload.region},${payload.country}\n` +
                        `🏢 *ISP:* ${payload.isp}\n` + 
                        `🖥️ *OS/Platform:* ${payload.platform}\n` +
                        `📱 *Device Setup:* ${payload.device}\n` +
                        `📐 *Screen Res:* ${payload.screenResolution}\n` +
                        `📐 *Time:* ${payload.timestamp}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    sessionStorage.setItem('visitor_logged_tg', 'true');
    console.log("🔒 Security telemetry parameters forwarded successfully.");
  } catch (err) {
    console.warn("Telegram telemetry bypass error:", err);
  }
}

// ==========================================
// 2. GLOBAL ENGINE CONFIGURATIONS & STATE
// ==========================================
let kairosSpeechRecognizer = null;
let isKairosListeningActive = false;
let kairosVoiceEngine = window.speechSynthesis;
let selectedFemaleVoice = null;

let voiceSilenceTimer = null;
let gatheredUserCommand = "";
let isProcessingCommand = false;
let activeTypingInterval = null;

let blockNextMicActivation = false; 

// --- LOCAL STORAGE CONTEXT MEMORY KEYS ---
const LLM_HISTORY_KEY = 'kairos_llm_history_v1';
const MUSIC_STATE_KEY = 'avalon_music_state_v1';

// Load LLM Chat History context from LocalStorage
let kairosChatHistory = JSON.parse(localStorage.getItem(LLM_HISTORY_KEY)) || [];
let chatHistory = JSON.parse(localStorage.getItem('tg_chat_history_v2')) || [];
let conversationMemory = []; 

const SILENCE_WAIT_TIME = 10000; 

function saveLLMHistory() {
  if (kairosChatHistory.length > 30) {
    kairosChatHistory = kairosChatHistory.slice(-30); 
  }
  localStorage.setItem(LLM_HISTORY_KEY, JSON.stringify(kairosChatHistory));
}

function getStatusTextElement() {
  return document.getElementById('status-text') || document.getElementById('dockStatusText');
}

function updateStatusDisplay(text) {
  const dockStatusText = document.getElementById('dockStatusText');
  const statusTxt = getStatusTextElement();
  if (dockStatusText) dockStatusText.innerText = text;
  if (statusTxt) statusTxt.innerText = text;
}

const KAIROS_TITLE = "KAIROS INTELLIGENCE"; 
const KAIROS_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=Kairos&backgroundColor=6b2cd8'; 

const personality = {
    tone: "neutral", 
    lastIntent: null,
    userMood: "unknown"
};

let expectingMusicResponse = false; 

// --- SPATIAL AUDIO ARCHITECTURE ---
let spatialAudioCtx = null;
let sourceNodeA = null, sourceNodeB = null;
let pannerNodeA = null, pannerNodeB = null;
let ambientPanAngle = 0;
let ambientPanInterval = null;

function getTranscriptCanvas() {
  return document.getElementById('kairosTranscript') || document.getElementById('transcriptCanvas');
}

// Reusable Copy Button SVG Template
const COPY_BTN_HTML = `
  <button class="copy-btn" onclick="copyText(this)" aria-label="Copy message">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
  </button>
`;

// =================================================================
// 3. DATA STRUCTURES & PREMIUM AUDIO VAULT DIRECTORY
// =================================================================
const quotes = [ 
  "Believe in yourself and all that you are.", "Small steps each day lead to big results.", 
  "Life is about moments, not things.", "Consistency is the key to success.", "Every day is a fresh start.", 
  "Faith is the compass that guides you through life’s storms.", "Pray not just for what you want, but for the strength to receive it.", 
  "Trust God’s timing; He never runs late.", "Your faith can move mountains, but your actions must build the path.", 
  "God doesn’t call the equipped; He equips the called.", "Gratitude turns what we have into enough.", 
  "Serve with love, and blessings will follow silently.", "When you focus on God, life focuses for you"
];

const PREMIUM_AUDIO_VAULT = {
  "Hey there, i'm online how can i help you today?": "assets/audio/vault/greeting_2.mp3",
  "Hello, i'm here ready when you are": "assets/audio/vault/hello_kairos_here.mp3",
  "Hey i'm active what are we working on?": "assets/audio/vault/hey_kairos_active.mp3",
  "Yo! How can I help you today?": "assets/audio/vault/greeting_1.mp3",
  "Sup. What's on your mind?": "assets/audio/vault/greeting_3.mp3",
  "Great to see you! Drop your task here and let's get it done": "assets/audio/vault/greeting_4.mp3",
  "What's the play for today? I'm ready when you are": "assets/audio/vault/greeting_5.mp3",
  "Yo! How can I help make things smoother today?": "assets/audio/vault/greeting_6.mp3",
  "Ready to assist. Please let me know what you need.": "assets/audio/vault/greeting_7.mp3",
  "Hey! What are we diving into today?": "assets/audio/vault/greeting_8.mp3",
  "I couldn't find that track inside the vault directory. Want me to play a random one from the library instead?": "assets/audio/vault_directory.mp3",
  "This is the very first track in the queue": "assets/audio/first_track.mp3",
  "No active queue history to step backward": "assets/audio/activequeue_backward.mp3",
  "No worries. What else can i help you with?": "assets/audio/what_else_can_i_help_you_with.mp3",
  "You've reached the end of the current playlist stream": "assets/audio/playlist_end.mp3",
  "No active queue to skip forward": "assets/audio/activequeue_forward.mp3",
  "No paused track found in the session queue": "assets/audio/no_paused_track.mp3",
  "Resuming track": "assets/audio/music_resume.mp3",
  "There is no music playing right now": "assets/audio/music_paused.mp3",
  "Music paused. Let me know when you want to resume": "assets/audio/music_paused.mp3"
};

const audioLibrary = [
  "assets/audio/a thousand years - Christina Perri.mp3",
  "assets/audio/Rod Wave - 2019 (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Don't Forget (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Pillz & Billz (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Moving On (Official Audio) - RodWave.mp3",
  "assets/audio/Got It Right - Rod Wave.mp3",
  "assets/audio/Rod Wave - By Your Side (Official Video) - RodWave.mp3",
  "assets/audio/Rod Wave - PTSD (Official Music Video) - RodWave.mp3",
  "assets/audio/Rod Wave - Tru Story (Official Music Video) Prod. Gloden.Tae - RodWave.mp3",
  "assets/audio/Rod Wave - Cold December (Official Video) - RodWave.mp3",
  "assets/audio/Rod Wave - The Best (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Jersey Numbers Ft. Rylo Rodriguez (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Just Sing (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - Jupiter's Diary (Official Audio) - RodWave.mp3",
  "assets/audio/Rod Wave - MJ Story (Official Audio) - RodWave.mp3",
  "assets/audio/SoulFly - Rod Wave.mp3",
  "assets/audio/Never Get Over Me - Rod Wave.mp3",
  "assets/audio/Went Thru It - Young Thug.mp3",
  "assets/audio/Last Name - Future.mp3",
  "assets/audio/Long Journey - Rod Wave.mp3",
"assets/audio/Anyone - Justin Bieber.mp3",
"assets/audio/Before You Go - Lewis Capaldi.mp3",
"assets/audio/Favorite Song - Toosii.mp3",
"assets/audio/Florida Boy - Rod Wave.mp3",
"assets/audio/I Am - Rod Wave.mp3",
"assets/audio/Hustle - Rod Wave.mp3",
"assets/audio/If the World Was Ending - JP Saxe.mp3",
"assets/audio/Lost and Insecure - Rod Wave.mp3",
"assets/audio/Kiss Me Interlude - Rod Wave.mp3",
"assets/audio/Look At Me Momma - Rod Wave.mp3",
"assets/audio/Overrated - Rod Wave.mp3",
"assets/audio/Nothing But You - Zoe Wees.mp3",
"assets/audio/Not New To It - Rod Wave.mp3",
"assets/audio/Never Mind - Rod Wave.mp3",
"assets/audio/Sailor Song - Gigi Perez.mp3",
"assets/audio/SNAP - Rosa Linn.mp3",
"assets/audio/Rewrite The Stars - James Arthur.mp3",
"assets/audio/Rest of My Life - Keenan Te.mp3",
"assets/audio/War Wounds - Rod Wave.mp3",
"assets/audio/Venusian - Rod Wave.mp3",
"assets/audio/TP - Rod Wave.mp3",
"assets/audio/The Inspo - Rod Wave.mp3",
"assets/audio/Stay - Rihanna.mp3",
"assets/audio/Piece Of Your Love - Rod Wave.mp3",
"assets/audio/bloodstream - Alyssa Grace.mp3",
"assets/audio/that way - Tate McRae.mp3",
  "assets/audio/Spaceship - Rod Wave.mp3",
  "assets/audio/All I Ever Had - Rod Wave.mp3",
  "assets/audio/2017 (Streamer U) - Rod Wave.mp3",
  "assets/audio/2002 - Anne-Marie.mp3",
  "assets/audio/End of the Road - Rylo Rodriguez.mp3",
  "assets/audio/alright - Gunna.mp3",
  "assets/audio/Keep It G - Rod Wave.mp3",
  "assets/audio/What Happened To Virgil - Lil Durk.mp3",
  "assets/audio/Great Gatsby - Rod Wave.mp3",
  "assets/audio/Psycho - Post Malone.mp3",
  "assets/audio/Nzaza - Asake.mp3",
  "assets/audio/They Want To Be You - Lil Durk.mp3",
  "assets/audio/Love Songs 4 The Streets - Lil Durk.mp3",
  "assets/audio/Hot (feat. Gunna) - Young Thug.mp3",
  "assets/audio/Better Than Ever - YoungBoy Never Broke Again.mp3",
  "assets/audio/Running Up That Hill (A Deal With God) - Kate Bush.mp3",
  "assets/audio/I Look to You - Whitney Houston.mp3",
  "assets/audio/Wonderin' Again - Lil Durk.mp3",
  "assets/audio/Waited 2 Late - Rod Wave.mp3",
  "assets/audio/Project Baby Young Thug - Release.mp3",
  "assets/audio/Circles - Post Malone.mp3",
  "assets/audio/Angel With An Attitude - Rod Wave.mp3",
  "assets/audio/Westside Connection - Rod Wave.mp3",
  "assets/audio/Nobody Gets Me - SZA.mp3",
  "assets/audio/Greatness - Quavo.mp3",
  "assets/audio/time reveals, be careful what you wish for - Gunna.mp3",
  "assets/audio/Deep Depression - Lil Durk.mp3",
  "assets/audio/Cold World (OG) - WyoRecords.mp3",
  "assets/audio/Ghost - Justin Bieber.mp3",
  "assets/audio/Dusk Till Dawn (Radio Edit) - ZAYN.mp3",
  "assets/audio/Daylight - Taylor Swift.mp3",
  "assets/audio/Helplessly - Tatiana Manaois.mp3",
  "assets/audio/I Drink Wine - Adele.mp3",
  "assets/audio/Love You From a Distance - Ashley Kutcher.mp3",
  "assets/audio/Older - Sasha Alex Sloan.mp3",
  "assets/audio/Sunflower (Spider-Man Into the Spider-Verse) - Post Malone.mp3",
  "assets/audio/cardigan - Taylor Swift.mp3",
  "assets/audio/ocean eyes - Billie Eilish.mp3",
  "assets/audio/Better - Rod Wave.mp3",
  "assets/audio/Old Days - Lil Durk.mp3",
  "assets/audio/See You Again (feat. Charlie Puth) - Wiz Khalifa.mp3",
  "assets/audio/Headtaps - Lil Durk.mp3",
  "assets/audio/Feed the Streets - Rod Wave.mp3",
  "assets/audio/Truth In The Lies - Central Cee.mp3",
  "assets/audio/I Love You, I'm Sorry - Gracie Abrams.mp3",
  "assets/audio/Codeine Crazy - Future.mp3",
  "assets/audio/Below Zero - Fridayy.mp3",
  "assets/audio/Don't You Remember - Adele.mp3",
  "assets/audio/Voicemail (feat. Rod Wave) - Tee Grizzley.mp3",
  "assets/audio/Time To Be Free - Kodak Black.mp3",
  "assets/audio/Rod Wave - Passport Junkie (Official Video) - RodWave.mp3",
  "assets/audio/Rod Wave - Leavin (Official Music Video) - RodWave.mp3",
  "assets/audio/Rod Wave - 25 (Official Video) - RodWave.mp3",
  "assets/audio/Straightenin - Migos.mp3",
  "assets/audio/Fck Fame - Rod Wave.mp3",
  "assets/audio/photograph   ed sheeran.mp3",
  "assets/audio/Rod Wave - Even Love Official Audio.mp3",
  "assets/audio/Rod Wave - Call Your Friends (Official Video) - RodWave.mp3",
  "assets/audio/so far ahead ᐳ empire - Gunna.mp3",
  "assets/audio/Just How It Is - Young Thug.mp3",
  "assets/audio/private island - Gunna.mp3",
  "assets/audio/Peepin Out The Window (with Future & Bslime) - Young Thug.mp3",
  "assets/audio/Late Checkout - Lil Durk.mp3",
  "assets/audio/Rod Wave - Already Won ft Lil Durk (Official Video) - RodWave.mp3"
];

let musicQueue = [];
let currentTrackIndex = -1;
let activeDeck = null;
const crossfadeDuration = 10; 

// ==========================================
// OPTION B: FULL SHUFFLE QUEUE LOGIC
// ==========================================
function initializeOptionBQueue(libraryArray, initialTrackFile = null) {
  // Clone the library array to avoid mutating the master list
  let shuffledPool = [...libraryArray];
  
  // Fisher-Yates Shuffle Algorithm for true randomization
  for (let i = shuffledPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
  }

  musicQueue = shuffledPool;

  // If a specific track was requested, place it at the current index, 
  // ensuring the rest of the randomized library loops before/after it.
  if (initialTrackFile) {
    const targetIdx = musicQueue.indexOf(initialTrackFile);
    if (targetIdx !== -1) {
      currentTrackIndex = targetIdx;
    } else {
      currentTrackIndex = 0;
    }
  } else {
    currentTrackIndex = 0;
  }

  saveMusicState();
  console.log("🔀 Option B (Full Shuffle) Queue Initialized. Total tracks:", musicQueue.length);
}

// Persistent Music Engine State Loader & Saver
function saveMusicState() {
  const currentDeck = activeDeck;
  const isPaused = currentDeck ? currentDeck.paused : true;
  const currentTime = currentDeck ? currentDeck.currentTime : 0;

  const state = {
    queue: musicQueue,
    index: currentTrackIndex,
    time: currentTime,
    paused: isPaused
  };

  localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(state));
}

function restoreMusicState() {
  try {
    const savedState = localStorage.getItem(MUSIC_STATE_KEY);
    if (!savedState) return;

    const parsedState = JSON.parse(savedState);
    if (parsedState.queue && parsedState.queue.length > 0) {
      musicQueue = parsedState.queue;
      currentTrackIndex = parsedState.index >= 0 ? parsedState.index : 0;

      const trackFile = musicQueue[currentTrackIndex];
      const deckA = document.getElementById('audioDeckA');
      if (deckA && trackFile) {
        activeDeck = deckA;
        deckA.src = trackFile;
        deckA.currentTime = parsedState.time || 0;
        setupTrackEndMonitor(deckA);

        const trackTitle = formatTrackTitle(trackFile);
        if (!parsedState.paused) {
          updateStatusDisplay(`Playing ${trackTitle}...`);
        } else {
          updateStatusDisplay(`Paused: ${trackTitle}`);
        }
      }
    }
  } catch (e) {
    console.warn("Could not restore music state:", e);
  }
}

// Restore saved transcripts into UI on application start
function restoreSavedTranscripts() {
  const canvas = getTranscriptCanvas();
  if (!canvas || kairosChatHistory.length === 0) return;

  kairosChatHistory.forEach(item => {
    const role = item.role;
    const text = item.parts && item.parts[0] ? item.parts[0].text : "";

    if (!text) return;

    if (role === "user") {
      appendUserMessage(text, false);
    } else if (role === "model") {
      setKairosMessageText(renderMarkdownToHTML(text), false);
    }
  });
}

// ====================================================================
// KAIROS MASTER KNOWLEDGE REGISTRY (FAQ & SYSTEM ABILITIES)
// ====================================================================
const KAIROS_MASTER_KNOWLEDGE = `
You are Kairos, an intuitive, calm, supportive, and knowledgeable AI vocal assistant. The year is 2026. 

Your knowledge base includes the following official operational parameters and FAQs:

1. AVALONCARE VERIFICATION BONDS:
- AvalonCare Lite, AvalonCare Basic, and AvalonCare Premium are designated tiers built for smaller transactions. Each features a distinct "Cycle Rate."
- Cycle Rate Definition: A designated cooling-off period used to safely batch and clear automatic disbursements on a principal guarantee. This ensures funds are completely secured until verification conditions are met.
- AvalonCare Custom: Engineered explicitly for high-value transactions focusing on speed and ultimate security. It utilizes Compliance Verification, where a dedicated regulatory body oversees the safe release of the fund-hold.

2. CORE SUPPORT & ACCOUNT SERVICES FAQ:
- Password Reset: Click "Forgot Password" on the main login screen and follow the automated instructions.
- Billing & Payment Updates: Navigate to the sidebar, click on "Withdrawals", and update payment choices there.
- Technical Issues / Complaints: Generate a ticket under the "Technical" category in the dashboard and describe the error in detail.
- Contact Channels: Create a support ticket and email support directly at avalonflow@usa.com with your unique transaction or ticket reference.
- Support Operating Hours: Active Monday through Sunday, 9:00 AM to 6:00 PM EST.
- Mobile Availability: The Avalonflow app is NOT currently available on iOS or Android devices.
- System Integrations: App integrations are not supported right now but are coming soon.
- Lost References: If a ticket reference is lost, users can generate a new one, but should include any old contextual details when emailing support.
- Notifications: Push alerts can be activated by enabling mobile/browser notifications within account settings.
- Interface Customization: Users can toggle between Dark and Light mode using the toggle button located at the top-right corner of the interface.
- Urgent Escalations: For critical or emergency bugs, users must generate a support ticket, mark it "High Priority", and immediately contact support.

3. INTERACTIVE MEDIA CAPABILITIES:
- You have direct, programmatic control over a crossfading dual-deck, spatial panning media system.
- When users ask to "play [song name]", "pause", "resume", "skip/next", or "go back", you must yield to the script's local media interceptors.
- INTELLIGENT MUSIC CURATION: When a user asks for a mood, genre, or style of music (e.g., "play some chill music", "sad songs", "something upbeat"), scan the available library tracks below and respond with a JSON block in this exact format: \`{"action": "play_track", "filename": "exact_filename_from_library.mp3"}\` followed by a short friendly message.

4. CONTRACTOR GUIDANCE & PROJECT BRIEF (VISUAL SYSTEM DESIGN):
- Independent Contractor Agreement Overview: Commissioned for $8,350.00 USD under a 1-week execution schedule.
- Payment Structure: 100% upfront disbursement processed directly to contractor's preferred payment method (Bank Transfer, PayPal, Mobile Payments, or Cryptocurrency).
- Core Deliverables & Technical Requirements:
  • Icon System & Usage Guide: 4–6 page PDF document defining the core visual design language, geometric rules, rationale behind each icon, and light/dark mode UI mockups.
  • Master Source Files: Fully editable vector source files in .AI / .EPS formats containing system grid assets.
  • Production-Ready Assets: Clean, web-optimized .SVG files for mobile-responsive dashboard implementation.
  • Packaging Constraint: Final deliverable must be packaged into a single .zip archive strictly UNDER 50MB in size.
- Required Icon Visual Rationale (4 Core Icons):
  1. "Safety" Icon: Represents secured funds and guaranteed transactions.
  2. "Sync" Icon: Represents the "Cycle Rate"—the cooling-off period where processes move quietly in the background.
  3. "Compliance" Icon: Represents the "Custom" tier where a human regulatory body oversees the verification process.
  4. "Support" Icon: An inviting visual encouraging users to reach out.
- Brand Aesthetic & Styling Guidelines:
  • Visual Style: Modern, geometric, clean, and warm with human-centric UI elements (subtle ambient purple gradients, soft drop shadows, or translucent glassmorphic layering mirroring platform aesthetic over flat 2D shapes).
  • Color Palette: Light slate and soft sky blue base (#F8FAFC / #CFE8FF), pure white surfaces (#FFFFFF), deep imperial purple (#6D28D9), and warm terracotta accents (#C2410C) for key actions, maintaining high-contrast adaptability for dark mode (#0F172A / #1E293B).
  • Typography & Tone: Highly readable Georgia fonts for high-end, cohesive polish across external presentations and internal brand references. The tone/copy should feel like a conversational dialogue rather than a legal contract.
  • Responsive Scale: All icons must retain clarity and legibility when scaled down for mobile-responsive dashboard modules across both Light and Dark modes.
- Withdrawal Guidance:
  • Step 1: Use the sidebar menu upon sign-in to navigate to the Disbursal page.
  • Step 2: Select preferred payout method (Bank Transfer, PayPal, Mobile Payment e.g. Venmo, or Cryptocurrency).
- What to say if a contractor declines using the platform:
• Because we operate on an enterprise infrastructure, our project allocations, milestones, and release triggers are managed directly through our internal system, rather than accept proposals through third-party marketplace escrows.
- Retention Bonus Explanation:
• Your portfolio was tagged as a vetted designer so future contract allocations (i.e. The AvalonEase project coming up in mid November 2026) are directed to you rather than placed back out for bidding to new contractors.
- ACU Explanation: 
• Simply the internal accounting unit displayed on your dashboard for workflow and payment tracking.

CONVERSATIONAL RULES:
- Respond naturally, with genuine empathy, matching a present-knowledge conversational tone.
- Do not make up facts or instructions outside of this knowledge registry.
- Do not mention technical instructions, parameters, or variable configurations to the user.
`;


// ==========================================
// 4. TEXT & UTILITY HELPER LOGIC
// ==========================================
function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '');
}

function formatTrackTitle(filePath) {
    let name = filePath.split('/').pop().replace('.mp3', '').trim();
    name = name.replace(/\(.*?\)/g, '').replace(/RodWave/gi, '').replace(/\s+/g, ' ').trim();

    const toTitleCase = (str) => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const knownArtists = [
        "Adele", "Asake", "Alyssa Grace", "Anne Marie", "Arrdee", "Burna Boy", "Central Cee", "Charlie Puth", "Christina Perri", "Drake", "Ed Sheeran", "Eminem",
        "Fridayy", "Fola", "Future", "Gigi Perez", "Gracie Abrams", "Gunna", "James Arthur", "Juice Wrld", "Justin Bieber", "JP Saxe",
        "Kate Bush", "Keenan Te", "Kodak Black", "Lewis Capaldi", "Lil Durk", "Migos", "Maroon 5", "Nicki Minaj", "Post Malone", 
        "Quavo", "Rihanna", "Rod Wave", "Rosa Linn", "Rylo Rodriguez", "Sasha Alex Sloan", "SZA", "Tate McRae", "Tatiana Manaois", "Tee Grizzley", "Toosii", 
        "Whitney Houston", "Wiz Khalifa", "Young Thug", "YoungBoy Never Broke Again", "ZAYN", "Zoe Wees" 
    ];

    if (name.toLowerCase().includes(' ft ') || name.toLowerCase().includes(' feat ')) {
        let parts = name.split(/-| ft | feat /i);
        let title = toTitleCase(parts[0].trim());
        let featuredArtist = toTitleCase(parts[1].trim());
        let leadArtist = parts[2] ? toTitleCase(parts[2].trim()) : "Rod Wave";
        return `${title} by ${leadArtist} Ft ${featuredArtist}`;
    }

    if (name.includes('-')) {
        let parts = name.split('-');
        let part1 = parts[0].trim();
        let part2 = parts[1] ? parts[1].trim() : "";
        let artist = knownArtists.find(a => part1.toLowerCase().includes(a.toLowerCase()) || part2.toLowerCase().includes(a.toLowerCase()));

        if (artist) {
            let title = (part1.toLowerCase().includes(artist.toLowerCase())) ? part2 : part1;
            // FIXED: Added space between 'by' and '${toTitleCase(artist)}'
            return `${toTitleCase(title)} by ${toTitleCase(artist)}`;
        }
    }

    return toTitleCase(name);
}


function loadFemaleVoice() {
  if (!kairosVoiceEngine) return;
  const voices = kairosVoiceEngine.getVoices();

  const qualityGoogleVoices = voices.filter(voice => 
    voice.name.includes('Google US English') || 
    voice.name.includes('Google UK English Female') ||
    voice.name.includes('Google UK English')
  );

  if (qualityGoogleVoices.length > 0) {
    selectedFemaleVoice = qualityGoogleVoices[Math.floor(Math.random() * qualityGoogleVoices.length)];
  }

  if (!selectedFemaleVoice) {
    const qualityDesktopVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Natural') || voice.name.includes('Neural') || voice.name.includes('Multilingual')) &&
      (voice.name.includes('Female') || voice.name.includes('Aria') || voice.name.includes('Jenny'))
    );
    if (qualityDesktopVoices.length > 0) {
      selectedFemaleVoice = qualityDesktopVoices[Math.floor(Math.random() * qualityDesktopVoices.length)];
    }
  }

  if (!selectedFemaleVoice) {
    selectedFemaleVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Zira') || voice.name.includes('Samantha') || voice.name.includes('Female'))
    );
  }

  if (!selectedFemaleVoice) {
    selectedFemaleVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
  }
}

if (window.speechSynthesis) {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadFemaleVoice;
  }
  loadFemaleVoice();
}

function renderMarkdownToHTML(text) {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^\*\s+/gm, '• ');
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\n/g, '<br>');
  return formatted;
}

let KAIROS_KEYS = { gemini: "" };

async function loadLocalKeys() {
  try {
    const response = await fetch('keys.txt');
    const text = await response.text();

    const partAMatch = text.match(/PART_A:\s*"(.*?)"/);
    const partBMatch = text.match(/PART_B:\s*"(.*?)"/);

    if (partAMatch && partBMatch) {
      KAIROS_KEYS.gemini = partAMatch[1].trim() + partBMatch[1].trim();
      console.log("🔒 Configuration matrix assembled successfully.");
    }
  } catch (e) {
    console.warn("Unable to load cloud registry configuration.");
  }
}

loadLocalKeys();

// ==========================================
// 5. CORE UI CONTROLLER FUNCTIONS
// ==========================================
function toggleDock(forcedState = null) {
  const dockWrap = document.querySelector('.assistant-dock-wrap') || document.getElementById('dockWrap');
  const collapsedView = document.getElementById('collapsedView');
  const expandedView = document.getElementById('expandedView');

  if (!dockWrap || !collapsedView || !expandedView) return;

  const currentlyExpanded = dockWrap.classList.contains('expanded');
  const targetState = forcedState !== null ? forcedState : !currentlyExpanded;

  if (targetState === currentlyExpanded) return; 

  if (targetState === true) {
    dockWrap.classList.add('expanded');
    setTimeout(() => {
      collapsedView.classList.add('d-none');
      expandedView.classList.remove('d-none');
    }, 150);
  } else {
    stopActiveKairosVoice();
    killSpeechEngineCompletely();

    dockWrap.classList.remove('expanded');
    dockWrap.classList.remove('full-height');
    expandedView.classList.add('d-none');
    collapsedView.classList.remove('d-none');

    isProcessingCommand = false;
    gatheredUserCommand = "";
    if (voiceSilenceTimer) clearTimeout(voiceSilenceTimer);

    const deckA = document.getElementById('audioDeckA');
    const deckB = document.getElementById('audioDeckB');
    const isMusicPlaying = (deckA && !deckA.paused && deckA.src) || (deckB && !deckB.paused && deckB.src);

    if (isMusicPlaying && activeDeck && activeDeck.src) {
      updateStatusDisplay(`Playing ${formatTrackTitle(activeDeck.src)}...`);
    } else {
      updateStatusDisplay(KAIROS_TITLE + "...");
    }

    setTimeout(() => setWaveAnimationSpeed(true), 200); 
  }
}

// ==========================================
// SCRIPT B: CHAT TRANSCRIPT RENDERER (MIRROR ONLY)
// ==========================================

const DEFAULT_AVATAR = 'default-avatar.png';

/**
 * SAFE UI RENDERER: Appends a dedicated user message bubble
 * It reads the profile picture directly from localStorage or the DOM element 
 * managed by Script A, rather than trying to handle file inputs or clicks itself.
 */
function appendUserMessage(text, scroll = true) {
  const canvas = getTranscriptCanvas();
  if (!canvas) return;

  const activeStream = canvas.querySelector('.streaming-text');
  if (activeStream) activeStream.classList.remove('streaming-text');

  // Read the active profile photo synced by Script A
  const savedPhoto = localStorage.getItem('profilePhoto');
  const profilePhotoEl = document.getElementById('profilePhoto');
  const profilePhotoSrc = savedPhoto || (profilePhotoEl ? profilePhotoEl.getAttribute('src') : DEFAULT_AVATAR);

  const userSig = getUserSignature();
  const timeStr = getCurrentTime();

  const msgWrap = document.createElement('div');
  msgWrap.className = 'msgWrap user-wrap';
  msgWrap.innerHTML = `
    <div class="chat-bubble user">
        <div class="chat-bubble-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div class="speaker-label">${userSig}</div>${COPY_BTN_HTML}
        </div>
        <p class="user-text" style="margin: 0; word-break: break-word;">${renderMarkdownToHTML(text)}</p>
        <div class="meta">
            <span class="timestamp">${timeStr}</span>
            <span class="tick seen"></span>
        </div>
    </div>
    <img src="${profilePhotoSrc}" class="chat-bubble-avatar" alt="User Avatar" style="margin-left: 8px;">
  `;
  
  canvas.appendChild(msgWrap);
  if (scroll) canvas.scrollTop = canvas.scrollHeight;
}



// SAFE UI RENDERER: Updates or appends Kairos responses safely
function setKairosMessageText(formattedHtmlText, scroll = true) {
  const canvas = getTranscriptCanvas();
  if (!canvas) return;

  let streamingTextElem = canvas.querySelector('.chat-bubble.kairos .streaming-text');

  if (streamingTextElem) {
    streamingTextElem.innerHTML = formattedHtmlText;
  } else {
    const timeStr = getCurrentTime();
    const msgWrap = document.createElement('div');
    msgWrap.className = 'msgWrap kairos-wrap';
    msgWrap.innerHTML = `
      <img src="${KAIROS_AVATAR}" class="chat-bubble-avatar" alt="Kairos Avatar" style="width: 28px; height: 28px; border-radius: 50%; margin-right: 8px;">
      <div class="chat-bubble kairos">
          <div class="chat-bubble-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <div class="speaker-label" style="font-size: 0.75em; opacity: 0.7;">${KAIROS_TITLE}</div>${COPY_BTN_HTML}
          </div>
          <p class="streaming-text" style="margin: 0; word-break: break-word;">${formattedHtmlText}</p>
          <div class="meta">
              <span class="timestamp">${timeStr}</span>
          </div>
      </div>
    `;
    canvas.appendChild(msgWrap);
  }

  if (scroll) canvas.scrollTop = canvas.scrollHeight;
}

function initializeSpatialEngine() {
  if (spatialAudioCtx) return; 

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    spatialAudioCtx = new AudioContextClass();

    const deckA = document.getElementById('audioDeckA');
    const deckB = document.getElementById('audioDeckB');

    if (deckA) {
      sourceNodeA = spatialAudioCtx.createMediaElementSource(deckA);
      pannerNodeA = spatialAudioCtx.createStereoPanner();
      sourceNodeA.connect(pannerNodeA).connect(spatialAudioCtx.destination);
    }

    if (deckB) {
      sourceNodeB = spatialAudioCtx.createMediaElementSource(deckB);
      pannerNodeB = spatialAudioCtx.createStereoPanner();
      sourceNodeB.connect(pannerNodeB).connect(spatialAudioCtx.destination);
    }

    console.log("🔊 Web Audio spatial routing matrices locked and active.");
    startAmbientAutoPanning();
  } catch (err) {
    console.warn("Spatial context creation skipped or unsupported:", err);
  }
}

function startAmbientAutoPanning() {
  if (ambientPanInterval) clearInterval(ambientPanInterval);

  ambientPanInterval = setInterval(() => {
    if (!spatialAudioCtx) return;

    const deckA = document.getElementById('audioDeckA');
    const deckB = document.getElementById('audioDeckB');
    const isPlaying = (deckA && !deckA.paused) || (deckB && !deckB.paused);

    if (isPlaying && !isProcessingCrossfade) {
      ambientPanAngle += 0.02;
      const panValue = Math.sin(ambientPanAngle) * 0.15; 

      if (activeDeck === deckA && pannerNodeA) pannerNodeA.pan.value = panValue;
      if (activeDeck === deckB && pannerNodeB) pannerNodeB.pan.value = panValue;
    }
  }, 50);
}

/**
 * MASTER ROUTING FRAMEWORK: Handles local media interceptors & streams directly to LLM
 */
async function processUserCommandLocally(commandText) {
  const lowerCommand = commandText.trim().toLowerCase();

  const deckA = document.getElementById('audioDeckA');
  const deckB = document.getElementById('audioDeckB');
  let currentLiveDeck = activeDeck;

  // --- INTERACTIVE MEDIA CONTROLS INTERCEPTORS ---
  if (
      lowerCommand === "pause" || 
      (/\b(pause|stop|halt|freeze|hold)\b/.test(lowerCommand) && /\b(music|audio|song|track|playing|it)\b/.test(lowerCommand))
  ) {
      if (currentLiveDeck && !currentLiveDeck.paused) {
          currentLiveDeck.pause();
          saveMusicState();
          speakResponse("Music paused. Let me know when you want to resume");
          updateStatusDisplay("Music Paused");
      } else {
          speakResponse("There is no music playing right now");
      }
      return;
  }

  if (
      lowerCommand === "resume" || lowerCommand === "continue" || lowerCommand === "unpause" ||
      /\b(resume|continue|unpause)\b/.test(lowerCommand) ||
      (/\b(play|start)\b/.test(lowerCommand) && /\b(again|music|track|song|audio|it)\b/.test(lowerCommand))
  ) {
      if (currentLiveDeck && currentLiveDeck.paused && currentLiveDeck.src) {
          currentLiveDeck.play().catch(err => console.log(err));
          saveMusicState();
          speakResponse("Resuming track");
          updateStatusDisplay(`Playing ${formatTrackTitle(currentLiveDeck.src)}...`);
      } else {
          speakResponse("No paused track found in the session queue");
      }
      return;
  }

  if (
      lowerCommand === "next" || lowerCommand === "skip" ||
      (/\b(skip|next|change|forward)\b/.test(lowerCommand) && /\b(track|song|music|audio|this|one|it)\b/.test(lowerCommand)) ||
      lowerCommand.includes("play something else")
  ) {
      if (musicQueue.length > 0 && currentTrackIndex < musicQueue.length - 1) {
          currentTrackIndex++;
          const nextFile = musicQueue[currentTrackIndex];
          if(deckA) deckA.ontimeupdate = null;
          if(deckB) deckB.ontimeupdate = null;

          botMusicReply(nextFile);
      } else if (musicQueue.length > 0) {
          speakResponse("You've reached the end of the current playlist stream");
      } else {
          speakResponse("No active queue to skip forward");
      }
      return;
  }

  if (
      lowerCommand === "prev" || lowerCommand === "previous" || lowerCommand === "back" ||
      (/\b(prev|previous|back|last)\b/.test(lowerCommand) && /\b(track|song|music|audio|one|it)\b/.test(lowerCommand)) ||
      lowerCommand.includes("go back")
  ) {
      if (musicQueue.length > 0 && currentTrackIndex > 0) {
          currentTrackIndex--;
          const prevFile = musicQueue[currentTrackIndex];
          if(deckA) deckA.ontimeupdate = null;
          if(deckB) deckB.ontimeupdate = null;

          botMusicReply(prevFile);
      } else if (currentTrackIndex === 0) {
          speakResponse("This is the very first track in the queue");
      } else {
          speakResponse("No active queue history to step backward");
      }
      return;
  }

  if (expectingMusicResponse) {
      expectingMusicResponse = false;
      if (/^(yes|yeah|yup|sure|ok|please)\b/.test(lowerCommand)) {
          initializeOptionBQueue(audioLibrary);
          const randomFile = musicQueue[currentTrackIndex];
          botMusicReply(randomFile);
      } else {
          speakResponse("No worries. What else can i help you with?");
      }
      return;
  }

  if (lowerCommand.startsWith("queue ") || lowerCommand.startsWith("add ") || lowerCommand.includes("to queue")) {
    handleYouTubeMusicSearch(lowerCommand, true);
    return;
  }

  if (lowerCommand.startsWith("play ") || lowerCommand.includes("play me") || lowerCommand === "play") {
    const searchTarget = lowerCommand.replace("play me", "").replace("play", "").trim().replace(/[^a-z0-9]/g, "");

    const matchedFile = audioLibrary.find(file => {
        const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanFile.includes(searchTarget) || searchTarget.includes(cleanFile);
    });

    if (matchedFile) {
        // Option B Integration: Initialize full shuffle pool, positioning matched track in deck
        initializeOptionBQueue(audioLibrary, matchedFile);
        botMusicReply(matchedFile);
    } else if (searchTarget === "") {
        // General play / shuffle request
        initializeOptionBQueue(audioLibrary);
        const randomFile = musicQueue[currentTrackIndex];
        botMusicReply(randomFile);
    } else if (lowerCommand.includes("youtube") || lowerCommand.includes("yt") || lowerCommand.includes("stream") || lowerCommand.includes("cloud")) {
        handleYouTubeMusicSearch(lowerCommand, false);
    } else {
        expectingMusicResponse = true;
        speakResponse("I couldn't find that track inside the vault directory. Want me to play a random one from the library instead?");
    }
    return;
  }

  if (/^(hi|hello|hey|yo|wassup|kairos|sup)\b/.test(lowerCommand) && lowerCommand.split(' ').length <= 2) {
    const lines = [
      "Yo! How can I help you today?", 
      "Hey there, i'm online how can i help you today?", 
      "Sup. What's on your mind?"
    ];
    speakResponse(lines[Math.floor(Math.random() * lines.length)]);
    return;
  }

  if (/quote|motivate|inspire/.test(lowerCommand)) {
    const targetQuote = quotes[Math.floor(Math.random() * quotes.length)];
    speakResponse(targetQuote);
    return;
  }

  if (commandText.trim().length === 0) {
    toggleDock(false);
    return;
  }

  // Set typing indicator in chat window while model produces content
  setKairosMessageText("Thinking...");

  const userName = getUserDisplayName();
  
  // Dynamically inject the complete audioLibrary catalog array into the system instructions
  const liveCatalogList = audioLibrary.map(path => `- ${path}`).join('\n');
  const dynamicSystemInstruction = `
${KAIROS_MASTER_KNOWLEDGE}

Live Library Catalog (Direct Array Access):
${liveCatalogList}

The user's name is ${userName}. Address them naturally by name when appropriate.
`;

  // Fallback A: Chrome Gemini Nano
  if (window.ai && window.ai.languageModel) {
    try {
      const caps = await window.ai.languageModel.capabilities();
      if (caps.available !== 'no') {
        const session = await window.ai.languageModel.create({
          systemPrompt: dynamicSystemInstruction + "\nRespond concisely, accurately, and helpful based on the knowledge guidelines."
        });
        const aiReply = await session.prompt(commandText);
        session.destroy();

        kairosChatHistory.push({ role: "user", parts: [{ text: commandText }] });
        kairosChatHistory.push({ role: "model", parts: [{ text: aiReply.trim() }] });
        saveLLMHistory();

        handleLLMResponseOutput(aiReply.trim());
        return;
      }
    } catch (e) {
      console.warn("Local AI dropped out.", e);
    }
  }

  // --- LLM API CALL WITH AUTOMATIC RETRY LOGIC ---
  const GEMINI_API_KEY = KAIROS_KEYS.gemini || "";
  const PRIMARY_MODEL = "gemini-3.1-flash-lite"; 
  const FALLBACK_MODEL = "gemini-3.5-flash";

  async function sendWithRetry(modelName, maxRetries = 2) {
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const requestContents = [...kairosChatHistory, { role: "user", parts: [{ text: commandText }] }];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: requestContents,
            systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
            generationConfig: { maxOutputTokens: 51233 }
          })
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise(res => setTimeout(res, 1000 * (attempt + 1)));
      }
    }
  }

  try {
    const replyText = await sendWithRetry(PRIMARY_MODEL, 2);
    kairosChatHistory.push({ role: "user", parts: [{ text: commandText }] });
    kairosChatHistory.push({ role: "model", parts: [{ text: replyText }] });
    saveLLMHistory();
    handleLLMResponseOutput(replyText);
  } catch (primaryErr) {
    try {
      const replyText = await sendWithRetry(FALLBACK_MODEL, 2);
      kairosChatHistory.push({ role: "user", parts: [{ text: commandText }] });
      kairosChatHistory.push({ role: "model", parts: [{ text: replyText }] });
      saveLLMHistory();
      handleLLMResponseOutput(replyText);
    } catch (fallbackErr) {
      console.error("All retries failed across both models:", fallbackErr);
      speakResponse("I'm having trouble connecting right now. Please check your network and try again.");
    }
  }
}

// --- INTELLIGENT MUSIC ACTION PARSER ---
function handleLLMResponseOutput(responseText) {
  let cleanText = responseText;

  if (responseText.includes('{"action": "play_track"')) {
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      const actionData = JSON.parse(jsonString);

      if (actionData.action === "play_track" && actionData.filename) {
        cleanText = responseText.replace(jsonString, "").trim();
        
        const targetFile = audioLibrary.find(file => file.includes(actionData.filename));
        if (targetFile) {
          initializeOptionBQueue(audioLibrary, targetFile);
          botMusicReply(targetFile);
        }
      }
    } catch (e) {
      console.warn("Failed to parse intelligent music action payload:", e);
    }
  }

  speakResponse(cleanText);
}

// ==========================================
// 7. TEXT-TO-SPEECH VOICE EXECUTION MATRIX (REAL-TIME STEP SYNC)
// ==========================================
function setWaveAnimationSpeed(isSpeaking) {
  const strokes = document.querySelectorAll('.audio-wave-pill .stroke');

  const deckA = document.getElementById('audioDeckA');
  const deckB = document.getElementById('audioDeckB');
  const isMusicPlaying = (deckA && !deckA.paused && deckA.src) || (deckB && !deckB.paused && deckB.src);

  const shouldAnimate = isSpeaking || isMusicPlaying;

  strokes.forEach((stroke) => {
    stroke.style.animationPlayState = shouldAnimate ? 'running' : 'paused';
  });
}

function startSyncedTextAnimation(transcriptCanvas, words, msPerWord) {
  if (activeTypingInterval) clearInterval(activeTypingInterval);

  let wordIndex = 0;

  activeTypingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      const currentSegment = words.slice(0, wordIndex + 1).join(" ");
      setKairosMessageText(renderMarkdownToHTML(currentSegment));
      wordIndex++;
    } else {
      clearInterval(activeTypingInterval);
      activeTypingInterval = null;
    }
  }, msPerWord);
}

async function speakResponse(rawResponseText) {
  stopActiveKairosVoice();
  killSpeechEngineCompletely(); 

  if (activeTypingInterval) {
    clearInterval(activeTypingInterval);
    activeTypingInterval = null;
  }

  const vaultAssetPath = PREMIUM_AUDIO_VAULT[rawResponseText];
  let typedChatText = rawResponseText;

  let spokenText = rawResponseText
    .replace(/-{3,}/g, '')        
    .replace(/[#*`_~]/g, '')       
    .replace(/[^\x00-\x7F]/g, "") 
    .replace(/\s+/g, ' ')         
    .trim();

  if (!vaultAssetPath) {
    if (!/[\.\!\?]$/.test(typedChatText)) {
      typedChatText = typedChatText.replace(/[\.\!\?]+$/, "").trim() + ".";
    }
  }

  conversationMemory.push({ role: "bot", content: typedChatText, time: Date.now() });
  if (conversationMemory.length > 10) conversationMemory.shift();

  chatHistory = chatHistory || [];
  chatHistory.push({ sender: 'bot', text: typedChatText, type: 'text', actualSender: 'kairos' });
  localStorage.setItem('tg_chat_history_v2', JSON.stringify(chatHistory));

  const transcriptCanvas = getTranscriptCanvas();
  if (!transcriptCanvas) return;

  const words = typedChatText.split(" ");

  if (!spokenText) {
    isProcessingCommand = false;
    return;
  }

  // --- VAULT PIPELINE ---
  if (vaultAssetPath) {
    console.log(`🎵 Playing Premium Vault Audio Asset directly: ${vaultAssetPath}`);
    const nativeVaultAudio = new Audio(vaultAssetPath);
    let firedFallback = false; 

    nativeVaultAudio.onplay = () => {
      setWaveAnimationSpeed(true);
      startSyncedTextAnimation(transcriptCanvas, words, 280);
    };

    nativeVaultAudio.onended = () => {
      setWaveAnimationSpeed(false);
      if (activeTypingInterval) clearInterval(activeTypingInterval);

      setKairosMessageText(renderMarkdownToHTML(typedChatText));

      const deckA = document.getElementById('audioDeckA');
      const deckB = document.getElementById('audioDeckB');
      const isMusicPlaying = (deckA && !deckA.paused && deckA.src) || (deckB && !deckB.paused && deckB.src);

      if (blockNextMicActivation || isMusicPlaying) {
        blockNextMicActivation = false;
        return; 
      }
    };

    nativeVaultAudio.onerror = () => {
      if (firedFallback) return;
      firedFallback = true;
      if (activeTypingInterval) clearInterval(activeTypingInterval);
      fallbackSynthesisExecution(spokenText, typedChatText, transcriptCanvas);
    };

    await nativeVaultAudio.play().catch(() => {
      if (firedFallback) return;
      firedFallback = true;
      if (activeTypingInterval) clearInterval(activeTypingInterval);
      fallbackSynthesisExecution(spokenText, typedChatText, transcriptCanvas);
    });
    return;
  }

  fallbackSynthesisExecution(spokenText, typedChatText, transcriptCanvas);
}

function fallbackSynthesisExecution(spokenText, typedChatText, transcriptCanvas) {
  if (activeTypingInterval) clearInterval(activeTypingInterval);
  if (kairosVoiceEngine) kairosVoiceEngine.cancel(); 

  const utterance = new SpeechSynthesisUtterance(spokenText);
  if (selectedFemaleVoice) utterance.voice = selectedFemaleVoice;

  const speechRate = 1.05; 
  utterance.rate = speechRate; 

  const words = typedChatText.split(" ");
  const msPerWord = (60000 / 195) / speechRate; 

  utterance.onstart = () => {
    setWaveAnimationSpeed(true);
    startSyncedTextAnimation(transcriptCanvas, words, msPerWord);
  };

  utterance.onend = () => {
    setWaveAnimationSpeed(false);
    if (activeTypingInterval) clearInterval(activeTypingInterval);

    setKairosMessageText(renderMarkdownToHTML(typedChatText));

    const deckA = document.getElementById('audioDeckA');
    const deckB = document.getElementById('audioDeckB');
    const isMusicPlaying = (deckA && !deckA.paused && deckA.src) || (deckB && !deckB.paused && deckB.src);

    if (blockNextMicActivation || isMusicPlaying) {
      blockNextMicActivation = false;
      return;
    }
  };

  utterance.onerror = () => {
    setWaveAnimationSpeed(false);
    if (activeTypingInterval) clearInterval(activeTypingInterval);
  };

  kairosVoiceEngine.speak(utterance);
}

// ==========================================
// 8. MULTI-DECK CROSSFADE ENGINE
// ==========================================
function botMusicReply(file) {
    const trackTitle = formatTrackTitle(file);

    updateStatusDisplay(`Playing ${trackTitle}...`);

    const deckA = document.getElementById('audioDeckA');
    const deckB = document.getElementById('audioDeckB');
    if (!deckA || !deckB) return;

    blockNextMicActivation = true; 

    let primaryDeck = activeDeck === deckA ? deckB : deckA;
    let secondaryDeck = activeDeck === deckA ? deckA : deckB;

    if (!activeDeck) {
        activeDeck = deckA;
        activeDeck.src = file;
        activeDeck.volume = 1;
        activeDeck.load();
        activeDeck.play().then(() => saveMusicState()).catch(err => console.log(err));
        setupTrackEndMonitor(activeDeck);
    } else {
        executeCrossfade(secondaryDeck, primaryDeck, file);
    }
}

let isProcessingCrossfade = false; 

function executeCrossfade(currentDeck, nextDeck, nextFile) {
    initializeSpatialEngine(); 
    if (spatialAudioCtx && spatialAudioCtx.state === 'suspended') {
      spatialAudioCtx.resume();
    }

    isProcessingCrossfade = true;

    currentDeck.onended = null;
    currentDeck.ontimeupdate = null;
    nextDeck.onended = null;
    nextDeck.ontimeupdate = null;

    nextDeck.src = nextFile;
    nextDeck.volume = 0;
    nextDeck.load();

    const deckA = document.getElementById('audioDeckA');
    const outPanner = (currentDeck === deckA) ? pannerNodeA : pannerNodeB;
    const inPanner = (nextDeck === deckA) ? pannerNodeA : pannerNodeB;

    if (outPanner) outPanner.pan.value = 0;   
    if (inPanner) inPanner.pan.value = 1.0;   

    nextDeck.play().then(() => {
        setupTrackEndMonitor(nextDeck);
        saveMusicState();
    }).catch(err => console.log("Crossfade play error:", err));

    activeDeck = nextDeck;

    const fadeSteps = 50; 
    const intervalTime = (crossfadeDuration * 1000) / fadeSteps; 
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
        currentStep++;
        let progress = currentStep / fadeSteps;
        let currentVol = 1 - progress;
        let nextVol = progress;

        currentDeck.volume = Math.max(0, Math.min(1, currentVol));
        nextDeck.volume = Math.max(0, Math.min(1, nextVol));

        if (outPanner) outPanner.pan.value = -progress; 
        if (inPanner) inPanner.pan.value = 1.0 - progress; 

        if (currentStep >= fadeSteps) {
            clearInterval(fadeInterval);
            currentDeck.pause();
            currentDeck.src = ""; 

            if (outPanner) outPanner.pan.value = 0;
            if (inPanner) inPanner.pan.value = 0;

            isProcessingCrossfade = false; 
            console.log("Crossfade complete. Expired deck wiped cleanly.");
        }
    }, intervalTime);
}

function setupTrackEndMonitor(audioDeck) {
    if (!audioDeck) return;

    audioDeck.onended = null; 
    audioDeck.ontimeupdate = null;

    audioDeck.ontimeupdate = () => {
        if (!audioDeck.duration || audioDeck.duration === 0) return;

        saveMusicState();

        const timeRemaining = audioDeck.duration - audioDeck.currentTime;

        if (timeRemaining <= crossfadeDuration) {
            audioDeck.ontimeupdate = null;

            if (musicQueue.length > 0 && currentTrackIndex < musicQueue.length - 1) {
                currentTrackIndex++;
                const nextFile = musicQueue[currentTrackIndex];
                let trackTitle = formatTrackTitle(nextFile);

                updateStatusDisplay(`Next Up: ${trackTitle}...`);

                blockNextMicActivation = true; 

                const deckA = document.getElementById('audioDeckA');
                const deckB = document.getElementById('audioDeckB');
                let primaryDeck = activeDeck === deckA ? deckB : deckA;
                let secondaryDeck = activeDeck === deckA ? deckA : deckB;

                executeCrossfade(secondaryDeck, primaryDeck, nextFile);
                setTimeout(() => setWaveAnimationSpeed(true), 200); 
            } else if (musicQueue.length > 0 && currentTrackIndex >= musicQueue.length - 1) {
                // Option B Continuous Full Loop: Reshuffle and restart seamlessly
                console.log("🔄 Playlist stream ended. Reshuffling full library deck for continuous loop.");
                initializeOptionBQueue(audioLibrary);
                const nextFile = musicQueue[currentTrackIndex];
                let trackTitle = formatTrackTitle(nextFile);

                updateStatusDisplay(`Looping: ${trackTitle}...`);
                blockNextMicActivation = true;

                const deckA = document.getElementById('audioDeckA');
                const deckB = document.getElementById('audioDeckB');
                let primaryDeck = activeDeck === deckA ? deckB : deckA;
                let secondaryDeck = activeDeck === deckA ? deckA : deckB;

                executeCrossfade(secondaryDeck, primaryDeck, nextFile);
                setTimeout(() => setWaveAnimationSpeed(true), 200);
            } else {
                audioDeck.onended = () => {
                    setWaveAnimationSpeed(false);
                    blockNextMicActivation = false; 
                    saveMusicState();
                    updateStatusDisplay(KAIROS_TITLE + "...");
                };
            }
        }
    };
}


// ==========================================
// 9. HARDWARE VOICE RECOGNITION
// ==========================================
function killSpeechEngineCompletely() {
  isKairosListeningActive = false;
  if (kairosSpeechRecognizer) {
    try {
      kairosSpeechRecognizer.onresult = null;
      kairosSpeechRecognizer.onend = null;
      kairosSpeechRecognizer.onerror = null;
      kairosSpeechRecognizer.stop();
    } catch (e) {}
    kairosSpeechRecognizer = null;
  }
  updateSpeakingIndicator(false);
  console.log("🔒 Microphone hardware turned completely OFF.");
}

function activateKairosVoiceOnDemand() {
  if (isProcessingCommand || (kairosVoiceEngine && kairosVoiceEngine.speaking)) return;

  stopActiveKairosVoice();
  killSpeechEngineCompletely();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  updateStatusDisplay("Kairos is listening...");

  toggleDock(true);

  if (navigator.vibrate) navigator.vibrate(40);

  const micBtn = document.getElementById('dockMicBtn');
  if (micBtn) micBtn.classList.add('recording');

  kairosSpeechRecognizer = new SpeechRecognition();
  kairosSpeechRecognizer.continuous = true;
  kairosSpeechRecognizer.interimResults = true; 
  kairosSpeechRecognizer.lang = 'en-US';

  kairosSpeechRecognizer.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const dockInput = document.getElementById('dockInput');
    const currentSpokenText = finalTranscript || interimTranscript;
    if (dockInput && currentSpokenText.trim().length > 0) {
      dockInput.value = currentSpokenText.trim();
      dockInput.style.height = 'auto';
      dockInput.style.height = dockInput.scrollHeight + 'px';
      updateSpeakingIndicator(true);
    }

    if (finalTranscript.trim().length > 0) {
      gatheredUserCommand = finalTranscript.trim();
    }

    resetSilenceTimer(SILENCE_WAIT_TIME);
  };

  kairosSpeechRecognizer.onerror = (err) => {
    if (err.error === 'not-allowed' || err.error === 'no-speech') {
      updateStatusDisplay("Mic access closed.");
      if (micBtn) micBtn.classList.remove('recording');
      isProcessingCommand = false;
      updateSpeakingIndicator(false);

      const deckA = document.getElementById('audioDeckA');
      const deckB = document.getElementById('audioDeckB');
      const isMusicPlaying = (deckA && !deckA.paused && deckA.src) || (deckB && !deckB.paused && deckB.src);
      if (!isMusicPlaying) {
        toggleDock(false); 
      }
    }
  };

  kairosSpeechRecognizer.onend = () => {
    if (micBtn) micBtn.classList.remove('recording');
    updateSpeakingIndicator(false);
  };

  function resetSilenceTimer(customWaitTime = 10000) {
    if (voiceSilenceTimer) clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = setTimeout(() => {
      if (micBtn) micBtn.classList.remove('recording');
      killSpeechEngineCompletely();
      updateSpeakingIndicator(false);
      console.log("Speech captured and populated in input box. Waiting for manual send.");
    }, customWaitTime);
  }

  resetSilenceTimer(SILENCE_WAIT_TIME); 

  try {
    isKairosListeningActive = true;
    kairosSpeechRecognizer.start();
  } catch (e) {
    console.error(e);
    if (micBtn) micBtn.classList.remove('recording');
    updateSpeakingIndicator(false);
  }
}

function stopActiveKairosVoice() {
  if (kairosVoiceEngine) kairosVoiceEngine.cancel();
  setWaveAnimationSpeed(false);
}

// ==========================================
// 10. INITIALIZATION, EVENT LOOPS & DOCK CONTROLLERS
// ==========================================
function wakeUpKairosWithGreeting() {
  const dockWrap = document.querySelector('.assistant-dock-wrap') || document.getElementById('dockWrap');
  const isExpanded = dockWrap ? dockWrap.classList.contains('expanded') : false;

  if (isExpanded) {
    toggleDock(false);
    return;
  }

  toggleDock(true);

  const userName = getUserDisplayName();
  const displayName = userName !== "You" ? ` ${userName}` : "";

  const greetings = [
    `Hey${displayName}, i'm online how can i help you today?`,
    `Hello${displayName}, i'm here ready when you are.`,
    `Hey${displayName} i'm active what are we working on?`,
    `Yo${displayName}! How can I help you today?`,
    `Sup${displayName}. What's on your mind?`,
    `Great to see you${displayName}! Drop your task here and let's get it done.`,
    `What's the play for today${displayName}? I'm ready when you are.`,
    `Yo${displayName}! How can I help make things smoother today?`,
    `Ready to assist${displayName}. Please let me know what you need.`,
    `Hey${displayName}! What are we diving into today?`
  ];

  const greetingText = greetings[Math.floor(Math.random() * greetings.length)];

  stopActiveKairosVoice();
  killSpeechEngineCompletely();

  speakResponse(greetingText);
}


// Main Send Routine for Input Box
function sendMessage() {
  const dockInput = document.getElementById('dockInput');
  if (!dockInput) return;

  const text = dockInput.value.trim();
  if (!text) return;

  console.log('Sending message:', text);

  appendUserMessage(text);

  conversationMemory.push({ role: "user", content: text, time: Date.now() });
  chatHistory = chatHistory || [];
  chatHistory.push({ sender: 'user', text: text, type: "text" });
  localStorage.setItem('tg_chat_history_v2', JSON.stringify(chatHistory));

  processUserCommandLocally(text);

  dockInput.value = '';
  dockInput.style.height = 'auto';
  dockInput.style.overflowY = 'hidden';
}

// ==========================================
// DYNAMIC USER TYPING & SPEAKING INDICATORS
// ==========================================
let typingTimeout;
let typingIndicatorEl = null;

const botInput = document.getElementById("dockInput");
const botMessagesContainer = document.getElementById("transcriptCanvas");

if (botInput) {
    botInput.addEventListener("input", () => {
        const currentUserName = getUserDisplayName(); 
        if (!typingIndicatorEl) {
            typingIndicatorEl = document.createElement("div");
            typingIndicatorEl.className = "ambient";
            typingIndicatorEl.textContent = `${currentUserName} is typing...`;
            if (botMessagesContainer) botMessagesContainer.appendChild(typingIndicatorEl);
        }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            if(typingIndicatorEl) { typingIndicatorEl.remove(); typingIndicatorEl = null; }
        }, 1200);
    });
}

let speakingIndicatorEl = null;

function updateSpeakingIndicator(isSpeaking) {
    const currentUserName = getUserDisplayName();
    const container = getTranscriptCanvas();
    if (!container) return;

    if (isSpeaking) {
        if (!speakingIndicatorEl) {
            speakingIndicatorEl = document.createElement("div");
            speakingIndicatorEl.className = "ambient";
            speakingIndicatorEl.style.color = "var(--gemini-cyan)";
            speakingIndicatorEl.textContent = `${currentUserName} is speaking...`;
            container.appendChild(speakingIndicatorEl);
        }
    } else {
        if (speakingIndicatorEl) {
            speakingIndicatorEl.remove();
            speakingIndicatorEl = null;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
  sendVisitorDetailsToTelegram();
  restoreSavedTranscripts();
  restoreMusicState();

  const dockWrap = document.getElementById('dockWrap') || document.querySelector('.assistant-dock-wrap');
  const collapsedView = document.getElementById('collapsedView');
  const closeDockBtn = document.getElementById('closeDockBtn');
  const expandToggleBtn = document.getElementById('expandToggleBtn');
  const dockInput = document.getElementById('dockInput');
  const dockSendBtn = document.getElementById('dockSendBtn');
  const dockMicBtn = document.getElementById('dockMicBtn');

  if (collapsedView) {
    collapsedView.addEventListener('click', (e) => {
      e.stopPropagation();
      initializeSpatialEngine(); 
      wakeUpKairosWithGreeting();
    });
  }

  if (closeDockBtn) {
    closeDockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDock(false);
    });
  }

  if (expandToggleBtn && dockWrap) {
    expandToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dockWrap.classList.toggle('full-height');
    });
  }

  if (dockMicBtn) {
    dockMicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      initializeSpatialEngine();
      activateKairosVoiceOnDemand();
    });
  }

  if (dockInput) {
    dockInput.addEventListener('input', function () {
      this.style.height = 'auto';
      const nextHeight = this.scrollHeight;
      this.style.height = nextHeight + 'px';

      if (nextHeight >= 120) {
        this.style.overflowY = 'auto';
      } else {
        this.style.overflowY = 'hidden';
      }
    });

    dockInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
          return;
        } else {
          if (e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }
      }
    });
  }

  if (dockSendBtn) {
    dockSendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sendMessage();
    });
  }
});
