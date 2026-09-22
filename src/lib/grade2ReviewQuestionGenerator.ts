export type Grade2ReviewSkillId =
  | 'review-numbers-to-100'
  | 'number-line-neighbors'
  | 'operation-components'
  | 'more-less-difference'
  | 'review-no-carry-calculation';

export type Grade2ReviewAnswer = number | string;
export const GRADE2_REVIEW_SKILL_LABELS: Record<Grade2ReviewSkillId, string> = {
  'review-numbers-to-100': 'Số đến 100',
  'number-line-neighbors': 'Tia số và số liền kề',
  'operation-components': 'Thành phần phép tính',
  'more-less-difference': 'Hơn, kém bao nhiêu',
  'review-no-carry-calculation': 'Cộng trừ không nhớ',
};

type Base = { id: string; skillId: Grade2ReviewSkillId; instruction: string; answers: Grade2ReviewAnswer[]; correctAnswer: Grade2ReviewAnswer; hintSteps: [string,string,string]; explanation: string };
export type NumberQuestion = Base & { type: 'number'; mode: 'place-value'|'compare'|'read'; number?: number; left?: number; right?: number };
export type NumberLineQuestion = Base & { type: 'number-line'; start: number; values: Array<number|null>; focus: number; relation: 'missing'|'before'|'after' };
export type ComponentQuestion = Base & { type: 'component'; operation: 'addition'|'subtraction'; left: number; right: number; result: number; target: 'left'|'right'|'result' };
export type DifferenceQuestion = Base & { type: 'difference'; first: number; second: number; ask: 'more'|'less'; firstIcon: string; secondIcon: string };
export type CalculationQuestion = Base & { type: 'calculation'; operation: 'addition'|'subtraction'; left: number; right: number; layout: 'horizontal'|'vertical' };
export type Grade2ReviewQuestion = NumberQuestion|NumberLineQuestion|ComponentQuestion|DifferenceQuestion|CalculationQuestion;

