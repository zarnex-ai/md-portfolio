import {handleEnquiry} from '../../server/enquiry.js';
export default async request=>handleEnquiry(request,process.env);
export const config={path:'/api/enquiry',rateLimit:{windowLimit:5,windowSize:60,aggregateBy:['ip','domain']}};
