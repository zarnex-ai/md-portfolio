import {handleEnquiry} from '../server/enquiry.js';
import {assets} from './assets.generated.js';
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname==='/api/enquiry')return handleEnquiry(request,env);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
 if(!asset)return new Response('Not found',{status:404});
 const [type,data]=asset;
 const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
 return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':url.pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache'}});
}};