const NUMBER_NAMES: Record<number,string> = {0:'không',1:'một',2:'hai',3:'ba',4:'bốn',5:'năm',6:'sáu',7:'bảy',8:'tám',9:'chín',10:'mười'};
function numberName(n:number){if(n<=10)return NUMBER_NAMES[n];const tens=Math.floor(n/10),ones=n%10;let text=tens===1?'mười':`${NUMBER_NAMES[tens]} mươi`;if(!ones)return text;if(ones===1&&tens>1)return `${text} mốt`;if(ones===5)return `${text} lăm`;return `${text} ${NUMBER_NAMES[ones]}`}
function ri(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min}
function item<T>(items:readonly T[]):T{return items[ri(0,items.length-1)]}
function shuffle<T>(items:readonly T[]){const a=[...items];for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
function id(type:string){return `${type}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}
function nums(correct:number,min=0,max=100){const s=new Set<number>([correct]);for(const d of [1,-1,10,-10,2,-2]){const v=correct+d;if(v>=min&&v<=max)s.add(v);if(s.size===4)break}let v=min;while(s.size<4){s.add(v);v++}return shuffle([...s].slice(0,4))}

function numberQuestion():NumberQuestion{
  const mode=item(['place-value','compare','read'] as const);
  if(mode==='place-value'){const number=ri(10,99),t=Math.floor(number/10),o=number%10,correct=`${t} chục và ${o} đơn vị`;const candidates=new Set([correct,`${o} chục và ${t} đơn vị`,`${Math.max(0,t-1)} chục và ${o} đơn vị`,`${t} chục và ${(o+1)%10} đơn vị`]);let x=0;while(candidates.size<4){candidates.add(`${t} chục và ${x} đơn vị`);x++}return{id:id('place-value'),type:'number',skillId:'review-numbers-to-100',mode,number,instruction:`Số ${number} gồm mấy chục và mấy đơn vị?`,answers:shuffle([...candidates].slice(0,4)),correctAnswer:correct,hintSteps:['Chữ số bên trái chỉ số chục.','Chữ số bên phải chỉ số đơn vị.',`${number} gồm ${t} chục và ${o} đơn vị.`],explanation:`${number} = ${t} chục và ${o} đơn vị.`}}
  if(mode==='compare'){const left=ri(0,100),right=Math.random()<.2?left:ri(0,100),correct=left>right?'>':left<right?'<':'=';return{id:id('compare'),type:'number',skillId:'review-numbers-to-100',mode,left,right,instruction:'Chọn dấu thích hợp.',answers:shuffle(['<','=','>']),correctAnswer:correct,hintSteps:['So sánh số chục trước.','Nếu số chục bằng nhau, so sánh số đơn vị.',`${left} ${correct} ${right}.`],explanation:`${left} ${correct} ${right}.`}}
  const number=ri(11,99),correct=numberName(number),wrong=new Set<string>();for(const d of [1,-1,10,-10]){const v=number+d;if(v>=0&&v<=100&&v!==number)wrong.add(numberName(v));if(wrong.size===3)break}return{id:id('read'),type:'number',skillId:'review-numbers-to-100',mode,number,instruction:`Số ${number} được đọc như thế nào?`,answers:shuffle([correct,...wrong]),correctAnswer:correct,hintSteps:['Đọc hàng chục trước.','Sau đó đọc hàng đơn vị.',`${number} đọc là “${correct}”.`],explanation:`Số ${number} đọc là “${correct}”.`}
}

function numberLineQuestion():NumberLineQuestion{
  const relation=item(['missing','before','after'] as const),start=ri(0,92),focus=ri(start+1,start+6),values:Array<number|null>=Array.from({length:8},(_,i)=>start+i);let correct:number,instruction:string;
  if(relation==='missing'){const index=ri(1,6);correct=start+index;values[index]=null;instruction='Số nào còn thiếu trên tia số?'}else if(relation==='before'){correct=focus-1;instruction=`Số liền trước ${focus} là số nào?`}else{correct=focus+1;instruction=`Số liền sau ${focus} là số nào?`}
  return{id:id('number-line'),type:'number-line',skillId:'number-line-neighbors',start,values,focus,relation,instruction,answers:nums(correct,0,100),correctAnswer:correct,hintSteps:['Trên tia số, các số tăng thêm 1 từ trái sang phải.',relation==='before'?'Số liền trước nằm ngay bên trái.':relation==='after'?'Số liền sau nằm ngay bên phải.':'Quan sát hai số ở hai bên ô trống.',`Đáp án là ${correct}.`],explanation:`Số cần tìm là ${correct}.`}
}

function componentQuestion():ComponentQuestion{
  const operation=item(['addition','subtraction'] as const),target=item(['left','right','result'] as const);let left:number,right:number,result:number;
  if(operation==='addition'){left=ri(10,60);right=ri(1,30);result=left+right;if(result>100){right=100-left;result=100}}else{left=ri(20,99);right=ri(1,left);result=left-right}
  const labels=operation==='addition'?{left:'Số hạng',right:'Số hạng',result:'Tổng'}:{left:'Số bị trừ',right:'Số trừ',result:'Hiệu'};const value={left,right,result}[target],correct=labels[target];const all=operation==='addition'?['Số hạng','Tổng','Số bị trừ','Hiệu']:['Số bị trừ','Số trừ','Hiệu','Số hạng'];
  return{id:id('component'),type:'component',skillId:'operation-components',operation,left,right,result,target,instruction:`Trong phép tính dưới đây, số ${value} gọi là gì?`,answers:shuffle(all),correctAnswer:correct,hintSteps:[operation==='addition'?'Đây là phép cộng.':'Đây là phép trừ.',operation==='addition'?'Các số được cộng gọi là số hạng; kết quả gọi là tổng.':'Số đứng trước dấu trừ là số bị trừ; số đứng sau là số trừ; kết quả là hiệu.',`Số ${value} là ${correct.toLowerCase()}.`],explanation:`Trong phép tính này, số ${value} là ${correct.toLowerCase()}.`}
}

function differenceQuestion():DifferenceQuestion{
  const first=ri(12,45),difference=ri(2,10),second=first-difference,ask=item(['more','less'] as const);
  return{id:id('difference'),type:'difference',skillId:'more-less-difference',first,second,ask,firstIcon:'🔵',secondIcon:'🟠',instruction:ask==='more'?`Nhóm màu xanh có ${first}, nhóm màu cam có ${second}. Nhóm xanh nhiều hơn bao nhiêu?`:`Nhóm màu cam có ${second}, nhóm màu xanh có ${first}. Nhóm cam ít hơn bao nhiêu?`,answers:nums(difference,0,30),correctAnswer:difference,hintSteps:['Muốn tìm phần hơn hoặc phần kém, ta dùng phép trừ.',`Lấy số lớn ${first} trừ số bé ${second}.`,`${first} − ${second} = ${difference}.`],explanation:`Hai nhóm hơn kém nhau ${first} − ${second} = ${difference}.`}
}

function calculationQuestion():CalculationQuestion{
  const operation=item(['addition','subtraction'] as const),layout=item(['horizontal','vertical'] as const);let left:number,right:number,result:number;
  if(operation==='addition'){const lt=ri(1,8),rt=ri(0,9-lt),lo=ri(0,9),ro=ri(0,9-lo);left=lt*10+lo;right=rt*10+ro;result=left+right}else{const lt=ri(1,9),rt=ri(0,lt),lo=ri(0,9),ro=ri(0,lo);left=lt*10+lo;right=rt*10+ro;result=left-right}
  const sign=operation==='addition'?'+':'−';return{id:id('calculation'),type:'calculation',skillId:'review-no-carry-calculation',operation,left,right,layout,instruction:layout==='vertical'?'Đặt tính rồi tính.':`Tính ${left} ${sign} ${right}.`,answers:nums(result),correctAnswer:result,hintSteps:['Tính hàng đơn vị trước, rồi tính hàng chục.',`Đặt hàng đơn vị thẳng hàng đơn vị.`,`${left} ${sign} ${right} = ${result}.`],explanation:`${left} ${sign} ${right} = ${result}.`}
}

type Factory=()=>Grade2ReviewQuestion;const core:Factory[]=[numberQuestion,numberLineQuestion,componentQuestion,differenceQuestion,calculationQuestion];
function signature(q:Grade2ReviewQuestion){return `${q.type}-${q.instruction}-${String(q.correctAnswer)}`}
export function generateGrade2ReviewQuestions(total:5|10|15=10){const used=new Set<string>();const plan=total===5?core:total===10?[...core,...core]:[...core,...core,...core];return shuffle(plan).map(factory=>{let q=factory(),key=signature(q),tries=0;while(used.has(key)&&tries<30){q=factory();key=signature(q);tries++}used.add(key);return q})}
