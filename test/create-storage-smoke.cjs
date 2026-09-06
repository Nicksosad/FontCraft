// Generate a real-browser regression page using a dense font exported by FontCraft.
// Usage: node test/create-storage-smoke.cjs font.ttf opentype.js output.html
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const [fontPath, libraryPath, outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('Expected font.ttf opentype.js output.html');
function extract(name) {
 const start = source.search(new RegExp('        (?:async )?function '+name+'\\('));
 const end = source.slice(start+1).search(/\n        (?:async )?function /);
 return source.slice(start,start+1+end);
}
const storage = source.slice(source.indexOf('        const fontStorage ='),source.indexOf('        // Application State'));
const html = `<!doctype html><meta charset="UTF-8"><body><p id="import-font-status"></p><script src="file://${path.resolve(libraryPath)}"></script><script>
${storage}
const STORAGE_KEY='fontcraft-large-regression';
const ALL_CHARS=Array.from({length:94},(_,i)=>String.fromCharCode(i+33));
const state={library:{name:'Dense',chars:{}}};
const els={inputFontName:{},inputFontNameDesktop:{}};
const t=key=>key;
function renderCharacterPicker(){} function updateCanvasView(){} function updateNav(){} function renderPreview(){}
${extract('importedGlyphData')}
${extract('importExistingFont')}
(async()=>{
 const assert=(value,message)=>{if(!value)throw new Error(message)};
 if(location.search.includes('reload')){
  const restored=await fontStorage.read(STORAGE_KEY);
  assert(Object.keys(restored.chars).length===95,'95 characters must survive reload');
  assert(restored.chars['!'].importedOutline.commands.length>5000,'dense outlines must survive reload');
  const fonts=await fontStorage.read(STORAGE_KEY+'-saved');
  assert(fonts[0].chars['©'],'saved font must include the new symbol');
  document.body.textContent='PASS: reload restored dense imported outlines and new drawing';
  return;
 }
 localStorage.setItem(STORAGE_KEY,JSON.stringify({legacy:true}));
 assert((await fontStorage.read(STORAGE_KEY)).legacy,'legacy localStorage should load');
 const bytes=Uint8Array.from(atob('${fs.readFileSync(fontPath).toString('base64')}'),x=>x.charCodeAt(0));
 const input={files:[new File([bytes],'old.ttf')],value:'old.ttf'};
 await importExistingFont({target:input});
 assert(Object.keys(state.library.chars).length===94,document.getElementById('import-font-status').textContent);
 const size=JSON.stringify(state.library).length;
 assert(size>10000000,'fixture must exceed localStorage capacity');
 assert(localStorage.getItem(STORAGE_KEY)===null,'legacy data should only be removed after successful migration');
 state.library.chars['©']={original:'new drawing',cropped:'new drawing'};
 await fontStorage.write(STORAGE_KEY,state.library);
 await fontStorage.write(STORAGE_KEY+'-saved',[state.library]);
 assert((await fontStorage.read(STORAGE_KEY)).chars['©'],'new drawing should persist');
 document.body.textContent='PASS: dense font imported ('+size+' JSON characters), migration, new drawing and saved font persisted';
})().catch(error=>{document.body.textContent='FAIL: '+error.stack});
</script>`;
fs.writeFileSync(outputPath,html);
