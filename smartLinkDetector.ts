import type { QrCategoryId } from '../data/qrCategories.ts';

export interface SmartLinkDetection {
  isValidUrl: boolean;
  normalizedUrl: string;
  exactUserUrl: string;
  domain: string;
  platformName: string;
  recognized: boolean;
  linkType: string;
  suggestedCategoryId: QrCategoryId;
  suggestedCategoryLabel: string;
  error?: string;
}

function hostMatches(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function normalizeWebUrl(rawInput: string): {
  valid: boolean;
  normalizedUrl: string;
  exactUserUrl: string;
  parsed?: URL;
  error?: string;
} {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      normalizedUrl: '',
      exactUserUrl: '',
      error: 'Enter any valid HTTP or HTTPS link (e.g. https://example.com).',
    };
  }

  const hasExplicitHttp = /^https?:\/\//i.test(trimmed);
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) && !hasExplicitHttp) {
    return {
      valid: false,
      normalizedUrl: '',
      exactUserUrl: trimmed,
      error: 'Only http:// and https:// web URLs are supported here.',
    };
  }

  const candidate = hasExplicitHttp ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        valid: false,
        normalizedUrl: '',
        exactUserUrl: trimmed,
        error: 'URL must start with http:// or https://.',
      };
    }
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || (!hostname.includes('.') && hostname !== 'localhost')) {
      return {
        valid: false,
        normalizedUrl: '',
        exactUserUrl: trimmed,
        error: 'Enter a valid website domain (e.g. https://example.com).',
      };
    }
    const exactOrNormalized = hasExplicitHttp ? trimmed : parsed.toString();
    return {
      valid: true,
      normalizedUrl: exactOrNormalized,
      exactUserUrl: trimmed,
      parsed,
    };
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      exactUserUrl: trimmed,
      error: 'Enter a valid HTTP or HTTPS URL (e.g. https://example.com).',
    };
  }
}

