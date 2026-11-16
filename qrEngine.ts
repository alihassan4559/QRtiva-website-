import QRCode from 'qrcode';
import jsQR from 'jsqr';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type DotStyle = 'square' | 'rounded' | 'dots' | 'diamond';
export type EyeStyle = 'square' | 'rounded' | 'circle';
export type FrameStyle = 'none' | 'minimal' | 'banner-bottom' | 'banner-top';

export interface QrRenderOptions {
  errorCorrectionLevel: ErrorCorrectionLevel;
  fgColor: string;
  bgColor: string;
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  margin: number;
  frameStyle: FrameStyle;
  frameText: string;
  frameColor: string;
  logoDataUrl: string | null;
  logoSizeRatio: number; // 0.14 to 0.26
}

export interface QrMatrix {
  size: number;
  modules: boolean[][];
}

export const DEFAULT_QR_OPTIONS: QrRenderOptions = {
  errorCorrectionLevel: 'M',
  fgColor: '#172033',
  bgColor: '#FFFFFF',
  dotStyle: 'rounded',
  eyeStyle: 'rounded',
  margin: 3,
  frameStyle: 'none',
  frameText: 'SCAN ME',
  frameColor: '#6366F1',
  logoDataUrl: null,
  logoSizeRatio: 0.2,
};

export function generateQrMatrix(
  payload: string,
  errorCorrectionLevel: ErrorCorrectionLevel
): QrMatrix | null {
  const safePayload = payload.trim();
  if (!safePayload) return null;

  try {
    const qr = QRCode.create(safePayload, {
      errorCorrectionLevel,
    });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const modules: boolean[][] = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        row.push(Boolean(data[r * size + c]));
      }
      modules.push(row);
    }

    return { size, modules };
  } catch {
    return null;
  }
}

