export const services = ['AI & agentic automation','Voice AI systems','Full-stack web development','RAG & document intelligence','Other / let’s discuss'];
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function handleEnquiry(request,env,send=fetch){
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const origin=request.headers.get('Origin');
 const rawHost=(request.headers.get('x-forwarded-host')?.split(',')[0]||request.headers.get('host'))?.trim();
 const host=rawHost?.replace(/:(443|80)$/,'');
 const proto=request.headers.get('x-forwarded-proto')||(origin?.startsWith('http://')?'http':'https');
 const expectedOrigin=host?`${proto}://${host}`:new URL(request.url).origin;
 if(origin && origin!==expectedOrigin && origin!==`${proto}://${rawHost}` && origin!==new URL(request.url).origin)return json({error:'Request origin not allowed'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Expected JSON'},415);
 if(Number(request.headers.get('content-length'))>16000)return json({error:'Request too large'},413);
 let data;
 try {const raw=await request.text();if(raw.length>16000)return json({error:'Request too large'},413);data=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'Invalid request'},400);
 if(data.website)return json({error:'Unable to submit this request'},400);
 const field=(k,max)=>typeof data[k]==='string'&&data[k].trim().length<=max?data[k].trim():null;
 const name=field('name',100),email=field('email',254),service=field('service',100),message=field('message',5000),company=field('company',150),budget=field('budget',100),timeline=field('timeline',100);
 if(!name||/[\r\n]/.test(name)||!email||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!services.includes(service)||!message||message.length<20||company===null||budget===null||timeline===null)return json({error:'Please check your details and include at least 20 characters about your project.'},400);
 if(!env.RESEND_API_KEY)return json({error:'The enquiry form is not connected yet. Please email aashiqmustak5969@gmail.com directly.'},503);
 const text=[`New freelance service enquiry`,`Name: ${name}`,`Email: ${email}`,`Company: ${company||'Not provided'}`,`Service: ${service}`,`Budget: ${budget||'Not specified'}`,`Timeline: ${timeline||'Not specified'}`,'',message].join('\n');
 try{
  const apiKey = env.RESEND_API_KEY.trim();
  let fromEmail = (env.RESEND_FROM_EMAIL || 'Mohammed Aashiq <support@zarnexai.in>').trim();
  if (fromEmail.includes('@gmail.com') || fromEmail === '') {
    fromEmail = 'Mohammed Aashiq <support@zarnexai.in>';
  }
  const response=await send('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from:fromEmail,to:['aashiqmustak5969@gmail.com'],reply_to:email,subject:`Freelance enquiry: ${service}`,text}),signal:AbortSignal.timeout(12000)});
  if(!response.ok){
    const errText = await response.text().catch(()=>'');
    console.error('Resend API error:', response.status, errText);
    return json({error:'Your request could not be sent. Please try again or email me directly.'},502);
  }
  const result=await response.json();if(!result.id)return json({error:'Email confirmation was not received. Please email me directly.'},502);

  try {
    const clientSubject = `Thanks for reaching out, ${name} | Mohammed Aashiq`;
    const clientText = [
      `Hi ${name},`,
      '',
      `Thank you for getting in touch through my portfolio website!`,
      '',
      `I've successfully received your project enquiry regarding "${service}". Here is a summary of the details you submitted:`,
      '',
      `• Service: ${service}`,
      `• Company: ${company || 'Not provided'}`,
      `• Budget: ${budget || 'Let’s discuss'}`,
      `• Timeline: ${timeline || 'Flexible'}`,
      '',
      `Project Scope / Message:`,
      message,
      '',
      `I review every project enquiry personally and will reply back to this email thread within 24 hours to discuss the next steps and technical details.`,
      '',
      `If you have any briefs, documents, or additional questions in the meantime, simply reply directly to this email.`,
      '',
      `Best regards,`,
      `Mohammed Aashiq`,
      `Zarnex.ai`
    ].join('\n');

    const clientHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background:#f5f5f3;font-family:-apple-system,BlinkMacSystemFont,'DM Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#191919;">
  <div style="max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #dededb;border-top:3px solid #ff5330;padding:32px 28px;">
    <div style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:10px;letter-spacing:1.2px;color:#ff5330;margin-bottom:16px;">
      ● 06 / FREELANCE ENQUIRY RECEIVED
    </div>
    <h2 style="margin:0 0 12px;font-size:22px;font-weight:600;letter-spacing:-0.5px;color:#191919;line-height:1.3;">
      Thanks for reaching out, ${esc(name)}.
    </h2>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#575757;">
      I've received your project details and will review them personally. I’ll reply back within 24 hours to discuss the scope and next steps.
    </p>

    <div style="background:#fafaf9;border:1px solid #dededb;padding:20px;margin:24px 0;">
      <div style="font-family:'IBM Plex Mono',Menlo,Consolas,monospace;font-size:9px;letter-spacing:1px;color:#707070;border-bottom:1px solid #e8e8e4;padding-bottom:10px;margin-bottom:14px;text-transform:uppercase;">
        YOUR PROJECT SUMMARY
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px;">
        <tr>
          <td style="padding:4px 0;color:#707070;width:90px;font-family:'IBM Plex Mono',monospace;font-size:10px;">SERVICE</td>
          <td style="padding:4px 0;color:#ff5330;font-weight:600;">${esc(service)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#707070;font-family:'IBM Plex Mono',monospace;font-size:10px;">COMPANY</td>
          <td style="padding:4px 0;color:#191919;">${esc(company || 'Not provided')}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#707070;font-family:'IBM Plex Mono',monospace;font-size:10px;">BUDGET</td>
          <td style="padding:4px 0;color:#191919;">${esc(budget || 'Let’s discuss')}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#707070;font-family:'IBM Plex Mono',monospace;font-size:10px;">TIMELINE</td>
          <td style="padding:4px 0;color:#191919;">${esc(timeline || 'Flexible')}</td>
        </tr>
      </table>
      <div style="border-top:1px solid #e8e8e4;padding-top:12px;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:1px;color:#707070;margin-bottom:6px;">MESSAGE / SCOPE</div>
        <div style="font-size:13px;line-height:1.6;color:#333333;white-space:pre-wrap;">${esc(message)}</div>
      </div>
    </div>

    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#575757;">
      If you have wireframes, docs, or extra questions in the meantime, simply reply directly to this email.
    </p>

    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #dededb;">
      <div style="font-size:14px;font-weight:600;color:#191919;">Mohammed Aashiq</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#707070;margin-top:3px;">
        AI & Full-Stack Engineering • <a href="https://zarnexai.in" style="color:#ff5330;text-decoration:none;">zarnexai.in</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        reply_to: 'aashiqmustak5969@gmail.com',
        subject: clientSubject,
        text: clientText,
        html: clientHtml
      }),
      signal: AbortSignal.timeout(12000)
    }).catch(err => {
      console.error('Client auto-reply failed:', err);
    });
  } catch (err) {
    console.error('Client auto-reply error:', err);
  }

  return json({success:true});
 }catch(err){
  console.error('Enquiry error:', err);
  return json({error:'The email service is temporarily unavailable. Please try again or email me directly.'},502)
 }
}
