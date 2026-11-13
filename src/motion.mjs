export const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
export function vascularFrame(position,mobile=false){
 const p=clamp(position,0,2),a=smooth(p),model=smooth((p-1.55)/.45);
 return {step:p<.42?0:p<1.55?1:2,brainOpacity:1-smooth((p-1.2)/.3),arteryOpacity:model,brainZoom:1+a*.36,shiftX:a*(mobile?9:8),shiftY:a*2,modelZoom:.97+model*.03,focus:smooth((p-.25)/.6),context:smooth((p-1.18)/.22)};
}
export function manualPosition(from,to,elapsed,duration){
 const t=clamp(elapsed/duration),through=Math.abs(to-from)>1.1;
 return through?(t<.39?from+(1-from)*smooth(t/.39):t<.57?1:1+(to-1)*smooth((t-.57)/.43)):from+(to-from)*smooth(t);
}
export function gestureDirection(dx,dy){return Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0;}
export function timelinePosition(elapsed,count,duration){
 const segment=duration/count,index=Math.min(count-1,Math.floor(elapsed/segment)),local=elapsed-index*segment;
 return index===count-1?index:index+smooth((local-segment*.62)/(segment*.3));
}
