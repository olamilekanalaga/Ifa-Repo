import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioProjects} from '../src/portfolioProjects.js';
import {campaigns} from '../src/data.js';
import {entryPage} from '../src/workspaceUi.js';
import {createDemoWorkspaceApi} from '../src/workspaceModel.js';
test('all 22 Portfolio projects have sample campaigns and showcase logos without historical duplicates',()=>{assert.equal(portfolioProjects.length,22);assert.equal(new Set(campaigns.map(c=>c.id)).size,32);const page=entryPage(createDemoWorkspaceApi({getItem:()=>null,setItem:()=>{},removeItem:()=>{}}),{});for(const p of portfolioProjects){assert.ok(!['breshna','send','print3r'].includes(p.id));const c=campaigns.find(c=>c.id===p.id);assert.equal(c.simulation,true);assert.equal(c.logoPath,p.logoPath);assert.match(c.description,/Sample brief/);assert.ok(page.includes(p.logoPath));assert.ok(c.pool>0);} });
