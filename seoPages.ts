import type { QrCategoryId } from './qrCategories.ts';

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SeoGuideSection {
  heading: string;
  body: string;
}

export type PageKind =
  | 'home'
  | 'generator'
  | 'category'
  | 'blog'
  | 'contact'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'faq';

export interface SeoPageConfig {
  path: string;
  kind: PageKind;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  keywords: string[];
  categoryId?: QrCategoryId;
  breadcrumbs: BreadcrumbItem[];
  priority: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  guideSections?: SeoGuideSection[];
  useCases?: string[];
  faqs?: SeoFaqItem[];
}

export const GLOBAL_FAQS: SeoFaqItem[] = [
  {
    question: 'How do I create a QR code for free?',
    answer:
      'Choose one of the 13 QR categories such as Website / URL, WhatsApp, Wi-Fi, or Other / Universal Link, enter your details into the form, customize colors or add an optional logo, and download your high-resolution PNG, JPG, or SVG file immediately with zero cost.',
  },
  {
    question: 'How do I generate a QR code for my website?',
    answer:
      'Select the Website URL tab, paste your full link starting with https://, and preview the live QR code on the right. Once our real-time scanner check confirms readability, download it in PNG, JPG, or scalable SVG.',
  },
  {
    question: 'Are these QR codes free forever?',
    answer:
      'Yes. All static QR codes generated with QRtiva encode your destination data directly inside the QR pattern itself, meaning there are no subscriptions, scan limits, or renewal fees ever.',
  },
  {
    question: 'Do QR codes expire?',
    answer:
      'No. Because QRtiva creates direct static QR codes without intermediate redirect trackers, your QR codes never expire and continue working as long as the destination URL or data remains valid.',
  },
  {
    question: 'Can I download QR codes in PNG format?',
    answer:
      'Yes. You can export crisp, watermark-free PNG files at Standard (512×512), High Resolution (1024×1024), Print Quality (2048×2048), or custom pixel dimensions, alongside JPG and vector SVG.',
  },
  {
    question: 'Can I create QR codes for Wi-Fi?',
    answer:
      'Yes. Select the Wi-Fi QR Code category, enter your network SSID, choose WPA/WPA2/WPA3, WEP, or Open security, and enter your password. Guests simply point their phone camera at the code to connect automatically.',
  },
  {
    question: 'Can I add my logo to a QR code?',
    answer:
      'Yes. Upload any PNG, SVG, or JPG logo in the Logo Overlay customization panel, adjust its size, and QRtiva automatically protects a clean center zone and supports High (H) error correction so cameras still scan it effortlessly.',
  },
  {
    question: 'Do I need to register?',
    answer:
      'No account, email address, or credit card is required. Everything runs directly in your browser for instant speed and complete privacy.',
  },
  {
    question: 'Are generated QR codes scannable?',
    answer:
      'Yes. Every QR code follows ISO/IEC 18004 standards and passes a live built-in decoder check before you download, verifying contrast ratio and module integrity across iOS and Android cameras.',
  },
  {
    question: 'What is the difference between static and dynamic QR codes?',
    answer:
      'Static QR codes store your target URL or information directly inside the black-and-white pattern, so they never expire, require no servers, and protect user privacy. Dynamic QR codes route through a third-party tracking server that allows post-print link edits and analytics—often behind paid monthly subscriptions.',
  },
];

function makeCategoryPage(
  path: string,
  categoryId: QrCategoryId,
  title: string,
  description: string,
  h1: string,
  subtitle: string,
  keywords: string[],
  useCases: string[],
  guideSections: SeoGuideSection[],
  faqs: SeoFaqItem[]
): SeoPageConfig {
  return {
    path,
    kind: 'category',
    categoryId,
    title,
    description,
    h1,
    subtitle,
    keywords,
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'QR Code Generator', path: '/qr-code-generator' },
      { name: h1, path },
    ],
    priority: '0.9',
    changefreq: 'weekly',
    useCases,
    guideSections,
    faqs,
  };
}

