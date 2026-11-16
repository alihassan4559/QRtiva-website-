export type QrCategoryId =
  | 'url'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'youtube'
  | 'snapchat'
  | 'wifi'
  | 'email'
  | 'phone-sms'
  | 'location'
  | 'pdf'
  | 'universal-link';

export interface QrFieldOption {
  label: string;
  value: string;
}

export interface QrFieldDefinition {
  key: string;
  label: string;
  type:
    | 'text'
    | 'url'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'datetime-local'
    | 'number';
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  options?: QrFieldOption[];
  halfWidth?: boolean;
  showWhen?: { field: string; equals?: string; notEquals?: string };
}

export interface QrCategoryDefinition {
  id: QrCategoryId;
  name: string;
  shortName: string;
  slug: string;
  description: string;
  iconName: string;
  defaultFrameLabel: string;
  searchTerms?: string[];
  fields: QrFieldDefinition[];
  defaultValues: Record<string, string | boolean>;
  exampleValues: Record<string, string | boolean>;
}

export interface PayloadValidationResult {
  payload: string;
  isValid: boolean;
  error?: string;
  mismatchDomain?: string;
  suggestUniversal?: boolean;
}

function escapeWifiValue(val: string): string {
  return val.replace(/([\\;,:"])/g, '\\$1');
}

function hostMatchesDomainList(hostname: string, domains: string[]): boolean {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
  return domains.some((d) => cleanHost === d || cleanHost.endsWith(`.${d}`));
}

function validateStrictWebUrl(
  rawInput: string,
  emptyMsg: string
): PayloadValidationResult & { parsedHost?: string } {
  const raw = rawInput.trim();
  if (!raw) return { payload: '', isValid: false, error: emptyMsg };
  const hasProto = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw);
  if (hasProto && !/^https?:\/\//i.test(raw)) {
    return {
      payload: '',
      isValid: false,
      error: 'Enter a valid http:// or https:// web URL.',
    };
  }
  const candidate = hasProto ? raw : `https://${raw}`;
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      !host ||
      (!host.includes('.') && host !== 'localhost')
    ) {
      return {
        payload: '',
        isValid: false,
        error: 'Enter a valid domain URL (e.g. https://example.com).',
      };
    }
    return {
      payload: hasProto ? raw : parsed.toString(),
      isValid: true,
      parsedHost: host.replace(/^www\./, ''),
    };
  } catch {
    return {
      payload: '',
      isValid: false,
      error: 'Enter a valid HTTP or HTTPS URL (e.g. https://example.com).',
    };
  }
}

interface PlatformValidatorConfig {
  platformLabel: string;
  domains: string[];
  allowedProtocols?: string[];
  buildFromHandle?: (cleanHandle: string) => string;
  emptyMsg: string;
}

function validatePlatformInput(
  rawInput: string,
  config: PlatformValidatorConfig
): PayloadValidationResult {
  const raw = rawInput.trim();
  if (!raw) {
    return { payload: '', isValid: false, error: config.emptyMsg };
  }

  if (config.allowedProtocols?.length) {
    for (const proto of config.allowedProtocols) {
      if (raw.toLowerCase().startsWith(`${proto.toLowerCase()}://`)) {
        return { payload: raw, isValid: true };
      }
    }
  }

  const looksLikeUrlOrDomain =
    raw.includes('://') || raw.includes('.') || /^https?:/i.test(raw) || raw.includes('/');

  if (!looksLikeUrlOrDomain && config.buildFromHandle) {
    const cleaned = raw.replace(/^@+/, '').trim();
    if (!cleaned || /\s/.test(cleaned)) {
      return {
        payload: '',
        isValid: false,
        error: `Enter a valid ${config.platformLabel} @handle without spaces, or paste any ${config.platformLabel} URL.`,
      };
    }
    return { payload: config.buildFromHandle(cleaned), isValid: true };
  }

  const webCheck = validateStrictWebUrl(raw, config.emptyMsg);
  if (!webCheck.isValid) {
    return webCheck;
  }

  const host = webCheck.parsedHost ?? '';
  if (!hostMatchesDomainList(host, config.domains)) {
    return {
      payload: '',
      isValid: false,
      mismatchDomain: host,
      suggestUniversal: true,
      error: `This link (${host}) does not belong to ${config.platformLabel}. Paste a valid ${config.platformLabel} link or use Other / Universal Link.`,
    };
  }

  return { payload: webCheck.payload, isValid: true };
}

