// Every claim and link on the website lives here.
// Haste copy follows the Haste repository's docs/APP_STORE_LISTING.md; Burble follows
// Burble's docs/PRODUCT.md; Cairn follows the public pitch in Cairn's README.
export const studio = {
  name: 'Kokonut',
  email: 'admin@kokonut.cc',
  github: 'https://github.com/Tydooloo',
  url: 'https://kokonut.cc',
};

// Store and web-app destinations. The App Store IDs are placeholders until the
// listings are live: replace them here and rebuild.
export const links = {
  hasteIos: 'https://apps.apple.com/app/id0000000000',
  hasteAndroid: 'https://play.google.com/store/apps/details?id=com.kokonut.haste',
  burbleIos: 'https://apps.apple.com/app/id0000000001',
  burbleAndroid: 'https://play.google.com/store/apps/details?id=com.kokonut.burble',
  burbleWeb: 'https://burble.kokonut.cc',
  cairnWaitlist: 'mailto:admin@kokonut.cc?subject=Cairn%20waitlist&body=Add%20me%20to%20the%20Cairn%20waitlist.%20I%20play%3A%20',
};

export const haste = {
  name: 'Haste',
  tagline: 'AI calorie tracker',
  description: 'Snap a photo, say it out loud or type it. Haste estimates calories and macros, you check the numbers, and your streak keeps going. Free on iPhone and Android.',
  privacyPolicy: 'https://ntrvcwjtaccydacehjfn.supabase.co/functions/v1/haste-api/privacy',
  deleteAccount: 'https://ntrvcwjtaccydacehjfn.supabase.co/functions/v1/haste-api/delete-account',
  supportMail: 'mailto:admin@kokonut.cc?subject=Haste%20support',
  // Real app screens rendered with sample data (Haste docs/screens).
  screens: [
    { id: 'capture', label: 'Capture', title: 'Snap, say|or *type.*', text: 'One screen for photos, voice, text and barcodes. Pick whatever is quickest right now and Haste does the sums.' },
    { id: 'journal', label: 'Journal', title: 'Your day|at a *glance.*', text: 'Calories and macros add up as you go. Edit a meal, repeat a favourite, or jump to any day on the calendar.' },
    { id: 'progress', label: 'Progress', title: 'Trends,|not *guilt.*', text: 'Weigh-ins, weekly and monthly trends, and a streak that rewards showing up, with freezes for the days life gets in the way.' },
  ],
  // Demo meals for the "try it" panel. Example numbers, not nutrition advice.
  demo: [
    { id: 'bowl', label: 'Chicken, rice & broccoli bowl', input: 'Chicken, rice and broccoli bowl', kcal: 620, protein: 48, carbs: 70, fat: 14, confidence: 'High' },
    { id: 'yoghurt', label: 'Greek yoghurt, berries & granola', input: 'Greek yoghurt with berries and granola', kcal: 380, protein: 22, carbs: 48, fat: 11, confidence: 'High' },
    { id: 'toast', label: 'Two eggs on toast', input: 'Two eggs on toast', kcal: 380, protein: 20, carbs: 30, fat: 19, confidence: 'Medium' },
  ],
  features: [
    { icon: 'camera', title: 'Snap, say or type', text: 'Photo, voice, text, barcode or manual. AI estimates calories, protein, carbs and fat, and shows how sure it is.', size: 'wide' },
    { icon: 'mic', title: 'Voice stays on your phone', text: 'Speech is transcribed on-device. Your recording never leaves the phone.' },
    { icon: 'review', title: 'You have the final say', text: 'Every estimate goes through a review screen. Unknown values stay blank, never zero.' },
    { icon: 'barcode', title: 'Food search, made for NZ', text: 'Cited servings for New Zealand products and restaurants, plus USDA and Open Food Facts. Barcodes decode on-device.', size: 'tall', stat: 469, statLabel: 'cited NZ servings' },
    { icon: 'flame', title: 'Streaks with freezes', text: 'Consistency over perfection. A freeze covers the day you couldn’t log.' },
    { icon: 'users', title: 'Friends, if you want', text: 'Cheer each other on. Friends see your streak, never your meals, weight or photos.' },
    { icon: 'widget', title: 'Home-screen widgets', text: 'On Android: a streak counter and one-tap shortcuts to capture, scan or dictate.' },
    { icon: 'shield', title: 'Your data, your call', text: 'No ads and no tracking. Export your journal or delete your account from Settings.', size: 'wide' },
  ],
  privacy: [
    'Voice is transcribed on your phone. Recordings never leave it.',
    'Photos are sent for an estimate only when you ask, and aren’t stored on our servers.',
    'No ads, no analytics SDK, no tracking.',
    'Friends see your streak, never your meals, weight or photos.',
    'Export everything, or delete your account, from Settings.',
  ],
  faq: [
    ['Where can I get Haste?', 'Haste is on the App Store for iPhone and on Google Play for Android. Sign in with Apple, Google or email and your journal follows you between phones.'],
    ['Does it cost anything?', 'Haste is free to download, and there are no ads.'],
    ['How accurate are the AI estimates?', 'They’re estimates, and they can be wrong. Haste shows its confidence and asks you to review portions and values before saving. Use a label or a database entry when you have one. Haste is for adults and is not a medical device.'],
    ['Where is my journal stored?', 'Meals are saved on your phone first, then synced privately to your account. Voice is transcribed on the device. Photos are sent for an AI estimate only when you choose to.'],
    ['Does my voice get uploaded?', 'No. Haste turns speech into text on your phone with an on-device model. Only the text is used for an estimate.'],
    ['How do I delete my account?', 'Use Delete account in Settings. The account deletion page explains what is removed.'],
  ],
};

