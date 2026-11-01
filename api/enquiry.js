import { handleEnquiry } from '../server/enquiry.js';

export async function POST(request) {
  return handleEnquiry(request, process.env);
}

export default async function handler(req, res) {
  if (!res && req instanceof Request) {
    return handleEnquiry(req, process.env);
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost';
  const url = `${proto}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const body = typeof req.body === 'string'
    ? req.body
    : req.body ? JSON.stringify(req.body) : undefined;

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
  });

  const response = await handleEnquiry(webRequest, process.env);
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const data = await response.text();
  res.end(data);
}

