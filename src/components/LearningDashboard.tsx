import { useEffect, useMemo, useState } from 'react';
import { calculateStreak, clearLearningProfile, getSkillProgress, readLearningActivity, type LearningSession, type SkillProgress } from '../lib/learningProfile';
import { trackEvent } from '../lib/analytics';
import { canvasToPngBlob, drawSiteQrCode, isMobileShareDevice, roundedRect, shareOrDownloadImage } from '../lib/shareImage';
import DesktopShareDialog from './DesktopShareDialog';

const SKILL_NAMES: Record<string, string> = {
  'addition-to-10': 'Phép cộng trong phạm vi 10', 'subtraction-to-10': 'Phép trừ trong phạm vi 10',
  'word-problems': 'Bài toán thực tế', 'word-problems-to-20': 'Bài toán thêm – bớt',
  'recognize-shapes': 'Nhận biết hình', 'classify-shapes': 'Phân loại hình', 'compose-shapes': 'Ghép hình',
  'count-to-10': 'Đếm số đến 10', 'compare-numbers-to-10': 'So sánh số đến 10',
  'number-bonds-to-10': 'Tách – gộp số', 'time-calendar': 'Thời gian và lịch',
  'multiplication-concept': 'Khái niệm phép nhân', 'division-concept': 'Khái niệm phép chia',
  'simple-probability': 'Xác suất đơn giản', 'picture-chart': 'Biểu đồ tranh',
};

function skillName(key: string) {
  const id = key.split('::').pop() ?? key;
  return SKILL_NAMES[id] ?? id.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
function formatDate(timestamp: number) { return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp); }

type AchievementImageData = {
  sessions: number;
  questions: number;
  accuracy: number;
  streak: number;
  activeDays: boolean[];
  latest?: LearningSession;
};

function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) result = result.slice(0, -1);
  return `${result.trim()}…`;
}

