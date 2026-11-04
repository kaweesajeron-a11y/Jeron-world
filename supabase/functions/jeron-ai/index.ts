const corsHeaders = { "Access-Control-Allow-Origin": "https://kaweesajeron-a11y.github.io", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const hits = new Map<string, number[]>();
function allowed(ip: string) { const now=Date.now(), recent=(hits.get(ip)||[]).filter(t=>now-t<60000); if(recent.length>=5)return false; recent.push(now); hits.set(ip,recent); return true; }
Deno.serve(async (req: Request) => {
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
 if(origin!=="https://kaweesajeron-a11y.github.io")return Response.json({error:"This website is not allowed to use this service."},{status:403,headers:corsHeaders});
 if(req.method!=="POST")return Response.json({error:"Method not allowed."},{status:405,headers:corsHeaders});
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
 if(!allowed(ip))return Response.json({error:"Too many messages. Please wait a minute and try again."},{status:429,headers:corsHeaders});
 let body:{message?:unknown};try{body=await req.json()}catch{return Response.json({error:"Please send a valid message."},{status:400,headers:corsHeaders})}
 const message=typeof body.message==="string"?body.message.trim():"";
 if(!message||message.length>4000)return Response.json({error:"Your message must be between 1 and 4,000 characters."},{status:400,headers:corsHeaders});
 const apiKey=Deno.env.get("OPENAI_API_KEY");if(!apiKey)return Response.json({error:"The AI service is not configured yet. Please contact the site owner."},{status:503,headers:corsHeaders});
 try{
  const upstream=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({
   model:"gpt-6-astra",tools:[{type:"web_search",search_context_size:"medium"}],tool_choice:"auto",max_output_tokens:1100,
   instructions:"You are JERON AI, the helpful research assistant for Jeron World, founded by Kaweesajeron. Be friendly, clear and accurate. Use web search for current facts, recent entertainment news, or when sources would help. Never claim to access private Facebook, LinkedIn, Quora, or other account-only content. You may summarize publicly available pages found through web search, but do not claim official integrations. Be transparent about uncertainty. Keep answers concise and include useful source links when available.",
   input:message
  })});
  const result=await upstream.json();if(!upstream.ok){console.error("OpenAI API error",upstream.status,JSON.stringify(result).slice(0,1200));return Response.json({error:"The AI provider could not complete that request. Please try again shortly."},{status:502,headers:corsHeaders})}
  const answer=(result.output||[]).filter((item:any)=>item.type==="message").flatMap((item:any)=>item.content||[]).filter((part:any)=>part.type==="output_text").map((part:any)=>part.text||"").join("\n").trim();
  const sources:{title:string;url:string}[]=[];for(const item of result.output||[])for(const part of item.content||[])for(const a of part.annotations||[])if(a.type==="url_citation"&&a.url&&/^https?:\/\//.test(a.url)&&!sources.some(s=>s.url===a.url))sources.push({title:a.title||a.url,url:a.url});
  return Response.json({answer:answer||"I couldn't prepare an answer this time.",sources:sources.slice(0,8)},{headers:corsHeaders});
 }catch(error){console.error("Jeron AI request failed",error);return Response.json({error:"Connection problem. Please try again."},{status:500,headers:corsHeaders})}
});