function isFinderModule(row: number, col: number, size: number): boolean {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

function isLogoMaskZone(
  row: number,
  col: number,
  size: number,
  hasLogo: boolean,
  logoSizeRatio: number
): boolean {
  if (!hasLogo) return false;
  const half = (size * logoSizeRatio) / 2 + 0.8;
  const center = (size - 1) / 2;
  return Math.abs(row - center) <= half && Math.abs(col - center) <= half;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const transform = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return 21;
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getLayoutGeometry(matrixSize: number, options: QrRenderOptions) {
  const unit = 10;
  const quiet = options.margin * unit;
  const qrSize = matrixSize * unit;
  const gridTotal = qrSize + quiet * 2;
  const hasBanner = options.frameStyle === 'banner-bottom' || options.frameStyle === 'banner-top';
  const hasMinimal = options.frameStyle === 'minimal';
  const framePad = hasMinimal || hasBanner ? Math.round(unit * 1.8) : 0;
  const bannerHeight = hasBanner ? Math.round(unit * 5.2) : 0;

  const width = gridTotal + framePad * 2;
  const height = gridTotal + framePad * 2 + bannerHeight;
  const qrOriginX = framePad + quiet;
  const qrOriginY =
    options.frameStyle === 'banner-top'
      ? framePad + bannerHeight + quiet
      : framePad + quiet;

  return {
    unit,
    quiet,
    qrSize,
    gridTotal,
    framePad,
    bannerHeight,
    width,
    height,
    qrOriginX,
    qrOriginY,
  };
}

function svgFinderPattern(
  x: number,
  y: number,
  unit: number,
  fgColor: string,
  bgColor: string,
  eyeStyle: EyeStyle
): string {
  const outerSize = unit * 7;
  const midSize = unit * 5;
  const innerSize = unit * 3;
  const midOffset = unit;
  const innerOffset = unit * 2;

  if (eyeStyle === 'circle') {
    const cx = x + outerSize / 2;
    const cy = y + outerSize / 2;
    return [
      `<circle cx="${cx}" cy="${cy}" r="${outerSize / 2}" fill="${fgColor}" />`,
      `<circle cx="${cx}" cy="${cy}" r="${midSize / 2}" fill="${bgColor}" />`,
      `<circle cx="${cx}" cy="${cy}" r="${innerSize / 2}" fill="${fgColor}" />`,
    ].join('');
  }

  const outerR = eyeStyle === 'rounded' ? unit * 1.7 : 0;
  const midR = eyeStyle === 'rounded' ? unit * 1.1 : 0;
  const innerR = eyeStyle === 'rounded' ? unit * 0.75 : 0;

  return [
    `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${outerR}" fill="${fgColor}" />`,
    `<rect x="${x + midOffset}" y="${y + midOffset}" width="${midSize}" height="${midSize}" rx="${midR}" fill="${bgColor}" />`,
    `<rect x="${x + innerOffset}" y="${y + innerOffset}" width="${innerSize}" height="${innerSize}" rx="${innerR}" fill="${fgColor}" />`,
  ].join('');
}

export function buildQrSvgString(
  matrix: QrMatrix,
  options: QrRenderOptions,
  targetPixelSize = 1024,
  responsivePreview = false
): string {
  const { size, modules } = matrix;
  const geo = getLayoutGeometry(size, options);
  const { unit, width, height, qrOriginX, qrOriginY, framePad, bannerHeight, gridTotal } = geo;
  const hasLogo = Boolean(options.logoDataUrl);

  const elements: string[] = [];

  // Canvas background
  elements.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="${options.bgColor}" />`);

  // Optional Frame
  if (options.frameStyle === 'minimal') {
    elements.push(
      `<rect x="${framePad * 0.4}" y="${framePad * 0.4}" width="${width - framePad * 0.8}" height="${height - framePad * 0.8}" rx="${unit * 1.4}" fill="none" stroke="${options.frameColor}" stroke-width="${unit * 0.55}" />`
    );
  } else if (options.frameStyle === 'banner-bottom' || options.frameStyle === 'banner-top') {
    const borderR = unit * 1.6;
    elements.push(
      `<rect x="${framePad * 0.4}" y="${framePad * 0.4}" width="${width - framePad * 0.8}" height="${height - framePad * 0.8}" rx="${borderR}" fill="none" stroke="${options.frameColor}" stroke-width="${unit * 0.55}" />`
    );
    const bannerY =
      options.frameStyle === 'banner-top'
        ? framePad * 0.4
        : framePad + gridTotal;
    const bannerH = bannerHeight + framePad * 0.6;
    elements.push(
      `<rect x="${framePad * 0.4}" y="${bannerY}" width="${width - framePad * 0.8}" height="${bannerH}" rx="${unit * 1.2}" fill="${options.frameColor}" />`
    );
    const label = escapeXml((options.frameText || 'SCAN ME').toUpperCase().slice(0, 26));
    const textY = bannerY + bannerH / 2 + unit * 0.8;
    elements.push(
      `<text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-weight="700" font-size="${unit * 2.2}" letter-spacing="1.4" fill="#FFFFFF">${label}</text>`
    );
  }

  // Finder eyes
  const finderCoords = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
  for (const [r, c] of finderCoords) {
    elements.push(
      svgFinderPattern(
        qrOriginX + c * unit,
        qrOriginY + r * unit,
        unit,
        options.fgColor,
        options.bgColor,
        options.eyeStyle
      )
    );
  }

  // Data modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;
      if (isFinderModule(r, c, size)) continue;
      if (isLogoMaskZone(r, c, size, hasLogo, options.logoSizeRatio)) continue;

      const x = qrOriginX + c * unit;
      const y = qrOriginY + r * unit;

      if (options.dotStyle === 'dots') {
        elements.push(
          `<circle cx="${x + unit / 2}" cy="${y + unit / 2}" r="${unit * 0.42}" fill="${options.fgColor}" />`
        );
      } else if (options.dotStyle === 'rounded') {
        elements.push(
          `<rect x="${x + unit * 0.06}" y="${y + unit * 0.06}" width="${unit * 0.88}" height="${unit * 0.88}" rx="${unit * 0.28}" fill="${options.fgColor}" />`
        );
      } else if (options.dotStyle === 'diamond') {
        const cx = x + unit / 2;
        const cy = y + unit / 2;
        const d = unit * 0.48;
        elements.push(
          `<polygon points="${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}" fill="${options.fgColor}" />`
        );
      } else {
        elements.push(
          `<rect x="${x}" y="${y}" width="${unit + 0.05}" height="${unit + 0.05}" fill="${options.fgColor}" />`
        );
      }
    }
  }

  // Optional center logo
  if (options.logoDataUrl) {
    const logoDim = size * unit * options.logoSizeRatio;
    const logoX = qrOriginX + (size * unit - logoDim) / 2;
    const logoY = qrOriginY + (size * unit - logoDim) / 2;
    const pad = unit * 0.65;
    elements.push(
      `<rect x="${logoX - pad}" y="${logoY - pad}" width="${logoDim + pad * 2}" height="${logoDim + pad * 2}" rx="${unit * 1.1}" fill="${options.bgColor}" />`
    );
    elements.push(
      `<image href="${escapeXml(options.logoDataUrl)}" x="${logoX}" y="${logoY}" width="${logoDim}" height="${logoDim}" preserveAspectRatio="xMidYMid meet" />`
    );
  }

  const outHeight = Math.round((targetPixelSize * height) / width);
  const sizeAttrs = responsivePreview
    ? `style="width: 100%; height: auto; max-width: 100%; display: block; aspect-ratio: ${width} / ${height};"`
    : `width="${targetPixelSize}" height="${outHeight}"`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" ${sizeAttrs} viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">`,
    ...elements,
    `</svg>`,
  ].join('');
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCanvasFinder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unit: number,
  fgColor: string,
  bgColor: string,
  eyeStyle: EyeStyle
) {
  const outer = unit * 7;
  const mid = unit * 5;
  const inner = unit * 3;

  if (eyeStyle === 'circle') {
    const cx = x + outer / 2;
    const cy = y + outer / 2;
    ctx.fillStyle = fgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, outer / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, mid / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fgColor;
    ctx.beginPath();
    ctx.arc(cx, cy, inner / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const rOuter = eyeStyle === 'rounded' ? unit * 1.7 : 0;
  const rMid = eyeStyle === 'rounded' ? unit * 1.1 : 0;
  const rInner = eyeStyle === 'rounded' ? unit * 0.75 : 0;

  ctx.fillStyle = fgColor;
  drawRoundedRect(ctx, x, y, outer, outer, rOuter);
  ctx.fill();

  ctx.fillStyle = bgColor;
  drawRoundedRect(ctx, x + unit, y + unit, mid, mid, rMid);
  ctx.fill();

  ctx.fillStyle = fgColor;
  drawRoundedRect(ctx, x + unit * 2, y + unit * 2, inner, inner, rInner);
  ctx.fill();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  matrix: QrMatrix,
  options: QrRenderOptions,
  targetWidth = 1024
): Promise<void> {
  const geo = getLayoutGeometry(matrix.size, options);
  const scale = targetWidth / geo.width;
  const outWidth = targetWidth;
  const outHeight = Math.round(geo.height * scale);

  canvas.width = outWidth;
  canvas.height = outHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, outWidth, outHeight);

  const unit = geo.unit * scale;
  const qrOriginX = geo.qrOriginX * scale;
  const qrOriginY = geo.qrOriginY * scale;
  const framePad = geo.framePad * scale;
  const bannerHeight = geo.bannerHeight * scale;
  const gridTotal = geo.gridTotal * scale;

  // Frame
  if (options.frameStyle === 'minimal') {
    ctx.strokeStyle = options.frameColor;
    ctx.lineWidth = unit * 0.55;
    drawRoundedRect(
      ctx,
      framePad * 0.4,
      framePad * 0.4,
      outWidth - framePad * 0.8,
      outHeight - framePad * 0.8,
      unit * 1.4
    );
    ctx.stroke();
  } else if (options.frameStyle === 'banner-bottom' || options.frameStyle === 'banner-top') {
    ctx.strokeStyle = options.frameColor;
    ctx.lineWidth = unit * 0.55;
    drawRoundedRect(
      ctx,
      framePad * 0.4,
      framePad * 0.4,
      outWidth - framePad * 0.8,
      outHeight - framePad * 0.8,
      unit * 1.6
    );
    ctx.stroke();

    const bannerY = options.frameStyle === 'banner-top' ? framePad * 0.4 : framePad + gridTotal;
    const bannerH = bannerHeight + framePad * 0.6;
    ctx.fillStyle = options.frameColor;
    drawRoundedRect(ctx, framePad * 0.4, bannerY, outWidth - framePad * 0.8, bannerH, unit * 1.2);
    ctx.fill();

    const label = (options.frameText || 'SCAN ME').toUpperCase().slice(0, 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${Math.round(unit * 2.2)}px "Plus Jakarta Sans", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, outWidth / 2, bannerY + bannerH / 2);
  }

  // Finder patterns
  const finderCoords = [
    [0, 0],
    [0, matrix.size - 7],
    [matrix.size - 7, 0],
  ];
  for (const [r, c] of finderCoords) {
    drawCanvasFinder(
      ctx,
      qrOriginX + c * unit,
      qrOriginY + r * unit,
      unit,
      options.fgColor,
      options.bgColor,
      options.eyeStyle
    );
  }

  // Data modules
  const hasLogo = Boolean(options.logoDataUrl);
  ctx.fillStyle = options.fgColor;

  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (!matrix.modules[r][c]) continue;
      if (isFinderModule(r, c, matrix.size)) continue;
      if (isLogoMaskZone(r, c, matrix.size, hasLogo, options.logoSizeRatio)) continue;

      const x = qrOriginX + c * unit;
      const y = qrOriginY + r * unit;

      if (options.dotStyle === 'dots') {
        ctx.beginPath();
        ctx.arc(x + unit / 2, y + unit / 2, unit * 0.42, 0, Math.PI * 2);
        ctx.fill();
      } else if (options.dotStyle === 'rounded') {
        drawRoundedRect(ctx, x + unit * 0.06, y + unit * 0.06, unit * 0.88, unit * 0.88, unit * 0.28);
        ctx.fill();
      } else if (options.dotStyle === 'diamond') {
        const cx = x + unit / 2;
        const cy = y + unit / 2;
        const d = unit * 0.48;
        ctx.beginPath();
        ctx.moveTo(cx, cy - d);
        ctx.lineTo(cx + d, cy);
        ctx.lineTo(cx, cy + d);
        ctx.lineTo(cx - d, cy);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x, y, Math.ceil(unit), Math.ceil(unit));
      }
    }
  }

  // Center logo
  if (options.logoDataUrl) {
    try {
      const img = await loadImage(options.logoDataUrl);
      const logoDim = matrix.size * unit * options.logoSizeRatio;
      const logoX = qrOriginX + (matrix.size * unit - logoDim) / 2;
      const logoY = qrOriginY + (matrix.size * unit - logoDim) / 2;
      const pad = unit * 0.65;

      ctx.fillStyle = options.bgColor;
      drawRoundedRect(ctx, logoX - pad, logoY - pad, logoDim + pad * 2, logoDim + pad * 2, unit * 1.1);
      ctx.fill();

      // Preserve aspect ratio within logoDim square
      const ratio = Math.min(logoDim / img.width, logoDim / img.height);
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      ctx.drawImage(
        img,
        logoX + (logoDim - drawW) / 2,
        logoY + (logoDim - drawH) / 2,
        drawW,
        drawH
      );
    } catch {
      // Skip logo drawing if image fails to decode
    }
  }
}

