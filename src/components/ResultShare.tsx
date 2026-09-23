import { useEffect, useState } from 'react';
import { recordLearningSession, recordSkillResult } from '../lib/learningProfile';
import { trackEvent } from '../lib/analytics';

type SkillAttempt = { questionId?: string; skillId: string; correctFirstTry: boolean };
type Props = { score: number; correct: number; total: number; stars: number; attempts?: SkillAttempt[] };
const SITE_URL = 'https://trangtoan.so1.asia';

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function createResultImage({ score, correct, total, stars }: Props): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Không thể tạo ảnh kết quả'));

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#6d28d9'); gradient.addColorStop(0.55, '#7c3aed'); gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
    ctx.globalAlpha = 0.13; ctx.fillStyle = '#fff';
    for (let x = 45; x < 1080; x += 80) for (let y = 45; y < 1080; y += 80) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#fff'; roundedRect(ctx, 80, 75, 920, 930, 54);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6d28d9'; ctx.font = '900 42px Arial'; ctx.fillText('TRẠNG TOÁN', 540, 170);
    ctx.fillStyle = '#64748b'; ctx.font = '700 25px Arial'; ctx.fillText('Luyện mỗi ngày · Giỏi từng bước', 540, 215);
    ctx.fillStyle = '#0f172a'; ctx.font = '900 58px Arial'; ctx.fillText('HOÀN THÀNH BÀI LUYỆN!', 540, 325);

    ctx.fillStyle = '#fef3c7'; roundedRect(ctx, 200, 380, 680, 240, 42);
    ctx.fillStyle = '#92400e'; ctx.font = '800 30px Arial'; ctx.fillText('ĐIỂM SỐ', 540, 440);
    ctx.fillStyle = '#7c3aed'; ctx.font = '900 120px Arial'; ctx.fillText(`${score}%`, 540, 565);

    ctx.fillStyle = '#f59e0b'; ctx.font = '58px Arial'; ctx.fillText('★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars)), 540, 700);
    ctx.fillStyle = '#0f172a'; ctx.font = '900 34px Arial'; ctx.fillText(`Đúng ${correct}/${total} câu ngay lần đầu`, 540, 775);
    ctx.fillStyle = score >= 90 ? '#047857' : score >= 70 ? '#0369a1' : '#c2410c'; ctx.font = '800 32px Arial';
    ctx.fillText(score >= 90 ? 'Thành tích xuất sắc!' : score >= 70 ? 'Hoàn thành tốt!' : 'Mỗi lần luyện là một bước tiến!', 540, 835);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(180, 885); ctx.lineTo(900, 885); ctx.stroke();
    ctx.fillStyle = '#475569'; ctx.font = '700 27px Arial'; ctx.fillText('Cùng luyện Toán miễn phí tại', 540, 930);
    ctx.fillStyle = '#6d28d9'; ctx.font = '900 31px Arial'; ctx.fillText('trangtoan.so1.asia', 540, 970);

    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Không thể xuất ảnh')), 'image/png', 0.95);
  });
}

export default function ResultShare(props: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!props.attempts?.length) return;
    const marker = `trang-toan:recorded:${location.pathname}:${props.attempts.map((item) => `${item.questionId ?? item.skillId}-${item.correctFirstTry ? 1 : 0}`).join('|')}`;
    if (sessionStorage.getItem(marker)) return;
    props.attempts.forEach((item) => recordSkillResult(item.skillId, item.correctFirstTry));
    recordLearningSession({
      path: location.pathname,
      title: document.title.split(' – ')[0] || 'Bài luyện tập',
      score: props.score,
      correct: props.correct,
      total: props.total,
      stars: props.stars,
    });
    trackEvent('lesson_complete', {
      score: props.score,
      correct_answers: props.correct,
      total_questions: props.total,
      stars: props.stars,
    });
    sessionStorage.setItem(marker, '1');
  }, [props.attempts]);

  async function share() {
    setBusy(true); setMessage('');
    try {
      const blob = await createResultImage(props);
      const file = new File([blob], `trang-toan-${props.score}-diem.png`, { type: 'image/png' });
      const data = { title: 'Thành tích Trạng Toán', text: `Mình vừa đạt ${props.score}% tại Trạng Toán!`, url: SITE_URL, files: [file] };
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share(data);
        setMessage('Đã mở bảng chia sẻ.');
        trackEvent('result_share', { method: 'native_share', score: props.score });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); link.download = file.name; link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        setMessage('Đã lưu ảnh kết quả về máy.');
        trackEvent('result_share', { method: 'image_download', score: props.score });
      }
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
  </div>;
}
