type Entry={count:number;reset:number};
const buckets=new Map<string,Entry>();
export function rateLimit(key:string,limit=10,windowMs=60_000){
  const now=Date.now();
  for(const [bucket,entry] of buckets){if(entry.reset<=now)buckets.delete(bucket)}
  const current=buckets.get(key);
  if(!current){buckets.set(key,{count:1,reset:now+windowMs});return {ok:true,remaining:limit-1}}
  current.count+=1;
  return {ok:current.count<=limit,remaining:Math.max(0,limit-current.count)}
}