export interface ScannabilityResult {
  verified: boolean;
  exactMatch: boolean;
  contrastRatio: number;
  decodedText: string | null;
}

export async function verifyQrScannable(
  matrix: QrMatrix,
  options: QrRenderOptions,
  expectedPayload?: string
): Promise<ScannabilityResult> {
  const contrastRatio = getContrastRatio(options.fgColor, options.bgColor);
  if (typeof document === 'undefined') {
    return {
      verified: contrastRatio >= 3,
      exactMatch: expectedPayload !== undefined ? contrastRatio >= 3 : true,
      contrastRatio,
      decodedText: null,
    };
  }

  try {
    const canvas = document.createElement('canvas');
    await renderQrToCanvas(canvas, matrix, options, 460);
    const ctx = canvas.getContext('2d');
    if (!ctx) return { verified: false, exactMatch: false, contrastRatio, decodedText: null };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const decoded = jsQR(imageData.data, canvas.width, canvas.height, {
      inversionAttempts: 'attemptBoth',
    });

    const decodedText = decoded?.data ?? null;
    const verified = Boolean(decodedText);
    const exactMatch =
      expectedPayload !== undefined ? decodedText === expectedPayload : verified;

    return {
      verified,
      exactMatch,
      contrastRatio,
      decodedText,
    };
  } catch {
    return { verified: false, exactMatch: false, contrastRatio, decodedText: null };
  }
}

