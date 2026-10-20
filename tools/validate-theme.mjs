import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
const parse = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\s*\/\*[\s\S]*?\*\//,''));
const sections = new Map();
let checkedSettings = 0;
function validateValue(setting,value,where) {
  if(value===undefined || value===null || (typeof value==='string'&&value.includes('{{'))) return;
  if(setting.type==='range') {
    assert(typeof value==='number'&&value>=setting.min&&value<=setting.max,`${where}: out of range ${value}`);
    const steps=(value-setting.min)/setting.step;
    assert(Math.abs(steps-Math.round(steps))<0.00001,`${where}: ${value} is not a valid step`);
  }
  if(setting.type==='select'||setting.type==='radio') assert(setting.options.some(o=>o.value===value),`${where}: invalid option ${value}`);
  if(setting.type==='checkbox') assert(typeof value==='boolean',`${where}: expected boolean`);
  checkedSettings++;
}
function validateSettings(defs,values,where) {
  const ids=new Set();
  for(const def of defs||[]) {
    if(!def.id) continue;
    assert(!ids.has(def.id),`${where}: duplicate setting ${def.id}`);ids.add(def.id);
    validateValue(def,def.default,`${where}.${def.id} default`);
    validateValue(def,values?.[def.id],`${where}.${def.id}`);
  }
  for(const key of Object.keys(values||{})) assert(ids.has(key),`${where}: unknown setting ${key}`);
}
for(const file of fs.readdirSync(path.join(root,'sections')).filter(f=>f.endsWith('.liquid'))) {
  const source=fs.readFileSync(path.join(root,'sections',file),'utf8');
  const match=source.match(/{%[-\s]*schema\s*[-]?%}([\s\S]*?){%[-\s]*endschema\s*[-]?%}/);
  const schema=match ? JSON.parse(match[1]) : {};
  sections.set(file.replace('.liquid',''),schema);
  validateSettings(schema.settings,{},file);
  for(const block of schema.blocks||[]) validateSettings(block.settings,{},`${file}.${block.type}`);
}
function validateTemplate(file) {
  const template=parse(file);
  for(const [id,instance] of Object.entries(template.sections||{})) {
    const schema=sections.get(instance.type);
    assert(schema,`${file}.${id}: missing section ${instance.type}`);
    validateSettings(schema.settings,instance.settings,file+'.'+id);
    for(const [bid,block] of Object.entries(instance.blocks||{})) {
      const def=schema.blocks?.find(b=>b.type===block.type);
      assert(def,`${file}.${id}.${bid}: missing block ${block.type}`);
      validateSettings(def.settings,block.settings,file+'.'+id+'.'+bid);
    }
    for(const bid of instance.block_order||[]) assert(instance.blocks[bid],`${file}: missing ordered block ${bid}`);
  }
  for(const id of template.order||[]) assert(template.sections[id],`${file}: missing ordered section ${id}`);
}
for(const file of fs.readdirSync(path.join(root,'templates'),{recursive:true}).filter(f=>f.endsWith('.json'))) validateTemplate('templates/'+file);
for(const file of ['sections/header-group.json','sections/footer-group.json']) validateTemplate(file);
const globals=parse('config/settings_schema.json').flatMap(group=>group.settings||[]);
const data=parse('config/settings_data.json');
for(const [name,values] of Object.entries(data.presets||{})) {
  // Shopify-managed settings_data keys aren't setting definitions.
  const filtered=Object.fromEntries(Object.entries(values).filter(([key])=>!['sections','content_for_index','blocks','platform_customizations','color_schemes'].includes(key)));
  validateSettings(globals,filtered,'preset '+name);
}
if(typeof data.current==='object') {
  const filtered=Object.fromEntries(Object.entries(data.current).filter(([key])=>!['sections','content_for_index','blocks','platform_customizations','color_schemes'].includes(key)));
  validateSettings(globals,filtered,'current');
}
console.log(`Validated ${sections.size} section schemas, template/block references and ${checkedSettings} setting values.`);
