export const services = ['AI & agentic automation','Voice AI systems','Full-stack web development','RAG & document intelligence','Other / let’s discuss'];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function handleEnquiry(request,env,send=fetch){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const origin=request.headers.get('Origin');
 if(origin && origin!==new URL(request.url).origin)return json({error:'Request origin not allowed'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Expected JSON'},415);
 if(Number(request.headers.get('content-length'))>16000)return json({error:'Request too large'},413);
 let data;
 try {const raw=await request.text();if(raw.length>16000)return json({error:'Request too large'},413);data=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Invalid request'},400);
 if(data.website)return json({error:'Unable to submit this request'},400);
 const field=(k,max)=>typeof data[k]==='string'&&data[k].trim().length<=max?data[k].trim():null;
 const name=field('name',100),email=field('email',254),service=field('service',100),message=field('message',5000),company=field('company',150),budget=field('budget',100),timeline=field('timeline',100);
 if(!name||/[\r\n]/.test(name)||!email||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!services.includes(service)||!message||message.length<20||company===null||budget===null||timeline===null)return json({error:'Please check your details and include at least 20 characters about your project.'},400);
 if(!env.RESEND_API_KEY||!env.RESEND_FROM_EMAIL)return json({error:'The enquiry form is not connected yet. Please email aashiqmustak5969@gmail.com directly.'},503);
 const text=[`New freelance service enquiry`,`Name: ${name}`,`Email: ${email}`,`Company: ${company||'Not provided'}`,`Service: ${service}`,`Budget: ${budget||'Not specified'}`,`Timeline: ${timeline||'Not specified'}`,'',message].join('\n');
 try{
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.RESEND_FROM_EMAIL,to:['aashiqmustak5969@gmail.com'],reply_to:email,subject:`Freelance enquiry: ${service}`,text}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return json({error:'Your request could not be sent. Please try again or email me directly.'},502);
  const result=await response.json();if(!result.id)return json({error:'Email confirmation was not received. Please email me directly.'},502);
  return json({success:true});
 }catch{return json({error:'The email service is temporarily unavailable. Please try again or email me directly.'},502)}
}