export type ImageQrDecodeResult =
  | {
      ok: true;
      payload: string;
      width: number;
      height: number;
      passUsed: 'native' | 'padded-quiet-zone' | 'high-contrast';
    }
  | {
      ok: false;
      error: string;
    };

function tryJsQr(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const res = jsQR(imgData.data, canvas.width, canvas.height, {
    inversionAttempts: 'attemptBoth',
  });
  return res?.data ?? null;
}

/**
 * Decodes a QR code from an uploaded File (PNG, JPG, WebP, SVG) or data/blob URL.
 * Runs native scale, padded white quiet-zone, and binarized contrast passes so
 * tightly cropped app screenshots (e.g., Easypaisa "My QR" downloads) decode reliably.
 */
export async function decodeQrFromImageSource(
  source: File | string
): Promise<ImageQrDecodeResult> {
  if (typeof document === 'undefined') {
    return { ok: false, error: 'Image QR decoding requires a browser canvas environment.' };
  }

  let objectUrl: string | null = null;
  try {
    const src =
      typeof source === 'string'
        ? source
        : ((objectUrl = URL.createObjectURL(source)), objectUrl);

    const img = await loadImage(src);
    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
    const w = Math.max(1, Math.round((img.width || 300) * scale));
    const h = Math.max(1, Math.round((img.height || 300) * scale));

    // Pass 1: Native scaled image
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Unable to initialize image decoder canvas.' };
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const nativePayload = tryJsQr(canvas);
    if (nativePayload) {
      return { ok: true, payload: nativePayload, width: img.width, height: img.height, passUsed: 'native' };
    }

    // Pass 2: Add explicit white quiet-zone border (helps cropped screenshots)
    const pad = Math.max(32, Math.round(Math.max(w, h) * 0.1));
    const paddedCanvas = document.createElement('canvas');
    paddedCanvas.width = w + pad * 2;
    paddedCanvas.height = h + pad * 2;
    const pCtx = paddedCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#FFFFFF';
      pCtx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
      pCtx.drawImage(canvas, pad, pad);
      const paddedPayload = tryJsQr(paddedCanvas);
      if (paddedPayload) {
        return {
          ok: true,
          payload: paddedPayload,
          width: img.width,
          height: img.height,
          passUsed: 'padded-quiet-zone',
        };
      }

      // Pass 3: High-contrast luminance binarization for tinted/compressed app screenshots
      const binData = pCtx.getImageData(0, 0, paddedCanvas.width, paddedCanvas.height);
      const px = binData.data;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        const v = lum < 145 ? 0 : 255;
        px[i] = v;
        px[i + 1] = v;
        px[i + 2] = v;
        px[i + 3] = 255;
      }
      pCtx.putImageData(binData, 0, 0);
      const contrastPayload = tryJsQr(paddedCanvas);
      if (contrastPayload) {
        return {
          ok: true,
          payload: contrastPayload,
          width: img.width,
          height: img.height,
          passUsed: 'high-contrast',
        };
      }
    }

    return {
      ok: false,
      error:
        'No readable QR code was detected in that image. Upload a clearer screenshot or full QR export without heavy glare or blur.',
    };
  } catch {
    return {
      ok: false,
      error: 'Could not read image file. Please upload a PNG, JPG, WebP, or SVG QR image.',
    };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

export async function downloadQrCode(
  format: 'png' | 'jpg' | 'svg',
  matrix: QrMatrix,
  options: QrRenderOptions,
  pixelSize: number,
  filenameBase = 'qrtiva-qr-code'
): Promise<void> {
  const safeName = filenameBase.toLowerCase().replace(/[^a-z0-9-_]+/g, '-');

  if (format === 'svg') {
    const svg = buildQrSvgString(matrix, options, pixelSize);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, `${safeName}.svg`);
    return;
  }

  const canvas = document.createElement('canvas');
  await renderQrToCanvas(canvas, matrix, options, pixelSize);

  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? 0.96 : 1;

  await new Promise<void>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          triggerDownload(blob, `${safeName}.${format}`);
        }
        resolve();
      },
      mime,
      quality
    );
  });
}

export async function copyQrPngToClipboard(
  matrix: QrMatrix,
  options: QrRenderOptions,
  pixelSize = 1024
): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }
  const canvas = document.createElement('canvas');
  await renderQrToCanvas(canvas, matrix, options, pixelSize);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return false;
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
  return true;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
