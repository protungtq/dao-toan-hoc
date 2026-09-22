import { useEffect, useMemo, useState } from 'react';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  CARRY100_SKILL_LABELS,
  generateCarryTo100Questions,
  type Carry100Question,
  type Carry100SkillId,
} from '../lib/carryTo100QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type Size = 5 | 10 | 15;
type Result = { questionId: string; skillId: Carry100SkillId; attempts: number; correctFirstTry: boolean };
type Best = { score: number; stars: number };
const STORAGE_KEY = 'trang-toan:lop-2:cong-tru-co-nho-100:best-v1';
const starsFor = (score:number) => score >= 90 ? 3 : score >= 70 ? 2 : 1;

function VerticalCalculation({ question }:{ question:Carry100Question }) {
  return <div className="grid min-h-72 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
    <div className="w-40 rounded-3xl border-4 border-white bg-white px-7 py-5 font-mono text-5xl font-black leading-none shadow-xl shadow-blue-100 sm:w-48 sm:text-6xl">
      <div className="text-right">{question.top}</div>
      <div className="mt-3 flex items-end justify-between"><span className="text-3xl text-blue-600">{question.operation==='addition' ? '+' : '−'}</span><span>{question.bottom}</span></div>
      <div className="mt-3 border-t-4 border-slate-800 pt-3 text-center text-slate-300">?</div>
    </div>
  </div>;
}

