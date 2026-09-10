import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport:{width:1400,height:950}, colorScheme:'dark' });
const p = await ctx.newPage();
for (const [n,u] of [['article','/mags/00000101/quantum/'],['authors','/authors/'],['blog','/blog/']]) {
  await p.goto('http://localhost:4321'+u, {waitUntil:'networkidle'});
  await p.waitForTimeout(700);
  await p.screenshot({ path:`/tmp/shots/v2-${n}.png` });
}
await b.close(); console.log('ok');