export function detectSmartLink(rawInput: string): SmartLinkDetection {
  const check = normalizeWebUrl(rawInput);
  if (!check.valid || !check.parsed) {
    return {
      isValidUrl: false,
      normalizedUrl: '',
      exactUserUrl: check.exactUserUrl,
      domain: '',
      platformName: 'Not detected',
      recognized: false,
      linkType: 'Invalid or incomplete URL',
      suggestedCategoryId: 'universal-link',
      suggestedCategoryLabel: 'Other / Universal Link',
      error: check.error,
    };
  }

  const parsed = check.parsed;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const path = parsed.pathname.toLowerCase();
  const fullLower = check.normalizedUrl.toLowerCase();

  const match = (
    platformName: string,
    linkType: string,
    suggestedCategoryId: QrCategoryId,
    suggestedCategoryLabel: string,
    recognized = true
  ): SmartLinkDetection => ({
    isValidUrl: true,
    normalizedUrl: check.normalizedUrl,
    exactUserUrl: check.exactUserUrl,
    domain: host,
    platformName,
    recognized,
    linkType,
    suggestedCategoryId,
    suggestedCategoryLabel,
  });

  // Main Platform Categories
  if (hostMatches(host, 'youtube.com') || host === 'youtu.be') {
    const linkType = path.startsWith('/shorts/')
      ? 'YouTube Shorts'
      : path.startsWith('/playlist')
        ? 'YouTube Playlist'
        : path.startsWith('/@') ||
            path.startsWith('/channel/') ||
            path.startsWith('/c/') ||
            path.startsWith('/user/')
          ? 'YouTube Channel'
          : host === 'music.youtube.com'
            ? 'YouTube Music'
            : 'YouTube Video';
    return match('YouTube', linkType, 'youtube', 'YouTube QR');
  }

  if (hostMatches(host, 'facebook.com') || host === 'fb.watch' || host === 'fb.com') {
    const linkType =
      host === 'fb.watch' || path.includes('/watch') || path.includes('/videos/')
        ? 'Facebook Video'
        : path.includes('/reel/')
          ? 'Facebook Reel'
          : path.includes('/groups/')
            ? 'Facebook Group'
            : path.includes('/posts/')
              ? 'Facebook Post'
              : 'Facebook Page / Profile';
    return match('Facebook', linkType, 'facebook', 'Facebook QR');
  }

  if (hostMatches(host, 'instagram.com') || host === 'instagr.am') {
    const linkType =
      path.includes('/reel/') || path.includes('/reels/')
        ? 'Instagram Reel'
        : path.includes('/p/')
          ? 'Instagram Post'
          : path.includes('/stories/')
            ? 'Instagram Story'
            : 'Instagram Profile';
    return match('Instagram', linkType, 'instagram', 'Instagram QR');
  }

  if (hostMatches(host, 'tiktok.com') || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    const linkType =
      path.includes('/video/') || host === 'vm.tiktok.com' || host === 'vt.tiktok.com'
        ? 'TikTok Video'
        : 'TikTok Profile';
    return match('TikTok', linkType, 'tiktok', 'TikTok QR');
  }

  if (hostMatches(host, 'snapchat.com')) {
    const linkType = path.startsWith('/add/')
      ? 'Snapchat Add Link'
      : path.includes('/spotlight/')
        ? 'Snapchat Spotlight'
        : 'Snapchat Public Profile';
    return match('Snapchat', linkType, 'snapchat', 'Snapchat QR');
  }

  if (host === 'wa.me' || hostMatches(host, 'whatsapp.com') || hostMatches(host, 'whatsapp.net')) {
    const linkType =
      host === 'chat.whatsapp.com'
        ? 'WhatsApp Group Invite'
        : path.includes('/channel/')
          ? 'WhatsApp Channel'
          : 'WhatsApp Chat Link';
    return match('WhatsApp', linkType, 'whatsapp', 'WhatsApp QR');
  }

  if (
    host === 'paypal.me' ||
    hostMatches(host, 'paypal.com') ||
    hostMatches(host, 'buy.stripe.com') ||
    hostMatches(host, 'checkout.stripe.com')
  ) {
    return match(
      hostMatches(host, 'stripe.com') ? 'Stripe' : 'PayPal',
      'Web Checkout URL',
      'universal-link',
      'Other / Universal Link',
      false
    );
  }

  if (hostMatches(host, 'maps.google.com') || (hostMatches(host, 'google.com') && path.startsWith('/maps'))) {
    return match('Google Maps', 'Map Location', 'location', 'Location / Maps QR');
  }

  if (
    hostMatches(host, 'drive.google.com') ||
    hostMatches(host, 'dropbox.com') ||
    /\.(pdf|docx?|xlsx?|pptx?)($|\?)/i.test(path)
  ) {
    return match(
      hostMatches(host, 'drive.google.com')
        ? 'Google Drive'
        : hostMatches(host, 'dropbox.com')
          ? 'Dropbox'
          : 'Hosted Document',
      'PDF / Document Link',
      'pdf',
      'PDF / Document QR'
    );
  }

  // Platforms & URLs handled seamlessly via Other / Universal Link (Category 13)
  if (host === 't.me' || host === 'tx.me' || hostMatches(host, 'telegram.me') || hostMatches(host, 'telegram.org')) {
    return match('Telegram', 'Profile / Channel / Invite', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'viber.com')) {
    return match('Viber', 'Community / Channel Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'linkedin.com') || host === 'lnkd.in') {
    return match('LinkedIn', 'Profile / Company Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (host === 'x.com' || hostMatches(host, 'twitter.com')) {
    return match('X (Twitter)', 'Profile / Post Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (/^([a-z0-9-]+\.)?pinterest\.[a-z.]{2,}$/.test(host) || host === 'pin.it') {
    return match('Pinterest', 'Profile / Board / Pin', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'reddit.com') || host === 'redd.it') {
    return match('Reddit', 'Subreddit / Profile / Post', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'threads.net') || hostMatches(host, 'threads.com')) {
    return match('Threads', 'Profile / Post Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (host === 'discord.gg' || hostMatches(host, 'discord.com') || hostMatches(host, 'discordapp.com')) {
    return match('Discord', 'Invite / Channel Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'twitch.tv')) {
    return match('Twitch', 'Channel / Stream / Clip', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'vimeo.com')) {
    return match('Vimeo', 'Video / Profile Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (host === 'amzn.to' || /^([a-z0-9-]+\.)?amazon\.[a-z.]{2,}$/.test(host)) {
    return match('Amazon', 'Product / Store Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'myshopify.com')) {
    return match('Shopify', 'Online Store Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (host === 'forms.gle' || (hostMatches(host, 'docs.google.com') && path.includes('/forms'))) {
    return match('Google Forms', 'Online Form / Survey', 'universal-link', 'Other / Universal Link', false);
  }
  if (host === 'g.page' || fullLower.includes('writereview')) {
    return match('Google Business', 'Review / Profile Link', 'universal-link', 'Other / Universal Link', false);
  }
  if (hostMatches(host, 'calendly.com') || hostMatches(host, 'cal.com')) {
    return match('Booking Page', 'Scheduling Link', 'universal-link', 'Other / Universal Link', false);
  }

  return match('Website / Custom Domain', 'Universal Web Link', 'universal-link', 'Other / Universal Link', false);
}

/**
 * Returns the primary field key for categories that accept a single URL / handle.
 */
export function getPrimaryFieldKeyForCategory(categoryId: QrCategoryId): string | null {
  switch (categoryId) {
    case 'url':
    case 'universal-link':
    case 'youtube':
    case 'facebook':
    case 'instagram':
    case 'tiktok':
    case 'snapchat':
    case 'whatsapp':
      return 'url';
    case 'pdf':
      return 'pdfUrl';
    case 'location':
      return 'mapsUrl';
    default:
      return null;
  }
}
