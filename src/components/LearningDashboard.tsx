import { useEffect, useMemo, useState } from 'react';
import { calculateStreak, clearLearningProfile, getSkillProgress, readLearningActivity, type LearningSession, type SkillProgress } from '../lib/learningProfile';

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

export default function LearningDashboard() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [skills, setSkills] = useState<Record<string, SkillProgress>>({});
  const load = () => { setSessions(readLearningActivity().sessions); setSkills(getSkillProgress()); };
  useEffect(load, []);
  const summary = useMemo(() => {
    const questions = sessions.reduce((sum, item) => sum + item.total, 0);
    const correct = sessions.reduce((sum, item) => sum + item.correct, 0);
    return { questions, correct, accuracy: questions ? Math.round(correct / questions * 100) : 0, streak: calculateStreak(sessions) };
  }, [sessions]);
  const weakSkills = Object.entries(skills).filter(([, value]) => value.attempts >= 2 && value.mistakes > 0).sort((a, b) => b[1].mistakes / b[1].attempts - a[1].mistakes / a[1].attempts).slice(0, 5);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; return { day, label: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date), active: sessions.some((item) => item.day === day) }; });
  function clearData() { if (!confirm('Xóa toàn bộ thành tích và lịch sử luyện tập trên thiết bị này?')) return; clearLearningProfile(); load(); }

  if (!sessions.length) return <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl"><div className="text-7xl">🌱</div><h2 className="mt-5 text-3xl font-black text-slate-950">Hành trình đang chờ bé bắt đầu</h2><p className="mx-auto mt-3 max-w-xl font-medium leading-7 text-slate-600">Hoàn thành một bài luyện để xem điểm số, chuỗi ngày học và kỹ năng cần củng cố.</p><a href="/lop-1" className="mt-7 inline-flex rounded-2xl bg-violet-600 px-6 py-4 font-black text-white">Chọn bài lớp 1 →</a></div>;

  return <div className="space-y-7">
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[sessions.length,'Lượt luyện','🎯','text-violet-700','bg-violet-50'],[summary.questions,'Câu đã làm','🧠','text-sky-700','bg-sky-50'],[`${summary.accuracy}%`,'Tỷ lệ đúng','🏆','text-emerald-700','bg-emerald-50'],[summary.streak,'Ngày liên tục','🔥','text-orange-700','bg-orange-50']].map(([value,label,icon,text,bg])=><article key={String(label)} className={`rounded-3xl p-5 ${bg}`}><div className="flex items-center justify-between"><span className={`text-3xl font-black ${text}`}>{value}</span><span className="text-3xl">{icon}</span></div><p className="mt-2 font-black text-slate-600">{label}</p></article>)}</section>
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-black text-orange-600">Chuỗi ngày học</p><h2 className="mt-1 text-2xl font-black">Mỗi ngày một bước nhỏ</h2></div><span className="text-4xl">🔥</span></div><div className="mt-6 grid grid-cols-7 gap-2">{lastSevenDays.map((item)=><div key={item.day} className="text-center"><div className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl text-lg ${item.active?'bg-orange-500 text-white shadow-lg':'bg-slate-100 text-slate-300'}`}>{item.active?'✓':'·'}</div><p className="mt-2 text-xs font-bold text-slate-500">{item.label}</p></div>)}</div></section>
    <div className="grid gap-7 lg:grid-cols-2"><section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><div className="border-b bg-slate-50 px-6 py-5"><h2 className="text-xl font-black">Lịch sử gần đây</h2></div><div className="divide-y">{sessions.slice(0,8).map((item)=><a key={item.id} href={item.path} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-violet-50"><div className="min-w-0"><p className="truncate font-black text-slate-800">{item.title}</p><p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(item.completedAt)} · {item.correct}/{item.total} câu</p></div><span className={`rounded-xl px-3 py-2 font-black ${item.score>=70?'bg-emerald-100 text-emerald-700':'bg-orange-100 text-orange-700'}`}>{item.score}%</span></a>)}</div></section>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Kỹ năng nên luyện thêm</h2><p className="mt-2 text-sm font-medium text-slate-500">Trạng Toán tự ưu tiên những kỹ năng này ở lượt sau.</p><div className="mt-5 space-y-3">{weakSkills.length?weakSkills.map(([key,value])=>{const percent=Math.round((value.attempts-value.mistakes)/value.attempts*100);return <div key={key} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><b>{skillName(key)}</b><b className={percent>=70?'text-emerald-600':'text-orange-600'}>{percent}%</b></div><div className="mt-3 h-2 rounded-full bg-slate-200"><div className={percent>=70?'h-full rounded-full bg-emerald-400':'h-full rounded-full bg-orange-400'} style={{width:`${percent}%`}}/></div></div>}):<p className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-700">Chưa có kỹ năng yếu rõ ràng. Bé hãy tiếp tục luyện nhé!</p>}</div></section></div>
    <div className="text-center"><button type="button" onClick={clearData} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600">Xóa dữ liệu học trên thiết bị</button></div>
  </div>;
}
