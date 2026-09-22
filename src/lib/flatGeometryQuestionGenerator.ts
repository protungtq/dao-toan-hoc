export type FlatGeometrySkillId='points-and-lines'|'broken-line'|'quadrilateral';
export type FlatGeometryAnswer=number|string;
export const FLAT_GEOMETRY_SKILL_LABELS:Record<FlatGeometrySkillId,string>={
  'points-and-lines':'Điểm và các loại đường',
  'broken-line':'Đường gấp khúc',
  'quadrilateral':'Hình tứ giác',
};

type Base={id:string;skillId:FlatGeometrySkillId;instruction:string;answers:FlatGeometryAnswer[];correctAnswer:FlatGeometryAnswer;hintSteps:[string,string,string];explanation:string};
export type LineQuestion=Base&{type:'line';lineKind:'Đoạn thẳng'|'Đường thẳng'|'Đường cong';labels:string[]};
export type PointQuestion=Base&{type:'points';pointCount:number;labels:string[]};
export type BrokenQuestion=Base&{type:'broken';mode:'segments'|'length';lengths:number[]};
export type PolygonQuestion=Base&{type:'polygon';sides:3|4|5;variant:number};
export type FlatGeometryQuestion=LineQuestion|PointQuestion|BrokenQuestion|PolygonQuestion;

function ri(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min}
function shuffle<T>(values:readonly T[]){const result=[...values];for(let i=result.length-1;i>0;i--){const j=ri(0,i);[result[i],result[j]]=[result[j],result[i]]}return result}
function id(prefix:string){return`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function numberAnswers(correct:number,max=30){const values=new Set([correct]);for(const offset of shuffle([1,-1,2,-2,3,-3])){const value=correct+offset;if(value>=1&&value<=max)values.add(value);if(values.size===4)break}return shuffle([...values])}

function lineQuestion():LineQuestion{
  const lineKind=shuffle(['Đoạn thẳng','Đường thẳng','Đường cong']as const)[0];
  const explanation=lineKind==='Đoạn thẳng'?'Đoạn thẳng có hai đầu mút.':lineKind==='Đường thẳng'?'Đường thẳng kéo dài về cả hai phía.':'Đường cong không đi thẳng theo một hướng.';
  return{id:id('line'),type:'line',skillId:'points-and-lines',lineKind,labels:['A','B'],instruction:'Hình vẽ dưới đây biểu diễn loại đường nào?',answers:shuffle(['Đoạn thẳng','Đường thẳng','Đường cong']),correctAnswer:lineKind,hintSteps:['Quan sát đường có thẳng hay uốn cong.','Nếu là đường thẳng, hãy xem nó có hai đầu mút hay kéo dài hai phía.',explanation],explanation};
}
function pointQuestion():PointQuestion{
  const pointCount=ri(3,5),labels='ABCDE'.slice(0,pointCount).split('');
  return{id:id('points'),type:'points',skillId:'points-and-lines',pointCount,labels,instruction:'Có bao nhiêu điểm nằm trên đường thẳng?',answers:numberAnswers(pointCount,8),correctAnswer:pointCount,hintSteps:['Mỗi chấm tròn biểu diễn một điểm.','Đếm lần lượt các điểm từ trái sang phải.',`Có ${pointCount} điểm: ${labels.join(', ')}.`],explanation:`Các điểm ${labels.join(', ')} đều nằm trên đường thẳng, nên có ${pointCount} điểm.`};
}
function brokenQuestion(mode:'segments'|'length'):BrokenQuestion{
  const count=ri(3,5),lengths=Array.from({length:count},()=>ri(2,7)),total=lengths.reduce((sum,value)=>sum+value,0),correct=mode==='segments'?count:total;
  return{id:id(`broken-${mode}`),type:'broken',skillId:'broken-line',mode,lengths,instruction:mode==='segments'?'Đường gấp khúc có bao nhiêu đoạn thẳng?':'Đường gấp khúc dài bao nhiêu xăng-ti-mét?',answers:numberAnswers(correct,40),correctAnswer:correct,hintSteps:[mode==='segments'?'Đếm từng đoạn nối giữa hai đỉnh.':'Đọc độ dài ghi trên từng đoạn.',mode==='segments'?`Có ${count+1} đỉnh liên tiếp.`:`Cộng các độ dài: ${lengths.join(' + ')}.`,mode==='segments'?`Số đoạn thẳng là ${count}.`:`${lengths.join(' + ')} = ${total} cm.`],explanation:mode==='segments'?`Đường gấp khúc gồm ${count} đoạn thẳng.`:`Tổng độ dài là ${lengths.join(' + ')} = ${total} cm.`};
}
function polygonQuestion():PolygonQuestion{
  const sides=shuffle([3,4,5]as const)[0],name=sides===3?'hình tam giác':sides===4?'hình tứ giác':'hình có năm cạnh';
  return{id:id('polygon'),type:'polygon',skillId:'quadrilateral',sides,variant:ri(0,2),instruction:'Hình dưới đây có bao nhiêu cạnh?',answers:shuffle([3,4,5,6]),correctAnswer:sides,hintSteps:['Đi theo đường bao quanh hình.','Đếm mỗi đoạn thẳng trên đường bao là một cạnh.',`Hình có ${sides} cạnh, đó là ${name}.`],explanation:`Hình có ${sides} cạnh${sides===4?', nên đây là hình tứ giác':''}.`};
}
type Factory=()=>FlatGeometryQuestion;
const factories:Factory[]=[lineQuestion,pointQuestion,()=>brokenQuestion('segments'),()=>brokenQuestion('length'),polygonQuestion];
export function generateFlatGeometryQuestions(total:5|10|15=10){const plan=Array.from({length:total},(_,index)=>factories[index%factories.length]);return shuffle(plan).map(factory=>factory())}
