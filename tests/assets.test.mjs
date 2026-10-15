import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {campaigns} from '../src/data.js';
const root=new URL('../public/',import.meta.url);
test('all demo brand assets are present and match provenance hashes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('assets/manifest.json',root),'utf8'));
 assert.equal(manifest.logos.length,campaigns.length);
 for(const logo of manifest.logos){assert.ok(campaigns.some(c=>c.brand===logo.brand));const bytes=await readFile(new URL(logo.path.slice(1),root));assert.ok(bytes.length>50);assert.equal(createHash('sha256').update(bytes).digest('hex'),logo.sha256);}
});
test('all local Nouns avatars and font assets are present',async()=>{
 for(let i=1;i<=24;i++){const svg=await readFile(new URL(`assets/avatars/noun-${String(i).padStart(2,'0')}.svg`,root),'utf8');assert.match(svg,/<svg/);assert.doesNotMatch(svg,/<script\b|(?:href|src)=["']https?:/i);}
 assert.ok((await stat(new URL('assets/fonts/manrope-variable.ttf',root))).size>1000);
});
