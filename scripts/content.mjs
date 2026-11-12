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
  // Demo meals for the "try it" panel. Example numbers, not nutrition advice.
  demo: [
    { id: 'bowl', label: 'Chicken, rice & broccoli bowl', input: 'Chicken, rice and broccoli bowl', kcal: 620, protein: 48, carbs: 70, fat: 14, confidence: 'High' },
    { id: 'yoghurt', label: 'Greek yoghurt, berries & granola', input: 'Greek yoghurt with berries and granola', kcal: 380, protein: 22, carbs: 48, fat: 11, confidence: 'High' },
    { id: 'toast', label: 'Two eggs on toast', input: 'Two eggs on toast', kcal: 380, protein: 20, carbs: 30, fat: 19, confidence: 'Medium' },
  ],
  features: [
    { icon: 'camera', title: 'Snap, say or type', text: 'Photo, voice, text, barcode or manual. AI estimates calories, protein, carbs and fat, and shows how sure it is.', size: 'wide' },
    { icon: 'mic', title: 'Voice stays on your phone', text: 'Speech is transcribed on-device with Whisper. Your recording never leaves the phone.' },
    { icon: 'review', title: 'You have the final say', text: 'Every estimate goes through a review screen. Unknown values stay blank, never zero.' },
    { icon: 'barcode', title: 'Food search, made for NZ', text: 'Cited servings for New Zealand products and restaurants, plus USDA and Open Food Facts. Barcodes decode on-device.', size: 'tall', stat: 469, statLabel: 'cited NZ servings' },
    { icon: 'flame', title: 'Streaks with freezes', text: 'Consistency over perfection. A freeze covers the day you couldn’t log.' },
    { icon: 'users', title: 'Friends, if you want', text: 'Cheer each other on. Friends see your streak, never your meals, weight or photos.' },
    { icon: 'widget', title: 'Home-screen widgets', text: 'On Android: a streak counter and one-tap shortcuts to capture, scan or dictate.' },
    { icon: 'shield', title: 'Your data, your call', text: 'No ads and no tracking. Export your journal or delete your account from Settings.', size: 'xwide' },
  ],
  privacy: [
    'Voice is transcribed on your phone. Recordings never leave it.',
    'Photos are sent for an estimate only when you ask, and aren’t stored on our servers.',
    'No ads, no analytics SDK, no tracking.',
    'Friends see your streak, never your meals, weight or photos.',
    'Delete your account and its data from Settings.',
  ],
  platforms: [
    { icon: 'phone', name: 'Android', status: 'In testing', tone: 'live', text: 'Version 1.2.10 is in closed testing on Google Play. Ask to join and we’ll add you.' },
    { icon: 'phone', name: 'iPhone', status: 'In preparation', tone: 'soon', text: 'The iOS app is built from the same codebase, with Sign in with Apple and on-device voice.' },
    { icon: 'spark', name: 'Haste 1.3', status: 'In development', tone: 'next', text: 'The next major update moves accounts and sync onto a single new backend.' },
  ],
  faq: [
    ['How do I get Haste?', 'Haste is in closed testing on Google Play. Email us from a Google account and we’ll add you to the tester list. The iPhone version is in preparation.'],
    ['Does it cost anything?', 'Haste is free while it’s in testing. There are no ads.'],
    ['How accurate are the AI estimates?', 'They’re estimates, and they can be wrong. Haste shows its confidence and asks you to review portions and values before saving. Use a label or a database entry when you have one. Haste is not a medical device.'],
    ['Where is my journal stored?', 'Meals are saved on your phone first, then synced privately to your account. Voice is transcribed on the device. Photos are sent for an AI estimate only when you choose to.'],
    ['Does my voice get uploaded?', 'No. Haste turns speech into text on your phone with an on-device model. Only the text is used for an estimate.'],
    ['How do I delete my account?', 'Use Delete account in Settings. The account deletion page explains what is removed.'],
  ],
};

export const principles = [
  ['lock', 'Private by default', 'No ads, no trackers, no analytics on this site. Voice stays on the device. Data leaves your phone only when a feature needs it.'],
  ['bolt', 'Fast is a feature', 'If logging a meal takes longer than eating it, people stop. Every screen is designed around the fewest taps.'],
  ['review', 'Honest about what’s ready', 'Testing means testing. Estimates are shown as estimates. Nothing is promised before it works.'],
];

// Primary navigation: separate pages, no in-page jumps.
export const nav = [['Haste', '/haste/'], ['About', '/about/'], ['Contact', '/contact/']];
export const hasteNav = [['Overview', '/haste/'], ['Get Haste', '/haste/get/'], ['Support', '/haste/support/']];

export const pages = [
  ['Home', '/'], ['Haste', '/haste/'], ['Get Haste', '/haste/get/'], ['Haste support', '/haste/support/'],
  ['About', '/about/'], ['Contact', '/contact/'], ['Release details', '/releases/'], ['Website privacy', '/privacy/'],
];
