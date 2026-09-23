import { useEffect, useState } from 'react';
import { recordLearningSession, recordSkillResult } from '../lib/learningProfile';
import { trackEvent } from '../lib/analytics';
import { canvasFont, canvasToPngBlob, drawSiteQrCode, ensureShareFontLoaded, isMobileShareDevice, roundedRect, shareOrDownloadImage } from '../lib/shareImage';
import DesktopShareDialog from './DesktopShareDialog';

type SkillAttempt = { questionId?: string; skillId: string; correctFirstTry: boolean };
type Props = { score?: number; correct?: number; total?: number; stars?: number; attempts?: SkillAttempt[] };

function finiteNumber(value: unknown, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeResult(props: Props) {
  const attempts = Array.isArray(props.attempts) ? props.attempts : [];
  const totalFromAttempts = attempts.length;
  const total = Math.max(0, Math.round(finiteNumber(props.total, totalFromAttempts)));
  const correctFromAttempts = attempts.filter((attempt) => attempt.correctFirstTry).length;
  const correct = Math.min(total, Math.max(0, Math.round(finiteNumber(props.correct, correctFromAttempts))));
  const calculatedScore = total > 0 ? Math.round(correct / total * 100) : 0;
  const score = Math.min(100, Math.max(0, Math.round(finiteNumber(props.score, calculatedScore))));
  const stars = Math.min(3, Math.max(0, Math.round(finiteNumber(props.stars, score >= 90 ? 3 : score >= 70 ? 2 : 1))));
  return { score, correct, total, stars, attempts };
}

async function createResultImage({ score, correct, total, stars }: Props): Promise<Blob> {
    const result = normalizeResult({ score, correct, total, stars });
    await ensureShareFontLoaded();
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Không thể tạo ảnh kết quả');

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#6d28d9'); gradient.addColorStop(0.55, '#7c3aed'); gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalAlpha = 0.13; ctx.fillStyle = '#fff';
    for (let x = 45; x < 1080; x += 80) for (let y = 45; y < 1080; y += 80) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff'; roundedRect(ctx, 80, 75, 920, 930, 54);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6d28d9'; ctx.font = canvasFont(900, 42); ctx.fillText('TRẠNG TOÁN', 540, 170);
    ctx.fillStyle = '#64748b'; ctx.font = canvasFont(700, 25); ctx.fillText('Luyện mỗi ngày · Giỏi từng bước', 540, 215);
    ctx.fillStyle = '#0f172a'; ctx.font = canvasFont(900, 58); ctx.fillText('HOÀN THÀNH BÀI LUYỆN!', 540, 325);

    ctx.fillStyle = '#fef3c7'; roundedRect(ctx, 200, 380, 680, 240, 42);
    ctx.fillStyle = '#92400e'; ctx.font = canvasFont(800, 30); ctx.fillText('ĐIỂM SỐ', 540, 440);
    ctx.fillStyle = '#7c3aed'; ctx.font = canvasFont(900, 120); ctx.fillText(`${result.score}%`, 540, 565);

    ctx.fillStyle = '#f59e0b'; ctx.font = canvasFont(400, 58); ctx.fillText('★'.repeat(result.stars) + '☆'.repeat(Math.max(0, 3 - result.stars)), 540, 700);
    ctx.fillStyle = '#0f172a'; ctx.font = canvasFont(900, 34); ctx.fillText(`Đúng ${result.correct}/${result.total} câu ngay lần đầu`, 540, 775);
    ctx.fillStyle = result.score >= 90 ? '#047857' : result.score >= 70 ? '#0369a1' : '#c2410c'; ctx.font = canvasFont(800, 32);
    ctx.fillText(result.score >= 90 ? 'Thành tích xuất sắc!' : result.score >= 70 ? 'Hoàn thành tốt!' : 'Mỗi lần luyện là một bước tiến!', 540, 835);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(180, 870); ctx.lineTo(900, 870); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569'; ctx.font = canvasFont(700, 25); ctx.fillText('Cùng luyện Toán miễn phí tại', 450, 925);
    ctx.fillStyle = '#6d28d9'; ctx.font = canvasFont(900, 30); ctx.fillText('trangtoan.so1.asia', 450, 966);
    await drawSiteQrCode(ctx, 790, 875, 112);
    ctx.fillStyle = '#64748b'; ctx.font = canvasFont(700, 16); ctx.fillText('Quét để học', 846, 1002);

    return canvasToPngBlob(canvas);
}

export default function ResultShare(props: Props) {
  const result = normalizeResult(props);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [desktopShare, setDesktopShare] = useState<null | { blob: Blob; filename: string; title: string; text: string }>(null);

  useEffect(() => {
    if (!props.attempts?.length) return;
    const marker = `trang-toan:recorded:${location.pathname}:${props.attempts.map((item) => `${item.questionId ?? item.skillId}-${item.correctFirstTry ? 1 : 0}`).join('|')}`;
    if (sessionStorage.getItem(marker)) return;
    result.attempts.forEach((item) => recordSkillResult(item.skillId, item.correctFirstTry));
    recordLearningSession({
      path: location.pathname,
      title: document.title.split(' – ')[0] || 'Bài luyện tập',
      score: result.score,
      correct: result.correct,
      total: result.total,
      stars: result.stars,
    });
    trackEvent('lesson_complete', {
      score: result.score,
      correct_answers: result.correct,
      total_questions: result.total,
      stars: result.stars,
    });
    sessionStorage.setItem(marker, '1');
  }, [props.attempts]);

  async function share() {
    setBusy(true); setMessage('');
    try {
      const blob = await createResultImage(result);
      const shareData = {
        blob,
        filename: `trang-toan-${result.score}-diem.png`,
        title: 'Thành tích Trạng Toán',
        text: `Mình vừa đạt ${result.score}% tại Trạng Toán!`,
      };
      if (!isMobileShareDevice()) {
        setDesktopShare(shareData);
        trackEvent('result_share', { method: 'desktop_dialog', score: result.score });
        return;
      }
      const method = await shareOrDownloadImage(shareData);
      setMessage(method === 'native_share' ? 'Đã mở bảng chia sẻ.' : 'Đã lưu ảnh kết quả về máy.');
      trackEvent('result_share', { method, score: result.score });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessage('Chưa thể chia sẻ. Bé có thể thử lại.');
    } finally { setBusy(false); }
  }

  return <div className="mt-7 rounded-3xl border-2 border-violet-100 bg-gradient-to-r from-violet-50 to-sky-50 p-5">
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:text-left">
      <div><p className="font-black text-violet-800">Khoe thành tích với gia đình</p><p className="mt-1 text-sm font-semibold text-slate-600">Tạo ảnh có điểm số và địa chỉ Trạng Toán.</p></div>
      <button type="button" onClick={share} disabled={busy} className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:opacity-60 sm:w-auto">{busy ? 'Đang tạo ảnh…' : '📤 Chia sẻ kết quả'}</button>
    </div>
    {message && <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p>}
    {desktopShare && <DesktopShareDialog {...desktopShare} onClose={() => setDesktopShare(null)} onAction={(method) => trackEvent('result_share', { method, score: result.score })} />}
  </div>;
}