export const SEO_PAGES: SeoPageConfig[] = [
  {
    path: '/',
    kind: 'home',
    title: 'Free QR Code Generator | QRtiva Online QR Code Maker',
    description:
      'Create QR codes online with QRtiva, a free online QR generator and custom QR code maker. Add logos, customize colors, and export PNG, JPG, or SVG—no signup.',
    h1: 'Free QR Code Generator — Create QR Codes Online',
    subtitle:
      'Use QRtiva, a free online QR generator and custom QR code maker, to create permanent QR codes for websites, social profiles, Wi-Fi, and links with no signup.',
    keywords: [
      'Free QR Code Generator',
      'QR Code Maker',
      'Create QR Code Online',
      'Free Online QR Generator',
      'Custom QR Code Generator',
    ],
    breadcrumbs: [{ name: 'Home', path: '/' }],
    priority: '1.0',
    changefreq: 'daily',
    faqs: GLOBAL_FAQS,
  },
  {
    path: '/qr-code-generator',
    kind: 'generator',
    title: 'Free QR Code Generator Studio — 13 Simple QR Types | QRtiva',
    description:
      'Create free custom QR codes across 13 clean categories—Website, WhatsApp, Instagram, Facebook, TikTok, YouTube, Snapchat, Wi-Fi, Email, Phone/SMS, Maps, PDF, or any link.',
    h1: 'Simple 13-Category QR Code Generator Studio',
    subtitle:
      'Pick one of 13 clear QR categories—one generator per platform plus Other / Universal Link—with custom colors, logos, frames, and high-res PNG, JPG & SVG exports.',
    keywords: [
      'Universal QR Code Creator',
      'QR Code Generator Free',
      'Custom QR Code Maker',
      'QR Code Studio',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'QR Code Generator', path: '/qr-code-generator' },
    ],
    priority: '0.95',
    changefreq: 'weekly',
    faqs: GLOBAL_FAQS.slice(0, 6),
  },
  makeCategoryPage(
    '/website-qr-code-generator',
    'url',
    'Website URL QR Code Generator — Free Forever | QRtiva',
    'Convert any website link into a high-resolution, scannable QR code for free. Customize colors, add a brand logo, and download PNG, JPG, or SVG instantly.',
    'Website URL QR Code Generator',
    'Turn any landing page, product catalog, digital menu, or portfolio link into a crisp, permanent QR code in seconds.',
    ['Website QR Code Generator', 'Website URL QR Code Generator', 'URL to QR Code Free'],
    [
      'Print packaging and product inserts directing buyers to setup guides',
      'Restaurant table tents linking to online menus or ordering pages',
      'Event posters, real estate signage, and direct-mail flyers',
      'Presentation slides so audiences can open reference links instantly',
    ],
    [
      {
        heading: 'How to Create a Website QR Code That Scans Reliably',
        body: 'Always begin your destination link with https:// so iOS and Android cameras launch the browser in one tap without intermediate prompts. Keep foreground colors substantially darker than the background—aim for at least a 4.5:1 contrast ratio—and preserve a quiet margin around the outer border.',
      },
      {
        heading: 'Choosing Between PNG, JPG, and SVG for Print',
        body: 'Use 1024×1024 or 2048×2048 PNG files for social posts, slide decks, and standard flyers. When handing artwork to a print shop for signage, banners, or packaging, export SVG so the QR modules scale cleanly to any physical size with zero blur.',
      },
    ],
    [
      {
        question: 'Can I change the website URL later after printing?',
        answer:
          'QRtiva creates permanent static QR codes directly encoding your URL, so they never expire or depend on a paid subscription. If you anticipate changing destinations later, link to a short redirect URL on your own domain.',
      },
      {
        question: 'Does adding a logo affect URL QR code scanning?',
        answer:
          'When you upload a logo, set Error Correction to H (30%) or Q (25%) and keep the logo size under 25%. Our built-in live verification checks every pixel to confirm instant smartphone decoding.',
      },
    ]
  ),
  makeCategoryPage(
    '/wifi-qr-code-generator',
    'wifi',
    'Free WiFi QR Code Generator — Instant Guest Access | QRtiva',
    'Create a free Wi-Fi QR code so guests, customers, and visitors can join your wireless network in one camera scan without typing passwords.',
    'Free Wi-Fi QR Code Generator',
    'Encode your wireless network name, encryption protocol, and password into a scannable card for homes, cafés, offices, and rentals.',
    ['Free WiFi QR Code Generator', 'WiFi QR Code Maker', 'Share WiFi Password QR'],
    [
      'Airbnb rentals and boutique hotel welcome binders',
      'Cafés, coworking lounges, and waiting rooms',
      'Conference rooms and studio guest networks',
      'Home guest Wi-Fi plaques without spelling out complex passphrases',
    ],
    [
      {
        heading: 'How Wi-Fi QR Codes Work Safely',
        body: 'Wi-Fi QR codes use the standard WIFI:T:WPA;S:Network;P:Password;; URI format natively recognized by Apple iOS Camera and Android scanners. QRtiva constructs the entire QR code locally inside your browser—your network credentials are never uploaded or stored on any server.',
      },
      {
        heading: 'Selecting the Correct Wi-Fi Security Protocol',
        body: 'Most modern routers use WPA/WPA2/WPA3 Personal—select the WPA option for those networks. Choose WEP only for legacy hardware, or Open if your guest network has no password.',
      },
    ],
    [
      {
        question: 'Is my Wi-Fi password sent to a server?',
        answer:
          'No. QRtiva generates your Wi-Fi QR code 100% client-side in your browser memory. Nothing is transmitted or saved.',
      },
      {
        question: 'Will a Wi-Fi QR code work on both iPhone and Android?',
        answer:
          'Yes. Both iOS (iOS 11+) and Android (Android 10+) natively recognize standard Wi-Fi QR payloads via the built-in camera app.',
      },
    ]
  ),
  makeCategoryPage(
    '/whatsapp-qr-code-generator',
    'whatsapp',
    'WhatsApp QR Code Generator — Chats, Groups & Channels | QRtiva',
    'Generate a free WhatsApp QR code for any personal chat, wa.me link, group invite, channel, or create a new click-to-chat link with phone and message.',
    'WhatsApp QR Code Generator',
    'Paste any WhatsApp link (personal chat, group invite, channel, or business link) OR enter your phone number and message to build a click-to-chat QR.',
    ['WhatsApp QR Code Generator', 'Create WhatsApp QR Code Free', 'WhatsApp Group & Channel QR'],
    [
      'Customer support packaging stickers and warranty cards',
      'WhatsApp group invites and announcement channels on event flyers',
      'Storefront window signs and business cards for instant inquiries',
      'Real estate yard signs for direct buyer messages',
    ],
    [
      {
        heading: 'One WhatsApp Tool for Links, Groups, Channels, and Phone Numbers',
        body: 'Paste an existing chat.whatsapp.com group invite, whatsapp.com/channel link, or wa.me business link directly into the URL box—or leave the URL empty and fill in your Country Code, Phone Number, and pre-filled message below to generate a click-to-chat QR automatically.',
      },
    ],
    [
      {
        question: 'Can I make a QR code for a WhatsApp Group or Channel?',
        answer:
          'Yes. Simply paste your chat.whatsapp.com invite link or whatsapp.com/channel URL into the WhatsApp link box and QRtiva preserves the exact link verbatim.',
      },
      {
        question: 'Do customers need to save my contact before messaging?',
        answer:
          'No. Scanning a wa.me QR code opens a direct chat thread inside WhatsApp immediately without adding your number to their address book.',
      },
    ]
  ),
  makeCategoryPage(
    '/instagram-qr-code-generator',
    'instagram',
    'Instagram QR Code Generator — Profiles, Reels & Posts | QRtiva',
    'Create a branded Instagram QR code for any profile, Reel, post, story link, or @handle with custom colors and center logo. Download PNG, JPG, or SVG free.',
    'Instagram QR Code Generator',
    'Paste any Instagram profile, Reel, post URL, or @handle to generate a customized print-ready QR code in seconds.',
    ['Instagram QR Code Generator', 'IG Reel QR Code', 'Custom Instagram QR'],
    [
      'Retail bags, shipping boxes, and product hang-tags playing styling Reels',
      'Café menus, salon mirrors, and pop-up booths',
      'Creator merch and print flyers',
    ],
    [
      {
        heading: 'Brand Your Instagram QR Code Without Hurting Scannability',
        body: 'Paste any instagram.com profile, /reel/, or /p/ post URL—or simply type your @username. QRtiva preserves the exact link, lets you customize colors and add a center emblem, and checks contrast before download.',
      },
    ],
    [
      {
        question: 'Can I link directly to an Instagram Reel or Profile?',
        answer:
          'Yes. Paste either an Instagram profile link or a direct Reel/post URL into the single Instagram input field—no separate category needed.',
      },
      {
        question: 'Does scanning open the Instagram app directly?',
        answer:
          'On mobile devices with Instagram installed, https://www.instagram.com/ links automatically trigger universal app links inside the app.',
      },
    ]
  ),
  makeCategoryPage(
    '/youtube-qr-code-generator',
    'youtube',
    'YouTube QR Code Generator — Channels, Videos, Shorts & Playlists | QRtiva',
    'Generate a free YouTube QR code linking straight to any channel, video, Shorts clip, playlist, or youtu.be share link. Customize style and download PNG, JPG, or SVG.',
    'YouTube QR Code Generator',
    'Paste any YouTube link—channel, video, Shorts, playlist, or youtu.be URL—and create a clean, permanent QR code in one step.',
    ['YouTube QR Code Generator', 'YouTube Video QR Code', 'YouTube Shorts & Channel QR'],
    [
      'Assembly manuals and packaging linking to step-by-step video tutorials',
      'Classroom worksheets pointing to educational explainers or playlists',
      'Music flyers and event programs featuring trailers or YouTube Shorts',
    ],
    [
      {
        heading: 'All YouTube Links Supported in One Simple Input',
        body: 'Paste any YouTube watch URL, Shorts URL, playlist link, youtu.be short link, or @channel handle. Timestamp parameters like ?t=90 and list IDs are preserved verbatim.',
      },
    ],
    [
      {
        question: 'Can I link to a YouTube video, Shorts, or playlist without switching categories?',
        answer:
          'Yes. One YouTube generator accepts every valid YouTube link—channels, videos, Shorts, playlists, and YouTube Music—preserving your exact URL.',
      },
    ]
  ),
  makeCategoryPage(
    '/facebook-qr-code-generator',
    'facebook',
    'Facebook QR Code Generator — Pages, Groups, Profiles & Videos | QRtiva',
    'Build a free Facebook QR code for any profile, business page, group, post, Reel, or fb.watch video. Customize colors and download PNG or vector SVG.',
    'Facebook QR Code Generator',
    'Paste any Facebook link—profile, page, group, post, Reel, or Watch video—to generate a customized static QR code.',
    ['Facebook QR Code Generator', 'Facebook Page & Group QR', 'Facebook Video QR'],
    [
      'Local shop counters linking to official Facebook Pages or reviews',
      'Neighborhood flyers and club posters inviting members into Facebook Groups',
      'Product packaging pointing to Facebook Reels or Watch demos',
    ],
    [
      {
        heading: 'One Facebook Generator for Every Facebook Link Type',
        body: 'Paste any facebook.com profile, page, /groups/ URL, /watch/ video, or fb.watch link—QRtiva validates the domain and preserves your exact link intact.',
      },
    ],
    [
      {
        question: 'Can I link directly to a Facebook Group, Page, or Watch video?',
        answer:
          'Yes, paste the full URL of your Facebook Page, Group, Profile, or Watch video and QRtiva encodes the exact link into a permanent static QR code.',
      },
    ]
  ),

  makeCategoryPage(
    '/email-qr-code-generator',
    'email',
    'Email QR Code Generator — Pre-Filled Mailto QR | QRtiva',
    'Create a free Email QR code with recipient address, subject line, and body template pre-filled for instant customer inquiries.',
    'Email QR Code Generator',
    'Pre-populate the To address, subject line, and starter message so customers or guests can email you in one tap.',
    ['Email QR Code Generator', 'Mailto QR Code Free'],
    [
      'Support desks and feedback cards with pre-tagged subject lines',
      'Exhibition signage for press or wholesale inquiries',
      'Event RSVP cards and real estate brochures',
    ],
    [
      {
        heading: 'Why Pre-Filled Subject Lines Boost Replies',
        body: 'Encoding a clear subject line like "Wholesale Inquiry" or "Booth #14 Follow-up" saves senders typing time on mobile keyboards and helps your inbox filter incoming requests automatically.',
      },
    ],
    [
      {
        question: 'Which email app opens when someone scans an Email QR code?',
        answer:
          'Scanning a mailto: QR code opens the user’s default mail client (Apple Mail, Gmail, or Outlook) with all fields pre-populated.',
      },
    ]
  ),
  makeCategoryPage(
    '/phone-qr-code-generator',
    'phone-sms',
    'Phone & SMS QR Code Generator — One-Tap Call or Text QR | QRtiva',
    'Generate a free Phone or SMS QR code so mobile users can call your business or send a pre-filled text message with a single camera scan.',
    'Phone / SMS QR Code Generator',
    'Switch effortlessly between One-Tap Phone Call and Pre-filled SMS Text Message inside one combined Phone / SMS QR tool.',
    ['Phone QR Code Generator', 'SMS QR Code Generator', 'Call QR Code Maker', 'Text Message QR Maker'],
    [
      'Customer support desks, service stickers, and closed-hours storefront signs',
      'Takeout flyers, delivery hotlines, and SMS opt-in signage',
      'Table-ready restaurant notifications and appointment confirmations',
    ],
    [
      {
        heading: 'Phone Call vs. Pre-Filled SMS Inside One Generator',
        body: 'Choose Phone Call (tel:) to prompt a one-tap call confirmation, or choose SMS Text Message (SMSTO:) to pre-fill both the destination number and starter SMS text.',
      },
    ],
    [
      {
        question: 'Does a phone or SMS QR code call or send automatically?',
        answer:
          'No—for user safety, smartphones open the dialer or messaging app pre-filled so the user taps once to confirm.',
      },
    ]
  ),
  makeCategoryPage(
    '/google-maps-qr-code-generator',
    'location',
    'Google Maps QR Code Generator — Location & Directions | QRtiva',
    'Generate a free Google Maps QR code from any location link or GPS coordinates so visitors get instant turn-by-turn directions.',
    'Google Maps QR Code Generator',
    'Point wedding invitations, storefront flyers, and event posters straight to exact Google Maps pins or latitude/longitude coordinates.',
    ['Google Maps QR Code Generator', 'Location QR Code Maker', 'GPS Coordinates QR'],
    [
      'Wedding invitations and venue parking signs',
      'Pop-up markets, food trucks, and trailheads without street addresses',
      'Brochures directing clients to office entrances or loading docks',
    ],
    [
      {
        heading: 'Maps URL vs. GPS Coordinates',
        body: 'Paste a Google Maps share link for named businesses, or switch to Latitude & Longitude mode when marking exact park pavilions, trailheads, or warehouse gates that lack a formal street address.',
      },
    ],
    [
      {
        question: 'Does the location QR code work on Apple Maps or browser fallback?',
        answer:
          'Yes. Standard https://maps.google.com/?q= links open in the Google Maps app when installed or cleanly inside any mobile web browser.',
      },
    ]
  ),
  makeCategoryPage(
    '/tiktok-qr-code-generator',
    'tiktok',
    'TikTok QR Code Generator — Profiles, Videos & Short Links | QRtiva',
    'Build a free TikTok QR code for any profile, video clip, vm.tiktok.com short link, or @username with custom colors and logo overlay. Download PNG, JPG, or SVG.',
    'TikTok QR Code Generator',
    'Paste any TikTok profile link, video URL, vm.tiktok.com short link, or @handle—all supported in one unified TikTok generator.',
    ['TikTok QR Code Generator', 'TikTok Video QR', 'TikTok Profile QR Maker'],
    ['Product unboxing inserts linking to demo videos', 'Live event backdrops', 'Retail display cards'],
    [
      {
        heading: 'Profiles, Video Clips, and Short Share Links in One Place',
        body: 'Enter your @handle, paste a full tiktok.com/@user/video/... URL, or drop in a vm.tiktok.com / vt.tiktok.com share link—QRtiva encodes your exact URL with zero redirects.',
      },
    ],
    [
      {
        question: 'Is there any limit on scans for TikTok QR codes?',
        answer:
          'None at all. Static QR codes generated with QRtiva support unlimited lifetime scans.',
      },
    ]
  ),
  makeCategoryPage(
    '/pdf-qr-code-generator',
    'pdf',
    'PDF & Document Link QR Code Generator — Menus & Manuals | QRtiva',
    'Generate a free QR code for any hosted PDF menu, product manual, pitch deck, or brochure with high-resolution SVG and PNG exports.',
    'PDF / Document Link QR Code Generator',
    'Link physical tables, packaging, and brochures to hosted PDF menus, spec sheets, user manuals, or slide decks.',
    ['PDF QR Code Generator', 'Document QR Maker', 'Menu PDF QR Code'],
    ['Restaurant digital menus', 'Appliance warranty and user manuals', 'Trade show product specification sheets'],
    [
      {
        heading: 'Best Practices for Hosting Printable PDF Links',
        body: 'Ensure your PDF link is set to public viewing (for example on your website, Google Drive, or Dropbox) and keep file sizes mobile-friendly so visitors on cellular data load the document in under two seconds.',
      },
    ],
    [
      {
        question: 'Can I link Google Drive or Dropbox PDF files?',
        answer:
          'Yes. Make sure link sharing is set to "Anyone with the link can view", paste the URL here, and test it on your phone before printing.',
      },
    ]
  ),
  makeCategoryPage(
    '/snapchat-qr-code-generator',
    'snapchat',
    'Snapchat QR Code Generator — Personal, Public Profiles & Spotlight | QRtiva',
    'Generate a free custom Snapchat QR code for any personal add link, public creator profile, Spotlight video, or @username. Download PNG, JPG, or SVG.',
    'Snapchat QR Code Generator',
    'Paste any Snapchat link—personal add link, public creator profile, Spotlight URL, or @handle—to build a branded, scannable QR code.',
    ['Snapchat QR Code Generator', 'Custom Snapchat QR Code', 'Snapchat Profile Link QR'],
    [
      'Creator merch, event banners, and festival wristbands',
      'Retail packaging inserts inviting buyers to behind-the-scenes snaps',
      'Business cards and campus flyers for instant friend additions',
    ],
    [
      {
        heading: 'Personal Add Links, Public Profiles, and Spotlight Supported Together',
        body: 'Whether you paste a personal snapchat.com/add/username link, a public creator snapchat.com/@username URL, a Spotlight clip, or just your @handle, one single Snapchat generator handles it cleanly.',
      },
      {
        heading: 'Customizing Without Breaking Mobile Camera Focus',
        body: 'Keep high contrast between your foreground modules and background color, and use High (H) error correction whenever adding a brand emblem or yellow accent frame.',
      },
    ],
    [
      {
        question: 'Do people need the Snapchat camera specifically to scan this?',
        answer:
          'No. Because QRtiva generates standard ISO QR codes encoding your snapchat.com URL, any standard iPhone or Android camera can scan it and open your profile in Snapchat.',
      },
      {
        question: 'Can I enter just my Snapchat @username?',
        answer:
          'Yes. Enter your @username or paste any full snapchat.com link and QRtiva builds or preserves the exact URL automatically.',
      },
    ]
  ),
  makeCategoryPage(
    '/universal-qr-code-generator',
    'universal-link',
    'Other / Universal Link QR Code Generator — Any Website or Link | QRtiva',
    'Convert any valid HTTP or HTTPS link—Telegram, Viber, LinkedIn, Pinterest, Discord, Reddit, Threads, Twitch, Vimeo, Amazon, Shopify, Google Drive, or any URL—into a free QR code.',
    'Other / Universal Link QR Generator',
    'Paste any website, Telegram, Viber, LinkedIn, Discord, Twitch, Vimeo, Amazon, Shopify, Google Drive, or custom URL to generate an exact QR code immediately.',
    [
      'Universal QR Code Generator',
      'Other Link QR Generator',
      'Any URL to QR Code',
      'Telegram & LinkedIn QR',
    ],
    [
      'Telegram, Viber, LinkedIn, Pinterest, Discord, Reddit, Threads, Twitch, and Vimeo links',
      'Amazon listings, Shopify stores, Google Drive folders, and Notion pages',
      'Custom SaaS portals, webinars, online checkout links, and any video URL',
    ],
    [
      {
        heading: 'Works With Any Valid HTTP or HTTPS Domain',
        body: 'Paste any valid http:// or https:// web address—including Telegram, LinkedIn, Discord, Amazon, Shopify, Google Drive, or custom domains. Your exact URL with query parameters and paths is encoded directly with zero tracking redirects.',
      },
      {
        heading: 'Smart Platform Detection With Zero Lock-In',
        body: 'Recognized platforms display helpful context automatically, and any valid link works immediately without needing a separate platform category.',
      },
    ],
    [
      {
        question: 'Does Other / Universal Link work for Telegram, LinkedIn, Discord, or custom domains?',
        answer:
          'Yes. Any valid http:// or https:// web address—including Telegram, Viber, LinkedIn, Pinterest, Discord, Reddit, Threads, Twitch, Vimeo, Amazon, Shopify, Google Drive, or custom sites—works immediately.',
      },
      {
        question: 'Can I paste an official checkout or payment link into Other / Universal Link?',
        answer:
          'Yes. You can paste any valid official http:// or https:// payment or checkout URL (such as Stripe, PayPal, or hosted payment links) to generate a standard URL QR code. QRtiva encodes the link as a normal web URL and does not integrate directly with payment apps.',
      },
      {
        question: 'Does QRtiva verify the content or safety of pasted destinations?',
        answer:
          'No. QRtiva encodes the exact URL you supply client-side without inspecting external websites. Always double-check that you trust and own or authorize the destination URL before printing.',
      },
    ]
  ),

  {
    path: '/contact',
    kind: 'contact',
    title: 'Contact QRtiva – QR Code Generator Support',
    description:
      'Contact QRtiva for help, questions, or support regarding our free QR code generator.',
    h1: 'Contact Us',
    subtitle:
      'Contact QRtiva for QR code generator support, technical questions, or feedback by email.',
    keywords: [
      'QRtiva support',
      'QR code generator support',
      'contact QRtiva',
      'QRtiva email support',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: '/contact' },
    ],
    priority: '0.6',
    changefreq: 'monthly',
  },
  {
    path: '/about',
    kind: 'about',
    title: 'About Us — Privacy-First Free QR Code Studio | QRtiva',
    description:
      'Learn why we built QRtiva to keep static QR code generation 100% free, privacy-friendly, watermark-free, and accessible without accounts.',
    h1: 'About QRtiva',
    subtitle: 'Building fast, privacy-respecting QR infrastructure that stays free forever for creators, educators, and small businesses.',
    keywords: ['About QRtiva', 'Free QR Code Platform', 'Privacy QR Generator'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
    ],
    priority: '0.6',
    changefreq: 'monthly',
  },
  {
    path: '/privacy-policy',
    kind: 'privacy',
    title: 'Privacy Policy — Zero-Tracking Client-Side QR Generation | QRtiva',
    description:
      'Read QRtiva’s transparent privacy policy. QR code generation runs locally in your browser without storing your URLs, Wi-Fi passwords, or contact data.',
    h1: 'Privacy Policy',
    subtitle: 'Your URLs, Wi-Fi credentials, and contact cards stay in your browser.',
    keywords: ['QRtiva Privacy Policy', 'Private QR Code Generator'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
    ],
    priority: '0.4',
    changefreq: 'monthly',
  },
  {
    path: '/terms-and-conditions',
    kind: 'terms',
    title: 'Terms and Conditions — Free Commercial & Personal Use | QRtiva',
    description:
      'Review QRtiva’s Terms and Conditions. All QR codes generated on QRtiva are free for unlimited personal and commercial print or digital use.',
    h1: 'Terms and Conditions',
    subtitle: 'Clear guidelines for unlimited personal and commercial QR code usage.',
    keywords: ['QRtiva Terms and Conditions', 'Commercial QR Usage'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Terms and Conditions', path: '/terms-and-conditions' },
    ],
    priority: '0.4',
    changefreq: 'monthly',
  },
  {
    path: '/faq',
    kind: 'faq',
    title: 'Frequently Asked Questions — Free QR Code Guide | QRtiva',
    description:
      'Answers to common questions about creating free QR codes, PNG/JPG/SVG exports, logo embedding, static vs. dynamic QR codes, and scannability.',
    h1: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about creating, customizing, verifying, and printing permanent QR codes.',
    keywords: ['QR Code FAQ', 'Do QR Codes Expire', 'Static vs Dynamic QR Codes'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ],
    priority: '0.8',
    changefreq: 'weekly',
    faqs: GLOBAL_FAQS,
  },
  {
    path: '/blog',
    kind: 'blog',
    title: 'QRtiva Blog — QR Code Guides, Printing Tips & Tutorials',
    description:
      'Read original QRtiva guides on creating free QR codes, Wi-Fi and WhatsApp setup, print sizing best practices, static vs. dynamic codes, and QR security.',
    h1: 'QRtiva Blog & QR Code Guides',
    subtitle:
      'Practical tutorials, pre-press printing rules, and security tips for creating reliable, permanent QR codes.',
    keywords: [
      'QR code blog',
      'QR code tutorials',
      'QR code printing best practices',
      'static vs dynamic QR codes',
      'QRtiva guides',
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ],
    priority: '0.9',
    changefreq: 'daily',
  },
];

