import QRCode from 'qrcode';

export const SITE_URL = 'https://trangtoan.so1.asia/';
export const SHARE_FONT_FAMILY = '"Be Vietnam Pro", "Segoe UI", Arial, sans-serif';

export function canvasFont(weight: number, size: number) {
  return `${weight} ${size}px ${SHARE_FONT_FAMILY}`;
}

export async function ensureShareFontLoaded() {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('400 24px "Be Vietnam Pro"'),
      document.fonts.load('700 24px "Be Vietnam Pro"'),
      document.fonts.load('800 24px "Be Vietnam Pro"'),
      document.fonts.load('900 24px "Be Vietnam Pro"'),
    ]);
    await document.fonts.ready;
  } catch {
    // Canvas vẫn còn Segoe UI và Arial làm font dự phòng nếu mạng đang ngoại tuyến.
  }
}

export function isMobileShareDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

export async function drawSiteQrCode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, SITE_URL, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(15, 23, 42, 0.14)';
  ctx.shadowBlur = 14;
  roundedRect(ctx, x - 8, y - 8, size + 16, size + 16, 16);
  ctx.shadowColor = 'transparent';
  ctx.drawImage(qrCanvas, x, y, size, size);
  ctx.restore();
}

export function canvasToPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Không thể xuất ảnh'))),
      'image/png',
      0.95,
    );
  });
}

type ShareImageOptions = {
  blob: Blob;
  filename: string;
  title: string;
  text: string;
};

export async function shareOrDownloadImage({ blob, filename, title, text }: ShareImageOptions) {
  const file = new File([blob], filename, { type: 'image/png' });
  const shareData = { title, text, url: SITE_URL, files: [file] };

  if (isMobileShareDevice() && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share(shareData);
    return 'native_share' as const;
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  return 'image_download' as const;
}