export default function CarryTo100Game() {
  const [screen,setScreen]=useState<Screen>('intro');
  const [size,setSize]=useState<Size>(10);
  const [questions,setQuestions]=useState<Carry100Question[]>([]);
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [attempts,setAttempts]=useState(0);
  const [hint,setHint]=useState(0);
  const [canContinue,setCanContinue]=useState(false);
  const [results,setResults]=useState<Result[]>([]);
  const [best,setBest]=useState<Best|null>(null);
  const [reviewMode,setReviewMode]=useState(false);

  useEffect(()=>{
    setQuestions(generateCarryTo100Questions(10));
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved) try { setBest(JSON.parse(saved)); } catch { localStorage.removeItem(STORAGE_KEY); }
  },[]);

  const question=questions[index];
  const progress=questions.length ? (index+1)/questions.length*100 : 0;
  const summary=useMemo(()=>{
    const correct=results.filter(result=>result.correctFirstTry).length;
    const score=results.length ? Math.round(correct/results.length*100) : 0;
    const bySkill=(Object.keys(CARRY100_SKILL_LABELS) as Carry100SkillId[]).map(skillId=>{
      const list=results.filter(result=>result.skillId===skillId);
      return {skillId,total:list.length,correct:list.filter(result=>result.correctFirstTry).length};
    }).filter(item=>item.total);
    return {correct,score,stars:starsFor(score),bySkill};
  },[results]);

  function resetAnswer(){setSelected(null);setAttempts(0);setHint(0);setCanContinue(false)}
  function prepare(nextSize:Size){setSize(nextSize);setQuestions(generateCarryTo100Questions(nextSize));setIndex(0);setResults([]);setReviewMode(false);resetAnswer();setScreen('guide')}
  function choose(answer:number){if(!question||canContinue)return;const next=attempts+1;setAttempts(next);setSelected(answer);if(answer===question.correctAnswer){playCorrectSound();setCanContinue(true);setResults(current=>[...current,{questionId:question.id,skillId:question.skillId,attempts:next,correctFirstTry:next===1}])}else{playWrongSound();setHint(Math.min(next,3))}}
  function next(){if(index<questions.length-1){setIndex(value=>value+1);resetAnswer();return}if(!reviewMode){const score=Math.round(results.filter(result=>result.correctFirstTry).length/questions.length*100);const saved={score,stars:starsFor(score)};if(!best||score>best.score){localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));setBest(saved)}}playFinalSound();setScreen('result')}
  function review(){const ids=new Set(results.filter(result=>!result.correctFirstTry).map(result=>result.questionId));const missed=questions.filter(item=>ids.has(item.id));if(!missed.length)return;setQuestions(missed);setIndex(0);setResults([]);setReviewMode(true);resetAnswer();setScreen('lesson')}
  function answerClass(answer:number){if(selected===answer&&answer!==question.correctAnswer)return'border-red-400 bg-red-50 text-red-700';if(canContinue&&answer===question.correctAnswer)return'border-emerald-400 bg-emerald-50 text-emerald-700';return'border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50'}

  if(!questions.length)return <main className="grid min-h-screen place-items-center text-center"><div><div className="text-7xl">🧮</div><p className="mt-4 text-xl font-black text-blue-700">Sóc Nâu đang chuẩn bị phép tính...</p></div></main>;
  if(screen==='intro')return <main className="mx-auto max-w-5xl px-4 py-8 md:py-12"><a href="/lop-2" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 2</a><section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-blue-100"><div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 p-8 text-white md:p-12"><p className="font-black tracking-widest text-blue-100">Mục 4 · Bài 19–24</p><h1 className="mt-2 text-3xl font-black md:text-5xl">Phép cộng, phép trừ có nhớ trong phạm vi 100</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">Luyện đặt tính và cộng, trừ có nhớ với các số trong phạm vi 100.</p></div><div className="p-6 md:p-10"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['➕','Cộng với một chữ số'],['🧮','Cộng hai chữ số'],['➖','Trừ với một chữ số'],['📝','Trừ hai chữ số']].map(([icon,label])=><div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black">{label}</p></div>)}</div><h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[5,'Luyện nhanh','Ôn nhanh bốn dạng tính'],[10,'Luyện chuẩn','Luyện đều các kỹ năng'],[15,'Thử thách','Tăng cường phản xạ tính toán']] as const).map(([count,title,description])=><button key={count} onClick={()=>prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count===10?'border-blue-400 bg-blue-50 shadow-lg':'border-slate-100'}`}><span className="text-sm font-black text-blue-700">{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>{best&&<p className="mt-6 rounded-2xl bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}</div></section></main>;
  if(screen==='guide')return <main className="mx-auto max-w-4xl px-4 py-10"><section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-blue-100 md:p-10"><div className="flex items-start gap-4"><span className="text-6xl">🐻</span><div><p className="font-black text-blue-700">Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black">Luôn đặt các chữ số cùng hàng thẳng cột</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2"><div className="rounded-3xl bg-blue-50 p-5"><b className="text-blue-700">Khi cộng có nhớ</b><p className="mt-2 font-semibold">Cộng từ hàng đơn vị, viết chữ số hàng đơn vị và nhớ 1 sang hàng chục.</p></div><div className="rounded-3xl bg-violet-50 p-5"><b className="text-violet-700">Khi trừ có nhớ</b><p className="mt-2 font-semibold">Nếu không trừ được, mượn 1 chục thành 10 đơn vị rồi nhớ trả.</p></div></div><button onClick={()=>setScreen('lesson')} className="w-full rounded-2xl bg-blue-600 px-7 py-4 text-lg font-black text-white">Bắt đầu {size} câu</button></section></main>;
  if(screen==='result'){const missed=results.filter(result=>!result.correctFirstTry).length;return <main className="mx-auto max-w-4xl px-4 py-10"><section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-blue-100 md:p-10"><div className="text-7xl">{reviewMode?'💪':'🏅'}</div><p className="mt-4 font-black tracking-widest text-blue-700">{reviewMode?'Hoàn thành lượt ôn lại':'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score>=90?'Bậc thầy đặt tính!':summary.score>=70?'Hoàn thành tốt!':'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1,2,3].map(star=><span key={star} className={star<=summary.stars?'':'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><b className="text-sky-700">Điểm số</b><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><b className="text-emerald-700">Đúng lần đầu</b><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><b className="text-amber-700">Sao nhận được</b><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map(item=>{const percent=Math.round(item.correct/item.total*100);return <div key={item.skillId} className="grid gap-2 border-t px-5 py-4 sm:grid-cols-[1fr_auto]"><div><b>{CARRY100_SKILL_LABELS[item.skillId]}</b><div className="mt-2 h-2 rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent>=70?'bg-emerald-400':'bg-orange-400'}`} style={{width:`${percent}%`}}/></div></div><b>{item.correct}/{item.total}</b></div>})}</div><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode&&missed>0&&<button onClick={review} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={()=>prepare(size)} className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button><a href="/lop-2" className="rounded-2xl border-2 px-6 py-4 font-black">Về lớp 2</a></div></section></main>}
  return <main className="mx-auto max-w-5xl px-4 py-7"><header className="mb-5 flex items-center justify-between gap-20"><button onClick={()=>setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className="font-black text-blue-700">{reviewMode?'Ôn lại · ':''}Câu {index+1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{CARRY100_SKILL_LABELS[question.skillId]}</p></div></header><div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full bg-gradient-to-r from-blue-400 to-indigo-600" style={{width:`${progress}%`}}/></div><section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-blue-100 md:p-9"><div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index%2?'🐻':'🐿️'}</span><div><p className="font-black text-blue-700">{index%2?'Gấu Mật hỏi':'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div><VerticalCalculation question={question}/><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{question.answers.map(answer=><button key={answer} disabled={canContinue} onClick={()=>choose(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-2xl font-black shadow-sm transition ${answerClass(answer)}`}>{answer}</button>)}</div>{selected!==null&&!canContinue&&<div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình đặt tính lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0,hint-1)]}</p><button onClick={()=>setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}{canContinue&&<div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><p className="mt-1 font-semibold">{question.explanation}</p></div><button onClick={next} className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-black text-white sm:w-auto">{index===questions.length-1?'Xem kết quả':'Câu tiếp theo →'}</button></div></div>}</section></main>;
}
