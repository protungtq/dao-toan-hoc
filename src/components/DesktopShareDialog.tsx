import { useEffect, useState } from 'react';
import { SITE_URL } from '../lib/shareImage';

type Props = {
  blob: Blob;
  filename: string;
  title: string;
  text: string;
  onClose: () => void;
  onAction?: (method: string) => void;
};

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

export default function DesktopShareDialog({ blob, filename, title, text, onClose, onAction }: Props) {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const caption = `${text}\n${SITE_URL}`;

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  async function copyCaption() {
    await copyText(caption);
    setMessage('Đã sao chép nội dung và liên kết.');
    onAction?.('copy_caption');
  }

  async function openFacebook() {
    await copyText(caption);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`, '_blank', 'noopener,noreferrer,width=720,height=680');
    setMessage('Đã sao chép lời chia sẻ. Hãy dán vào bài viết Facebook nếu cần.');
    onAction?.('facebook');
  }

  function openShareUrl(url: string, method: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
    onAction?.(method);
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
    setMessage('Đã lưu ảnh thành tích về máy.');
    onAction?.('image_download');
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="desktop-share-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-black uppercase tracking-widest text-violet-600">Chia sẻ trên máy tính</p><h2 id="desktop-share-title" className="mt-1 text-2xl font-black text-slate-950">{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-xl font-black text-slate-600 hover:bg-slate-200">×</button>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
          {imageUrl && <img src={imageUrl} alt="Ảnh thành tích chuẩn bị chia sẻ" className="aspect-square w-full rounded-2xl border border-slate-200 object-cover shadow-sm" />}
          <div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700"><p>{text}</p><p className="mt-1 break-all font-black text-violet-700">{SITE_URL}</p></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={copyCaption} className="col-span-2 rounded-2xl bg-violet-600 px-4 py-3 font-black text-white hover:bg-violet-700">📋 Sao chép nội dung và link</button>
              <button type="button" onClick={openFacebook} className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white hover:bg-blue-700">Facebook</button>
              <button type="button" onClick={() => openShareUrl(`https://wa.me/?text=${encodeURIComponent(caption)}`, 'whatsapp')} className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700">WhatsApp</button>
              <button type="button" onClick={() => openShareUrl(`https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(text)}`, 'telegram')} className="rounded-2xl bg-sky-500 px-4 py-3 font-black text-white hover:bg-sky-600">Telegram</button>
              <button type="button" onClick={downloadImage} disabled={!imageUrl} className="rounded-2xl bg-slate-800 px-4 py-3 font-black text-white hover:bg-slate-900 disabled:opacity-50">Tải ảnh PNG</button>
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">Facebook không cho website tự điền lời bài đăng. Trạng Toán sẽ sao chép sẵn nội dung để có thể dán bằng Ctrl + V.</p>
            {message && <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
