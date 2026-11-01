import {readdir,readFile,writeFile,mkdir,copyFile,unlink} from 'node:fs/promises';
import {extname,join} from 'node:path';
import {build} from 'esbuild';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf','.png':'image/png'};
const assets={};
async function walk(dir,prefix=''){for(const e of await readdir(dir,{withFileTypes:true})){const rel=prefix+'/'+e.name;if(e.isDirectory())await walk(join(dir,e.name),rel);else assets[rel]=[types[extname(e.name)]||'application/octet-stream',(await readFile(join(dir,e.name))).toString('base64')]}}
await walk('dist');
await writeFile('worker/assets.generated.js','export const assets='+JSON.stringify(assets)+';');
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await build({entryPoints:['worker/index.js'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'neutral',target:'es2022',minify:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await unlink('worker/assets.generated.js');
