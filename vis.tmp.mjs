import { chromium } from 'playwright'
const EXEC='/Users/sneo/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing'
const OUT='/private/tmp/claude-501/-Users-sneo-webApp/448246d9-7abb-4212-9b4a-fd9a522a6fde/scratchpad'
const b=await chromium.launch({executablePath:EXEC})
const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'})
const p=await ctx.newPage()
for (const [name,url] of [['ported-ihi','/international-health-insurance'],['ported-mat','/maternity-insurance']]) {
  await p.goto('http://localhost:3000'+url,{waitUntil:'networkidle'})
  await p.screenshot({path:`${OUT}/${name}.png`, clip:{x:0,y:0,width:1280,height:1200}})
}
// count images on the new homepage vs a ported page
await p.goto('http://localhost:3000/',{waitUntil:'networkidle'})
const home=await p.evaluate(()=>({imgs:document.images.length, svgs:document.querySelectorAll('svg').length}))
await p.goto('http://localhost:3000/international-health-insurance',{waitUntil:'networkidle'})
const ported=await p.evaluate(()=>({imgs:document.images.length, svgs:document.querySelectorAll('svg').length}))
console.log('homepage', JSON.stringify(home), ' ported', JSON.stringify(ported))
await b.close()