export const burble = {
  name: 'Burble',
  tagline: 'AI note-taking',
  description: 'Burble is the notebook that organizes itself. Type, write by hand, talk or snap a photo, and it lands in the right place. On iPhone, Android and the web.',
  steps: [
    { label: 'Capture', title: 'Get it down|*any way you like.*', text: 'Talk, type, write by hand or snap a photo. Burble takes the thought before it’s gone, from the app, a widget or the share sheet.' },
    { label: 'File', title: 'Burble files it|*for you.*', text: 'A note becomes a page in the right notebook. A date becomes an event. “Buy seeds” becomes a task. Burble tells you where everything went, and one tap undoes it.' },
    { label: 'Find', title: 'Find it|*when it matters.*', text: 'Search everything, handwriting included. Ask your notes a question and get an answer with the pages it came from.' },
  ],
  stacks: ['Uni', 'Projects', 'Personal'],
  // Sample captures for the filing demo. Example results; the app uses AI.
  demo: [
    { id: 'idea', label: 'An idea', input: 'Idea: plant tomatoes along the back fence', result: 'Filed in', path: ['Projects', 'Garden'], kind: 'page' },
    { id: 'date', label: 'A date', input: 'Dentist on Thursday at 3', result: 'Added to', path: ['Calendar', 'Thursday 3:00 pm'], kind: 'event' },
    { id: 'list', label: 'A list', input: 'Buy seeds, compost and twine', result: '3 tasks added to', path: ['Projects', 'Garden', 'Plans'], kind: 'task' },
    { id: 'lecture', label: 'A lecture note', input: 'Dijkstra fails with negative edge weights', result: 'Filed in', path: ['Uni', 'Algorithms', 'Week 7'], kind: 'page' },
  ],
  tree: [
    { name: 'Uni', children: ['Algorithms', 'Statistics'] },
    { name: 'Projects', children: ['Garden', 'Website'] },
    { name: 'Personal', children: ['Journal', 'Recipes'] },
    { name: 'Calendar', children: [] },
  ],
  features: [
    { no: '01', title: 'Capture anywhere', text: 'Talk, type, photo or file. Widgets, the share sheet and a web clipper mean the thought never has to wait for the right app.' },
    { no: '02', title: 'Filing that learns', text: 'Burble creates the page, adds the task or books the event, then shows you what it did. Correct it once and it remembers your house rules.' },
    { no: '03', title: 'Real ink', text: 'A low-latency pen, highlighter, lasso and shapes on lined, grid or blank paper. Handwriting is searchable and converts to text.' },
    { no: '04', title: 'Notes that play back', text: 'Record while you write. Tap a stroke later and the recording plays from that moment.' },
    { no: '05', title: 'Blocks and databases', text: 'A slash menu, tables, boards and calendars, templates, backlinks and a daily page that sums itself up each evening.' },
    { no: '06', title: 'Open files, your cloud', text: 'Notes are plain files in Google Drive, OneDrive or Dropbox, readable by other note apps. Leave whenever you like and take everything.' },
  ],
  principles: [
    'Offline first. Everything works without a connection.',
    'Anything the AI did can be undone, moved or edited by hand.',
    'Your notes are open files in your own cloud.',
  ],
  platforms: ['iPhone', 'iPad', 'Android', 'Web'],
};