async function createAchievementImage(data: AchievementImageData) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể tạo ảnh thành tích');

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#4c1d95');
  gradient.addColorStop(0.52, '#7c3aed');
  gradient.addColorStop(1, '#0284c7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#ffffff';
  for (let x = 44; x < 1080; x += 78) for (let y = 44; y < 1080; y += 78) {
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, 65, 55, 950, 970, 56);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6d28d9'; ctx.font = '900 40px Arial'; ctx.fillText('TRẠNG TOÁN', 540, 135);
  ctx.fillStyle = '#0f172a'; ctx.font = '900 50px Arial'; ctx.fillText('THÀNH TÍCH HỌC TẬP', 540, 205);
  ctx.fillStyle = '#64748b'; ctx.font = '700 24px Arial'; ctx.fillText('Luyện mỗi ngày · Giỏi từng bước', 540, 245);

  const metrics = [
    { value: String(data.sessions), label: 'Lượt luyện', color: '#6d28d9', bg: '#f5f3ff' },
    { value: String(data.questions), label: 'Câu đã làm', color: '#0369a1', bg: '#f0f9ff' },
    { value: `${data.accuracy}%`, label: 'Tỷ lệ đúng', color: '#047857', bg: '#ecfdf5' },
    { value: String(data.streak), label: 'Ngày liên tục', color: '#c2410c', bg: '#fff7ed' },
  ];
  metrics.forEach((metric, index) => {
    const x = index % 2 === 0 ? 120 : 560;
    const y = index < 2 ? 290 : 445;
    ctx.fillStyle = metric.bg; roundedRect(ctx, x, y, 400, 125, 28);
    ctx.textAlign = 'left';
    ctx.fillStyle = metric.color; ctx.font = '900 49px Arial'; ctx.fillText(metric.value, x + 30, y + 58);
    ctx.fillStyle = '#475569'; ctx.font = '800 24px Arial'; ctx.fillText(metric.label, x + 30, y + 96);
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a'; ctx.font = '900 27px Arial'; ctx.fillText('7 ngày gần nhất', 120, 625);
  data.activeDays.forEach((active, index) => {
    const x = 150 + index * 126;
    ctx.fillStyle = active ? '#f97316' : '#e2e8f0';
    ctx.beginPath(); ctx.arc(x, 680, 34, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = active ? '#ffffff' : '#94a3b8'; ctx.font = '900 25px Arial';
    ctx.fillText(active ? '✓' : '·', x, 689);
  });

  if (data.latest) {
    ctx.fillStyle = '#f8fafc'; roundedRect(ctx, 120, 742, 840, 105, 25);
    ctx.textAlign = 'left'; ctx.fillStyle = '#64748b'; ctx.font = '800 19px Arial'; ctx.fillText('BÀI GẦN NHẤT', 150, 780);
    ctx.fillStyle = '#0f172a'; ctx.font = '900 25px Arial';
    ctx.fillText(fitText(ctx, data.latest.title, 590), 150, 820);
    ctx.textAlign = 'right'; ctx.fillStyle = data.latest.score >= 70 ? '#047857' : '#c2410c'; ctx.font = '900 34px Arial';
    ctx.fillText(`${data.latest.score}%`, 920, 813);
  }

  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(120, 878); ctx.lineTo(960, 878); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = '#475569'; ctx.font = '700 24px Arial'; ctx.fillText('Cùng luyện Toán miễn phí tại', 425, 935);
  ctx.fillStyle = '#6d28d9'; ctx.font = '900 29px Arial'; ctx.fillText('trangtoan.so1.asia', 425, 976);
  await drawSiteQrCode(ctx, 802, 892, 112);
  ctx.fillStyle = '#64748b'; ctx.font = '700 15px Arial'; ctx.fillText('Quét để học', 858, 1019);

  return canvasToPngBlob(canvas);
}

export default function LearningDashboard() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [skills, setSkills] = useState<Record<string, SkillProgress>>({});
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [desktopShare, setDesktopShare] = useState<null | { blob: Blob; filename: string; title: string; text: string }>(null);
  const load = () => { setSessions(readLearningActivity().sessions); setSkills(getSkillProgress()); };
  useEffect(load, []);
  const summary = useMemo(() => {
    const questions = sessions.reduce((sum, item) => sum + (Number.isFinite(item.total) ? item.total : 0), 0);
    const correct = sessions.reduce((sum, item) => sum + (Number.isFinite(item.correct) ? item.correct : 0), 0);
    const rawAccuracy = questions > 0 ? Math.round(correct / questions * 100) : 0;
    const accuracy = Number.isFinite(rawAccuracy) ? Math.min(100, Math.max(0, rawAccuracy)) : 0;
    return { questions, correct, accuracy, streak: calculateStreak(sessions) };
  }, [sessions]);
  const weakSkills = Object.entries(skills).filter(([, value]) => value.attempts >= 2 && value.mistakes > 0).sort((a, b) => b[1].mistakes / b[1].attempts - a[1].mistakes / a[1].attempts).slice(0, 5);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; return { day, label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date), active: sessions.some((item) => item.day === day) }; });
  function clearData() { if (!confirm('Xóa toàn bộ thành tích và lịch sử luyện tập trên thiết bị này?')) return; clearLearningProfile(); load(); }
  async function shareAchievements() {
    setSharing(true); setShareMessage('');
    try {
      const blob = await createAchievementImage({
        sessions: sessions.length,
        questions: summary.questions,
        accuracy: summary.accuracy,
        streak: summary.streak,
        activeDays: lastSevenDays.map((item) => item.active),
        latest: sessions[0],
      });
      const shareData = {
        blob,
        filename: 'thanh-tich-trang-toan.png',
        title: 'Thành tích học tập trên Trạng Toán',
        text: `Mình đã hoàn thành ${sessions.length} lượt luyện với tỷ lệ đúng ${summary.accuracy}%!`,
      };
      if (!isMobileShareDevice()) {
        setDesktopShare(shareData);
        trackEvent('achievement_share', { method: 'desktop_dialog', sessions: sessions.length, accuracy: summary.accuracy });
        return;
      }
      const method = await shareOrDownloadImage(shareData);
      setShareMessage(method === 'native_share' ? 'Đã mở bảng chia sẻ.' : 'Đã lưu ảnh thành tích về máy.');
      trackEvent('achievement_share', { method, sessions: sessions.length, accuracy: summary.accuracy });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareMessage('Chưa thể tạo ảnh. Bé có thể thử lại.');
    } finally { setSharing(false); }
  }

  if (!sessions.length) return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl"><div className="text-7xl">🌱</div><h2 className="mt-5 text-3xl font-black text-slate-950">Hành trình đang chờ bé bắt đầu</h2><p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-slate-600">Hoàn thành một bài luyện để xem điểm số, chuỗi ngày học và kỹ năng cần củng cố.</p><a href="/lop-1" className="mt-7 inline-flex rounded-2xl bg-violet-600 px-6 py-4 font-black text-white">Chọn bài lớp 1 →</a></div>;

  return <div className="space-y-7">
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[sessions.length,'Lượt luyện','🎯','text-violet-700','bg-violet-50'],[summary.questions,'Câu đã làm','🧠','text-sky-700','bg-sky-50'],[`${summary.accuracy}%`,'Tỷ lệ đúng','🏆','text-emerald-700','bg-emerald-50'],[summary.streak,'Ngày liên tục','🔥','text-orange-700','bg-orange-50']].map(([value,label,icon,text,bg])=><article key={String(label)} className={`rounded-3xl p-5 ${bg}`}><div className="flex items-center justify-between"><span className={`text-3xl font-black ${text}`}>{value}</span><span className="text-3xl">{icon}</span></div><p className="mt-2 font-black text-slate-600">{label}</p></article>)}</section>
    <section className="rounded-[2rem] border border-violet-200 bg-gradient-to-r from-violet-600 to-sky-600 p-5 text-white shadow-lg sm:p-6"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="text-center sm:text-left"><h2 className="text-xl font-black">Chia sẻ hành trình học tập</h2><p className="mt-1 text-sm font-semibold text-violet-100">Tạo ảnh gồm thành tích, chuỗi ngày học và mã QR Trạng Toán.</p></div><button type="button" onClick={shareAchievements} disabled={sharing} className="w-full rounded-2xl bg-white px-6 py-4 font-black text-violet-700 shadow-md transition hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto">{sharing ? 'Đang tạo ảnh…' : '📤 Chia sẻ thành tích'}</button></div>{shareMessage && <p className="mt-3 text-center text-sm font-bold text-white sm:text-left">{shareMessage}</p>}</section>
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-black text-orange-600">Chuỗi ngày học</p><h2 className="mt-1 text-2xl font-black">Mỗi ngày một bước nhỏ</h2></div><span className="text-4xl">🔥</span></div><div className="mt-6 grid grid-cols-7 gap-2">{lastSevenDays.map((item)=><div key={item.day} className="text-center"><div className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl text-lg ${item.active?'bg-orange-500 text-white shadow-lg':'bg-slate-100 text-slate-300'}`}>{item.active?'✓':'·'}</div><p className="mt-2 text-xs font-bold text-slate-500">{item.label}</p></div>)}</div></section>
    <div className="grid gap-7 lg:grid-cols-2"><section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-6 py-5"><h2 className="text-xl font-black">Lịch sử gần đây</h2></div><div className="divide-y">{sessions.slice(0,8).map((item)=><a key={item.id} href={item.path} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-violet-50"><div className="min-w-0"><p className="truncate font-black text-slate-800">{item.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(item.completedAt)} · {item.correct}/{item.total} câu</p></div><span className={`rounded-xl px-3 py-2 font-black ${item.score>=70?'bg-emerald-100 text-emerald-700':'bg-orange-100 text-orange-700'}`}>{item.score}%</span></a>)}</div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Kỹ năng nên luyện thêm</h2><p className="mt-2 text-sm font-medium text-slate-500">Trạng Toán tự ưu tiên những kỹ năng này ở lượt sau.</p><div className="mt-5 space-y-3">{weakSkills.length?weakSkills.map(([key,value])=>{const percent=Math.round((value.attempts-value.mistakes)/value.attempts*100);return <div key={key} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><b>{skillName(key)}</b><b className={percent>=70?'text-emerald-600':'text-orange-600'}>{percent}%</b></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className={percent>=70?'h-full rounded-full bg-emerald-400':'h-full rounded-full bg-orange-400'} style={{width:`${percent}%`}}/></div></div>}):<p className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-700">Chưa có kỹ năng yếu rõ ràng. Bé hãy tiếp tục luyện nhé!</p>}</div></section></div>
    <div className="text-center"><button type="button" onClick={clearData} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600">Xóa dữ liệu học trên thiết bị</button></div>
    {desktopShare && <DesktopShareDialog {...desktopShare} onClose={() => setDesktopShare(null)} onAction={(method) => trackEvent('achievement_share', { method, sessions: sessions.length, accuracy: summary.accuracy })} />}
  </div>;
}
