const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const opentype = require(process.env.OPENTYPE_JS || 'opentype.js');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
function extract(name) {
 const start = html.search(new RegExp('        (?:async )?function '+name+'\\('));
 const rest = html.slice(start + 1);
 const end = rest.search(/\n        (?:async )?function /);
 return html.slice(start, start + 1 + end);
}
const outline = new opentype.Path();
outline.moveTo(100, 0); outline.lineTo(500, 1400); outline.lineTo(900, 0); outline.close();
const font = new opentype.Font({familyName:'OldHandwriting',styleName:'Regular',unitsPerEm:2000,ascender:1500,descender:-500,glyphs:[
 new opentype.Glyph({name:'.notdef',advanceWidth:1000,path:new opentype.Path()}),
 new opentype.Glyph({name:'A',unicode:65,advanceWidth:1100,path:outline}),
 new opentype.Glyph({name:'B',unicode:66,advanceWidth:1100,path:new opentype.Path()})
]});
let blob;
const status = {};
const saved = [];
const sandbox = {opentype, console, Blob, encodeURIComponent, setTimeout, ALL_CHARS:['A','B','©'], font,
 document:{getElementById:()=>status, createElement:()=>({click(){},remove(){}}),body:{appendChild(){},removeChild(){}}},
 URL:{createObjectURL(value){blob=value;return 'blob:test'},revokeObjectURL(){}},
 fontStorage:{async write(key,value){saved.push(value)}}, STORAGE_KEY:'test',
 state:{library:{name:'Current',chars:{'©':{cropped:'drawing'}}}},
 els:{inputFontName:{},inputFontNameDesktop:{}},
 t:key=>key,renderCharacterPicker(){},updateCanvasView(){},updateNav(){},renderPreview(){},
 convertImageToPath:async()=>({opentypePath:outline,advanceWidth:600})
};
vm.createContext(sandbox);
for(const name of ['importedGlyphData','importExistingFont','generateAndDownloadTTF']) vm.runInContext(extract(name),sandbox);
(async()=>{
 const imported = sandbox.importedGlyphData(font,'A');
 assert.equal(imported.importedOutline.advanceWidth,550);
 assert.equal(imported.importedOutline.commands[1].y,700);
 assert.equal(sandbox.importedGlyphData(font,'B'),null);
 assert.equal(sandbox.importedGlyphData(font,'©'),null);
 const input={files:[{name:'old.ttf',size:1000,arrayBuffer:async()=>font.toArrayBuffer()}],value:'old.ttf'};
 await sandbox.importExistingFont({target:input});
 assert.equal(sandbox.state.library.chars['©'].cropped,'drawing');
 assert(sandbox.state.library.chars.A.importedOutline);
 assert(!sandbox.state.library.chars.B);
 assert.equal(input.disabled,false);
 await sandbox.generateAndDownloadTTF(sandbox.state.library,'Combined');
 const exported=opentype.parse(await blob.arrayBuffer());
 assert.equal(exported.charToGlyph('A').advanceWidth,550);
 assert.equal(exported.charToGlyph('A').path.commands[1].y,700);
 assert(exported.charToGlyph('©').path.commands.length>0);
 const before=sandbox.state.library;
 sandbox.state.library={name:'New',chars:{}};
 const unchanged=sandbox.state.library;
 sandbox.fontStorage.write=async()=>{throw new Error('quota')};
 sandbox.console={error(){}};
 await sandbox.importExistingFont({target:input});
 assert.equal(sandbox.state.library,unchanged,'storage failure must leave current work intact');
 console.log('PASS: old outlines and widths preserved, blank glyphs skipped, new drawing merged, exported font parsed, quota failure safe');
})().catch(error=>{console.error(error);process.exitCode=1});