export const LEGACY_SEO_REDIRECTS: Record<string, string> = {
  '/tiktok-video-qr-code-generator': '/tiktok-qr-code-generator',
  '/youtube-video-qr-code-generator': '/youtube-qr-code-generator',
  '/instagram-reel-qr-code-generator': '/instagram-qr-code-generator',
  '/free-video-to-qr-code-generator': '/universal-qr-code-generator',
  '/sms-qr-code-generator': '/phone-qr-code-generator',
  '/telegram-qr-code-generator': '/universal-qr-code-generator',
  '/viber-qr-code-generator': '/universal-qr-code-generator',
  '/linkedin-qr-code-generator': '/universal-qr-code-generator',
  '/free-link-to-qr-code-generator': '/universal-qr-code-generator',
  '/payment-qr-code-generator': '/universal-qr-code-generator',
  '/text-qr-code-generator': '/website-qr-code-generator',
  '/vcard-qr-code-generator': '/website-qr-code-generator',
  '/event-qr-code-generator': '/website-qr-code-generator',
};

export function findSeoPage(pathname: string): SeoPageConfig {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const resolved = LEGACY_SEO_REDIRECTS[clean] ?? clean;
  return SEO_PAGES.find((page) => page.path === resolved) ?? SEO_PAGES[0];
}