export const cairn = {
  name: 'Cairn',
  tagline: 'The universal pedal',
  // Cairn is a concept: development has not started, so the page promises nothing specific.
  description: 'Cairn is a universal pedal that brings your production sounds to the stage, live. Not just a guitar pedal. It is a concept from Kokonut, with a waitlist.',
  pillars: [
    { stat: 'Your sounds', label: 'From the studio', text: 'The sounds you built at your desk, there when you play live.' },
    { stat: 'Any source', label: 'Not just guitar', text: 'Vocals, keys, synths, bass, wind or guitar. If it makes a signal, it belongs.' },
    { stat: 'No laptop', label: 'Made for the stage', text: 'One box on the floor instead of a computer balanced on a stand.' },
  ],
};

export const aaron = {
  name: 'Aaron Ko',
  role: 'Student and founder',
  location: 'Auckland, New Zealand',
  university: 'University of Auckland',
  description: 'Aaron Ko is a student at the University of Auckland and the founder of Kokonut. He designs and builds AI apps for iPhone, Android and the web, and is planning a universal pedal for the stage.',
  email: 'admin@kokonut.cc',
  github: 'https://github.com/Tydooloo',
  // A cut-out on a transparent background, 4:5. To change it, replace the file and rebuild.
  portrait: '/assets/aaron/portrait.webp',
  quote: 'I like software that gets out of the way: fast to use, honest about what it knows, and private by default.',
  projects: [
    {
      id: 'haste', no: '01', name: 'Haste', kind: 'AI calorie tracker', year: '2026', href: '/haste/',
      role: 'Design, engineering, release',
      summary: 'A food journal that makes logging fast enough to keep doing. Snap, say or type a meal and AI estimates the calories and macros.',
      points: ['One Flutter codebase for iPhone and Android', 'On-device speech recognition, so recordings never leave the phone', 'A cited New Zealand food catalogue and barcode lookup'],
      stack: ['Flutter', 'Dart', 'Supabase', 'Postgres', 'On-device Whisper'],
    },
    {
      id: 'burble', no: '02', name: 'Burble', kind: 'AI note-taking', year: '2026', href: '/burble/',
      role: 'Product, design, engineering',
      summary: 'The notebook that organizes itself. Notes, tasks and handwriting, filed by AI into open files in your own cloud.',
      points: ['Local-first: every edit works offline and merges without conflicts', 'A portable TypeScript core shared by iOS, Android and the web', 'Full-text search over an on-device SQLite index'],
      stack: ['TypeScript', 'React Native', 'Expo', 'Yjs', 'SQLite'],
    },
    {
      id: 'cairn', no: '03', name: 'Cairn', kind: 'Universal pedal', year: 'Concept', href: '/cairn/',
      role: 'Founder, product concept',
      summary: 'A universal pedal that brings production sounds to the stage, for any instrument or voice. Not just a guitar pedal.',
      points: ['A hardware idea taken from a gap in the market to a full plan', 'Research into what exists and why it falls short', 'Engineering, hardware and business mapped out before any build'],
      stack: ['Product research', 'System design', 'Audio', 'Hardware'],
    },
    {
      id: 'kokonut', no: '04', name: 'Kokonut', kind: 'Independent studio', year: '2026', href: '/',
      role: 'Founder',
      summary: 'The studio behind all three, and this website: hand-written WebGL, no framework, no trackers.',
      points: ['Every 3D scene on this domain is modelled in code', 'Static pages with a strict content security policy', 'Automated checks on every push'],
      stack: ['JavaScript', 'Three.js', 'GLSL', 'Web Audio', 'CI'],
    },
  ],
  earlier: [
    ['Revisen', 'A revision app that maps past-paper mistakes to the syllabus and schedules recall.', 'Flutter · Firebase'],
    ['SideQuest', 'Group planning for making more memories together.', 'Flutter'],
  ],
  skills: [
    ['Build', ['Flutter and Dart', 'TypeScript and React Native', 'Python', 'C++']],
    ['Ship', ['Supabase and Postgres', 'Firebase', 'App Store and Google Play releases', 'CI on GitHub Actions']],
    ['Design', ['Product and interface design', 'Motion and WebGL', 'Writing that says what it means']],
  ],
  about: [
    'I’m a student at the University of Auckland and the founder of Kokonut, a one-person studio. I take products the whole way: the idea, the interface, the code, the backend and the release.',
    'Most of my work is AI that earns its place. Haste turns a photo into a meal log you can check. Burble files a thought where you’d have put it yourself. Cairn is my plan for taking the sounds a musician makes in the studio onto the stage.',
  ],
};

// Pages every footer must be able to reach.
export const pages = [
  ['Kokonut', '/'], ['Haste', '/haste/'], ['Burble', '/burble/'], ['Cairn', '/cairn/'], ['Aaron Ko', '/aaron/'],
];
