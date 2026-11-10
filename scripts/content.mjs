// Every product claim on the website lives here. Keep it in step with the Haste
// repository's docs/STATUS.md and docs/APP_STORE_LISTING.md.
export const studio = {
  name: 'Kokonut',
  email: 'admin@kokonut.cc',
  github: 'https://github.com/Tydooloo/kokonut',
  url: 'https://kokonut.cc',
};

export const haste = {
  version: '1.2.10',
  tagline: 'Log a meal in the time it takes to say it.',
  description: 'Snap a photo, say it out loud or type it. Haste estimates calories and macros, you check the numbers, and your streak keeps going.',
  privacyPolicy: 'https://ntrvcwjtaccydacehjfn.supabase.co/functions/v1/haste-api/privacy',
  deleteAccount: 'https://ntrvcwjtaccydacehjfn.supabase.co/functions/v1/haste-api/delete-account',
  betaMail: 'mailto:admin@kokonut.cc?subject=Haste%20beta',
  supportMail: 'mailto:admin@kokonut.cc?subject=Haste%20support',
  // Real app screens rendered with synthetic demo data (Haste docs/screens).
  screens: [
    { id: 'capture', label: 'Capture', title: 'Snap, say or type.', text: 'One capture screen for photos, voice, text, barcodes and manual entry. Pick whatever is quickest right now.' },
    { id: 'journal', label: 'Journal', title: 'Your day at a glance.', text: 'Calories and macros add up as you go. Edit a meal, repeat a favourite, or jump to any day on the calendar.' },
    { id: 'progress', label: 'Progress', title: 'Trends, not guilt.', text: 'Weigh-ins, weekly and monthly trends and a streak that rewards showing up, with freezes for the days life gets in the way.' },
  ],
  features: [
    { icon: 'camera', title: 'Snap, say or type', text: 'Photo, voice, text, barcode or manual. AI estimates calories, protein, carbs and fat, and shows how sure it is.', size: 'wide' },
    { icon: 'mic', title: 'Voice stays on your phone', text: 'Speech is transcribed on-device with Whisper. Your recording never leaves the phone.' },
    { icon: 'review', title: 'You have the final say', text: 'Every estimate goes through a review screen. Unknown values stay blank, never zero.' },
    { icon: 'barcode', title: 'Food search, made for NZ', text: 'Cited servings for New Zealand products and restaurants, plus USDA and Open Food Facts. Barcodes decode on-device.', size: 'tall', stat: 469, statLabel: 'cited NZ servings' },
    { icon: 'flame', title: 'Streaks with freezes', text: 'Consistency over perfection. A freeze covers the day you couldn’t log.' },
    { icon: 'users', title: 'Friends, if you want', text: 'Cheer each other on. Friends see your streak, never your meals, weight or photos.' },
    { icon: 'shield', title: 'Your data, your call', text: 'No ads and no tracking. Export your journal or delete your account from Settings.', size: 'xwide' },
    { icon: 'widget', title: 'Home-screen widgets', text: 'On Android: a streak counter and one-tap shortcuts to capture, scan or dictate.' },
  ],
  platforms: [
    { icon: 'phone', name: 'Android', status: 'In testing', tone: 'live', text: `Version 1.2.10 is in closed testing on Google Play. Ask to join and we’ll add you.` },
    { icon: 'phone', name: 'iPhone', status: 'In preparation', tone: 'soon', text: 'The iOS app is built from the same codebase, with Sign in with Apple and on-device voice.' },
    { icon: 'spark', name: 'Haste 1.3', status: 'In development', tone: 'next', text: 'The next major update moves accounts and sync onto a single new backend.' },
  ],
  faq: [
    ['How do I get Haste?', 'Haste is in closed testing on Google Play. Email us from a Google account and we’ll add you to the tester list. The iPhone version is in preparation.'],
    ['Does it cost anything?', 'Haste is free while it’s in testing. There are no ads.'],
    ['How accurate are the AI estimates?', 'They’re estimates, and they can be wrong. Haste shows its confidence and asks you to review portions and values before saving. Use a label or a database entry when you have one. Haste is not a medical device.'],
    ['Where is my journal stored?', 'Meals are saved on your phone first, then synced privately to your account. Voice is transcribed on the device. Photos are sent for an AI estimate only when you choose to.'],
    ['How do I delete my account?', 'Use Delete account in Settings. The account deletion page explains what is removed.'],
  ],
};

export const pedal = {
  tagline: 'Your plug-ins. On the floor.',
  description: 'A concept for a stompbox that runs your Windows VST plug-ins, so the sound you dialled in at the desk comes to the gig without a laptop.',
  questions: [
    { icon: 'timer', title: 'Latency', text: 'A guitarist feels delay long before they hear it. The whole chain needs a latency budget measured in single-digit milliseconds.' },
    { icon: 'cpu', title: 'Hosting', text: 'Running Windows plug-ins means running Windows, or something compatible, inside a pedal. That shapes the processor, cooling and power.' },
    { icon: 'plug', title: 'Plug-in licensing', text: 'Many plug-ins are activated per machine or online. The pedal has to respect that without becoming a chore.' },
    { icon: 'stage', title: 'Stage-proof', text: 'Boots fast, survives a kick, reads in the dark and never needs a mouse. A stage is not a studio.' },
  ],
  roadmap: [
    ['01', 'Concept', 'Define the idea, the player and the questions worth answering.', true],
    ['02', 'Feasibility', 'Measure latency and plug-in hosting on candidate hardware.', false],
    ['03', 'Prototype', 'A working bench prototype with real controls.', false],
    ['04', 'On stage', 'Field testing with players in real rigs.', false],
  ],
};

export const pages = [
  ['Home', '/'], ['Haste', '/haste/'], ['VST Pedal', '/pedal/'],
  ['Release details', '/releases/'], ['Website privacy', '/privacy/'],
];