export const QR_CATEGORIES: QrCategoryDefinition[] = [
  // 1. Website / URL
  {
    id: 'url',
    name: 'Website / URL QR Code',
    shortName: 'Website / URL',
    slug: '/website-qr-code-generator',
    description:
      'Link directly to any website, landing page, menu, online store, or portfolio.',
    iconName: 'Globe',
    defaultFrameLabel: 'VISIT WEBSITE',
    searchTerms: ['website', 'url', 'web', 'link', 'homepage', 'landing page', 'site'],
    fields: [
      {
        key: 'url',
        label: 'Website URL',
        type: 'url',
        placeholder: 'https://yourwebsite.com',
        required: true,
        helperText: 'Preserves your exact URL including query parameters and paths.',
      },
    ],
    defaultValues: { url: 'https://qrtiva.tools' },
    exampleValues: { url: 'https://example.com/spring-collection?utm_source=qr' },
  },

  // 2. WhatsApp
  {
    id: 'whatsapp',
    name: 'WhatsApp QR Code',
    shortName: 'WhatsApp',
    slug: '/whatsapp-qr-code-generator',
    description:
      'Paste any WhatsApp link (personal chat, group invite, channel, or business link) OR create a click-to-chat link below.',
    iconName: 'MessageCircle',
    defaultFrameLabel: 'CHAT ON WHATSAPP',
    searchTerms: ['whatsapp', 'wa.me', 'group', 'channel', 'chat', 'business'],
    fields: [
      {
        key: 'url',
        label: 'Paste any WhatsApp link here (Optional if using phone below)',
        type: 'url',
        placeholder:
          'https://chat.whatsapp.com/..., https://whatsapp.com/channel/..., or https://wa.me/...',
        required: false,
        helperText:
          'Accepts personal chats, click-to-chat, group invitations, channels, and business links verbatim. Leave blank to build from phone below.',
      },
      {
        key: 'countryCode',
        label: 'Country Code (Optional new chat)',
        type: 'text',
        placeholder: '1',
        halfWidth: true,
        helperText: 'Digits only (e.g. 1 for US, 44 for UK, 92 for PK).',
      },
      {
        key: 'phone',
        label: 'Phone Number (Optional new chat)',
        type: 'tel',
        placeholder: '5550192834',
        halfWidth: true,
      },
      {
        key: 'message',
        label: 'Pre-filled Message (Optional)',
        type: 'textarea',
        placeholder: 'Hi! I would like to learn more about your services.',
      },
    ],
    defaultValues: {
      url: '',
      countryCode: '1',
      phone: '5550192834',
      message: 'Hello! I scanned your QR code.',
    },
    exampleValues: {
      url: 'https://chat.whatsapp.com/ExampleGroupInviteLink',
      countryCode: '44',
      phone: '7700900077',
      message: 'Hi team, I would like to book a consultation.',
    },
  },

  // 3. Instagram
  {
    id: 'instagram',
    name: 'Instagram QR Code',
    shortName: 'Instagram',
    slug: '/instagram-qr-code-generator',
    description:
      'One input for all Instagram links—creator profiles, Reels, posts, stories, or @handles.',
    iconName: 'Instagram',
    defaultFrameLabel: 'OPEN INSTAGRAM',
    searchTerms: ['instagram', 'ig', 'reel', 'reels', 'profile', 'post'],
    fields: [
      {
        key: 'url',
        label: 'Paste any Instagram link or @username',
        type: 'url',
        placeholder: 'https://www.instagram.com/username, /reel/..., or @handle',
        required: true,
        helperText: 'Supports Instagram profiles, posts, Reels, stories, and @handles.',
      },
    ],
    defaultValues: { url: 'https://www.instagram.com/instagram' },
    exampleValues: { url: 'https://www.instagram.com/reel/C8exampleReel/' },
  },

  // 4. Facebook
  {
    id: 'facebook',
    name: 'Facebook QR Code',
    shortName: 'Facebook',
    slug: '/facebook-qr-code-generator',
    description:
      'One input for all Facebook links—profiles, pages, groups, posts, Reels, and Watch videos.',
    iconName: 'Facebook',
    defaultFrameLabel: 'OPEN FACEBOOK',
    searchTerms: ['facebook', 'fb', 'page', 'group', 'video', 'reel', 'fb.watch'],
    fields: [
      {
        key: 'url',
        label: 'Paste any Facebook link here',
        type: 'url',
        placeholder: 'https://www.facebook.com/... or https://fb.watch/...',
        required: true,
        helperText:
          'Supports profiles, pages, groups, posts, Reels, Watch videos, fb.watch, or usernames.',
      },
    ],
    defaultValues: { url: 'https://www.facebook.com/yourpage' },
    exampleValues: { url: 'https://www.facebook.com/groups/designcommunity' },
  },

  // 5. TikTok
  {
    id: 'tiktok',
    name: 'TikTok QR Code',
    shortName: 'TikTok',
    slug: '/tiktok-qr-code-generator',
    description:
      'One input for all TikTok links—creator profiles, video clips, short links, or @handles.',
    iconName: 'Music2',
    defaultFrameLabel: 'OPEN TIKTOK',
    searchTerms: ['tiktok', 'video', 'profile', 'vm.tiktok', 'short video'],
    fields: [
      {
        key: 'url',
        label: 'Paste any TikTok link or @handle',
        type: 'url',
        placeholder: 'https://www.tiktok.com/@username, video link, or @handle',
        required: true,
        helperText: 'Supports TikTok profiles, videos, vm.tiktok.com short links, and @handles.',
      },
    ],
    defaultValues: { url: 'https://www.tiktok.com/@tiktok' },
    exampleValues: { url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675' },
  },

  // 6. YouTube
  {
    id: 'youtube',
    name: 'YouTube QR Code',
    shortName: 'YouTube',
    slug: '/youtube-qr-code-generator',
    description:
      'One input for all YouTube links—channels, videos, Shorts, playlists, or youtu.be URLs.',
    iconName: 'Youtube',
    defaultFrameLabel: 'WATCH ON YOUTUBE',
    searchTerms: ['youtube', 'yt', 'channel', 'video', 'shorts', 'playlist', 'youtu.be'],
    fields: [
      {
        key: 'url',
        label: 'Paste any YouTube link here',
        type: 'url',
        placeholder: 'https://youtube.com/@channel, watch?v=..., /shorts/..., or @handle',
        required: true,
        helperText:
          'Supports channels, videos, Shorts, playlists, music.youtube.com, and youtu.be links.',
      },
    ],
    defaultValues: { url: 'https://www.youtube.com/@YouTube' },
    exampleValues: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30' },
  },

  // 7. Snapchat
  {
    id: 'snapchat',
    name: 'Snapchat QR Code',
    shortName: 'Snapchat',
    slug: '/snapchat-qr-code-generator',
    description:
      'One input for all Snapchat links—personal add links, public profiles, Spotlight, or @handles.',
    iconName: 'Camera',
    defaultFrameLabel: 'ADD ON SNAPCHAT',
    searchTerms: ['snapchat', 'snap', 'snapcode', 'public profile', 'spotlight'],
    fields: [
      {
        key: 'url',
        label: 'Paste any Snapchat link or @username',
        type: 'url',
        placeholder: 'https://www.snapchat.com/add/username, /@creator, or @handle',
        required: true,
        helperText: 'Supports snapchat.com/add/, public profiles, Spotlight links, and @handles.',
      },
    ],
    defaultValues: { url: 'https://www.snapchat.com/add/teamsnapchat' },
    exampleValues: { url: 'https://www.snapchat.com/@natgeo' },
  },

  // 8. Wi-Fi
  {
    id: 'wifi',
    name: 'Wi-Fi QR Code',
    shortName: 'Wi-Fi',
    slug: '/wifi-qr-code-generator',
    description: 'Let guests join your wireless network with a single camera scan.',
    iconName: 'Wifi',
    defaultFrameLabel: 'JOIN WI-FI',
    searchTerms: ['wifi', 'wi-fi', 'network', 'router', 'internet', 'password', 'ssid'],
    fields: [
      {
        key: 'ssid',
        label: 'Network Name (SSID)',
        type: 'text',
        placeholder: 'Studio_Guest_5G',
        required: true,
        halfWidth: true,
      },
      {
        key: 'encryption',
        label: 'Security Type',
        type: 'select',
        options: [
          { label: 'WPA / WPA2 / WPA3', value: 'WPA' },
          { label: 'WEP', value: 'WEP' },
          { label: 'No Password (Open)', value: 'nopass' },
        ],
        halfWidth: true,
      },
      {
        key: 'password',
        label: 'Network Password',
        type: 'text',
        placeholder: 'Enter Wi-Fi password',
        showWhen: { field: 'encryption', notEquals: 'nopass' },
        helperText: 'Processed 100% locally in your browser—never transmitted.',
      },
      {
        key: 'hidden',
        label: 'Hidden SSID network',
        type: 'checkbox',
      },
    ],
    defaultValues: { ssid: 'StudioGuestWiFi', encryption: 'WPA', password: 'Welcome2026!', hidden: false },
    exampleValues: { ssid: 'Cafe_Roastery_5G', encryption: 'WPA', password: 'EspressoPass99', hidden: false },
  },

  // 9. Email
  {
    id: 'email',
    name: 'Email QR Code',
    shortName: 'Email',
    slug: '/email-qr-code-generator',
    description: 'Launch an email draft with recipient, subject, and message pre-filled.',
    iconName: 'Mail',
    defaultFrameLabel: 'SEND EMAIL',
    searchTerms: ['email', 'mailto', 'inbox', 'support'],
    fields: [
      { key: 'to', label: 'Recipient Email', type: 'email', placeholder: 'support@company.com', required: true },
      { key: 'subject', label: 'Subject Line', type: 'text', placeholder: 'Product Inquiry' },
      { key: 'body', label: 'Email Message', type: 'textarea', placeholder: 'Hi team, I am reaching out regarding...' },
    ],
    defaultValues: {
      to: 'hello@qrtiva.tools',
      subject: 'Project Inquiry',
      body: 'Hi there, I would love to connect about a collaboration.',
    },
    exampleValues: {
      to: 'bookings@grandhotel.com',
      subject: 'Reservation Request',
      body: 'Hello, I would like to check availability for next weekend.',
    },
  },

  // 10. Phone / SMS
  {
    id: 'phone-sms',
    name: 'Phone / SMS QR Code',
    shortName: 'Phone / SMS',
    slug: '/phone-qr-code-generator',
    description: 'Trigger an instant mobile phone call or a pre-filled SMS text message in one place.',
    iconName: 'Phone',
    defaultFrameLabel: 'CALL OR TEXT',
    searchTerms: ['phone', 'sms', 'call', 'text message', 'tel', 'smsto', 'dial'],
    fields: [
      {
        key: 'mode',
        label: 'Action Type',
        type: 'select',
        options: [
          { label: 'Phone Call (One-Tap Dial)', value: 'call' },
          { label: 'SMS Text Message (Pre-filled)', value: 'sms' },
        ],
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 800 555 0199',
        required: true,
        helperText: 'Include the + country code for international numbers.',
      },
      {
        key: 'message',
        label: 'SMS Text Message (Optional)',
        type: 'textarea',
        placeholder: 'Hi! Please send me more details.',
        showWhen: { field: 'mode', equals: 'sms' },
      },
    ],
    defaultValues: { mode: 'call', phone: '+1 800 555 0199', message: 'Subscribe me to updates' },
    exampleValues: { mode: 'sms', phone: '+1 555 014 8821', message: 'TABLE 12 READY' },
  },

  // 11. Location / Maps
  {
    id: 'location',
    name: 'Location / Maps QR Code',
    shortName: 'Location / Maps',
    slug: '/google-maps-qr-code-generator',
    description: 'Direct visitors to your storefront, venue pin, or exact GPS coordinates.',
    iconName: 'MapPin',
    defaultFrameLabel: 'GET DIRECTIONS',
    searchTerms: ['location', 'maps', 'google maps', 'gps', 'directions', 'coordinates'],
    fields: [
      {
        key: 'mode',
        label: 'Location Input Mode',
        type: 'select',
        options: [
          { label: 'Google Maps URL', value: 'url' },
          { label: 'Latitude & Longitude', value: 'coords' },
        ],
      },
      {
        key: 'mapsUrl',
        label: 'Google Maps Link',
        type: 'url',
        placeholder: 'https://maps.google.com/?q=Empire+State+Building',
        required: true,
        showWhen: { field: 'mode', equals: 'url' },
      },
      {
        key: 'latitude',
        label: 'Latitude',
        type: 'text',
        placeholder: '37.7749',
        halfWidth: true,
        showWhen: { field: 'mode', equals: 'coords' },
      },
      {
        key: 'longitude',
        label: 'Longitude',
        type: 'text',
        placeholder: '-122.4194',
        halfWidth: true,
        showWhen: { field: 'mode', equals: 'coords' },
      },
    ],
    defaultValues: {
      mode: 'url',
      mapsUrl: 'https://maps.google.com/?q=San+Francisco+Ferry+Building',
      latitude: '37.7955',
      longitude: '-122.3937',
    },
    exampleValues: {
      mode: 'coords',
      mapsUrl: 'https://maps.google.com/?q=Eiffel+Tower',
      latitude: '48.8584',
      longitude: '2.2945',
    },
  },

  // 12. PDF / Document
  {
    id: 'pdf',
    name: 'PDF / Document QR Code',
    shortName: 'PDF / Document',
    slug: '/pdf-qr-code-generator',
    description: 'Link restaurant menus, product manuals, Google Drive files, or downloadable PDFs.',
    iconName: 'FileDown',
    defaultFrameLabel: 'VIEW DOCUMENT',
    searchTerms: ['pdf', 'document', 'menu', 'manual', 'google drive', 'dropbox', 'file'],
    fields: [
      {
        key: 'pdfUrl',
        label: 'PDF or Hosted Document URL',
        type: 'url',
        placeholder: 'https://yoursite.com/menu.pdf',
        required: true,
        helperText: 'Link to any hosted PDF, Google Drive, Dropbox, or Notion document.',
      },
    ],
    defaultValues: { pdfUrl: 'https://qrtiva.tools/samples/product-brochure.pdf' },
    exampleValues: { pdfUrl: 'https://restaurant.example.com/dinner-menu-2026.pdf' },
  },

  // 13. Other / Universal Link (Final 13th category)
  {
    id: 'universal-link',
    name: 'Other / Universal Link QR Code',
    shortName: 'Other / Universal',
    slug: '/universal-qr-code-generator',
    description:
      'Convert ANY valid HTTP or HTTPS link—Telegram, Viber, LinkedIn, Pinterest, Discord, Reddit, Threads, Twitch, Vimeo, Amazon, Shopify, checkout links, or any website.',
    iconName: 'Link2',
    defaultFrameLabel: 'OPEN LINK',
    searchTerms: [
      'other',
      'universal',
      'any link',
      'telegram',
      'viber',
      'linkedin',
      'pinterest',
      'discord',
      'reddit',
      'threads',
      'twitch',
      'vimeo',
      'x',
      'twitter',
      'messenger',
      'teams',
      'amazon',
      'shopify',
      'google drive',
      'video',
      'payment link',
      'checkout link',
    ],
    fields: [
      {
        key: 'url',
        label: 'Paste any valid HTTP or HTTPS link',
        type: 'url',
        placeholder: 'https://t.me/username, https://linkedin.com/in/..., or https://example.com',
        required: true,
        helperText:
          'Works for Telegram, Viber, LinkedIn, Pinterest, Discord, Reddit, Threads, Twitch, Vimeo, Amazon, Shopify, Google Drive, checkout/payment URLs, or any website. Encodes as a standard URL QR code.',
      },
    ],
    defaultValues: { url: 'https://example.com' },
    exampleValues: { url: 'https://www.linkedin.com/company/openai' },
  },
];

export const QR_CATEGORY_COUNT = QR_CATEGORIES.length;

export function getCategoryById(id: QrCategoryId): QrCategoryDefinition {
  return QR_CATEGORIES.find((cat) => cat.id === id) ?? QR_CATEGORIES[0];
}

export function buildQrPayload(
  categoryId: QrCategoryId,
  values: Record<string, string | boolean>
): PayloadValidationResult {
  const str = (key: string) => String(values[key] ?? '').trim();

  switch (categoryId) {
    case 'url':
      return validateStrictWebUrl(str('url'), 'Please enter a valid HTTP or HTTPS link.');

    case 'universal-link': {
      const raw = str('url');
      if (!raw) return { payload: '', isValid: false, error: 'Paste any valid HTTP or HTTPS URL.' };
      if (/^viber:\/\//i.test(raw)) {
        return { payload: raw, isValid: true };
      }
      return validateStrictWebUrl(raw, 'Paste any valid HTTP or HTTPS URL.');
    }

    case 'youtube':
      return validatePlatformInput(str('url'), {
        platformLabel: 'YouTube',
        domains: ['youtube.com', 'youtu.be'],
        buildFromHandle: (h) => `https://www.youtube.com/@${h}`,
        emptyMsg: 'Paste any YouTube channel, video, Shorts, playlist URL, or @handle.',
      });

    case 'facebook':
      return validatePlatformInput(str('url'), {
        platformLabel: 'Facebook',
        domains: ['facebook.com', 'fb.com', 'fb.watch'],
        buildFromHandle: (h) => `https://www.facebook.com/${h}`,
        emptyMsg: 'Paste any Facebook profile, page, group, post, Reel, or Watch URL.',
      });

    case 'instagram':
      return validatePlatformInput(str('url'), {
        platformLabel: 'Instagram',
        domains: ['instagram.com', 'instagr.am'],
        buildFromHandle: (h) => `https://www.instagram.com/${h}`,
        emptyMsg: 'Paste any Instagram profile, Reel, post, story URL, or @handle.',
      });

    case 'tiktok':
      return validatePlatformInput(str('url'), {
        platformLabel: 'TikTok',
        domains: ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
        buildFromHandle: (h) => `https://www.tiktok.com/@${h}`,
        emptyMsg: 'Paste any TikTok profile, video URL, short link, or @handle.',
      });

    case 'snapchat':
      return validatePlatformInput(str('url'), {
        platformLabel: 'Snapchat',
        domains: ['snapchat.com', 't.snapchat.com'],
        buildFromHandle: (h) => `https://www.snapchat.com/add/${h}`,
        emptyMsg: 'Paste any Snapchat profile, public profile, Spotlight URL, or @username.',
      });

    case 'whatsapp': {
      const linkRaw = str('url');
      if (linkRaw) {
        return validatePlatformInput(linkRaw, {
          platformLabel: 'WhatsApp',
          domains: ['wa.me', 'whatsapp.com', 'whatsapp.net'],
          allowedProtocols: ['whatsapp'],
          emptyMsg: 'Paste any WhatsApp link or enter Country Code & Phone below.',
        });
      }
      const cc = str('countryCode').replace(/\D/g, '');
      const phone = str('phone').replace(/\D/g, '');
      const message = str('message');
      if (!cc || !phone || phone.length < 5) {
        return {
          payload: '',
          isValid: false,
          error: 'Paste a WhatsApp URL above, or enter a valid country code and phone number below.',
        };
      }
      const query = message ? `?text=${encodeURIComponent(message)}` : '';
      return { payload: `https://wa.me/${cc}${phone}${query}`, isValid: true };
    }

    case 'wifi': {
      const ssid = str('ssid');
      const encryption = str('encryption') || 'WPA';
      const password = str('password');
      const hidden = Boolean(values.hidden);
      if (!ssid) return { payload: '', isValid: false, error: 'Enter your Wi-Fi network name (SSID).' };
      if (encryption !== 'nopass' && !password) {
        return { payload: '', isValid: false, error: 'Enter the Wi-Fi password or switch security to Open.' };
      }
      const pwdPart = encryption === 'nopass' ? '' : escapeWifiValue(password);
      const payload = `WIFI:T:${encryption};S:${escapeWifiValue(ssid)};P:${pwdPart};H:${hidden ? 'true' : 'false'};;`;
      return { payload, isValid: true };
    }

    case 'email': {
      const to = str('to');
      const subject = str('subject');
      const body = str('body');
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return { payload: '', isValid: false, error: 'Enter a valid recipient email address.' };
      }
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const query = params.toString();
      return { payload: `mailto:${to}${query ? `?${query}` : ''}`, isValid: true };
    }

    case 'phone-sms': {
      const mode = str('mode') || 'call';
      const phone = str('phone').replace(/[^\d+]/g, '');
      if (!phone || phone.length < 5) {
        return { payload: '', isValid: false, error: 'Enter a valid phone number.' };
      }
      if (mode === 'sms') {
        const message = str('message');
        return { payload: `SMSTO:${phone}:${message}`, isValid: true };
      }
      return { payload: `tel:${phone}`, isValid: true };
    }

    case 'location': {
      const mode = str('mode') || 'url';
      if (mode === 'coords') {
        const lat = str('latitude');
        const lng = str('longitude');
        if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
          return { payload: '', isValid: false, error: 'Enter valid numeric latitude and longitude.' };
        }
        return { payload: `https://maps.google.com/?q=${lat},${lng}`, isValid: true };
      }
      return validateStrictWebUrl(str('mapsUrl'), 'Enter a valid Google Maps link.');
    }

    case 'pdf':
      return validateStrictWebUrl(str('pdfUrl'), 'Enter a valid hosted URL of your PDF or document.');
  }
}
