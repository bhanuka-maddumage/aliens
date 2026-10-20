// Convert ALIENS editor labels into Shopify translation keys. Safe to run again.
import fs from 'node:fs';
const localePath='locales/en.default.schema.json';
const locale=JSON.parse(fs.readFileSync(localePath,'utf8'));
locale.aliens ||= {};
const files=['aliens-hero','benefits-grid','brand-manifesto','category-explorer','collection-editorial','complementary-products','faq-accordion','featured-collections','featured-products','headwear-finder','helmet-feature-showcase','image-hotspots','newsletter-signup','product-comparison','product-discovery','product-specifications','product-story','promotional-banner','recently-viewed','reviews-carousel','social-gallery'];
function translate(object,section,path='') {
  if(Array.isArray(object)) { object.forEach((v,i)=>translate(v,section,`${path}_${i}`));return; }
  if(!object||typeof object!=='object') return;
  for(const [key,value] of Object.entries(object)) {
    if(key==='settings' && !Array.isArray(value)) continue;
    if(['name','label','info','content'].includes(key) && typeof value==='string' && !value.startsWith('t:')) {
      const id=`${path}_${key}`.replace(/^_+/,'');
      locale.aliens[section] ||= {};
      locale.aliens[section][id]=value;
      object[key]=`t:aliens.${section}.${id}`;
    } else if(typeof value==='object') translate(value,section,`${path}_${key}`);
  }
}
for(const file of files) {
  const p=`sections/${file}.liquid`, source=fs.readFileSync(p,'utf8');
  const m=source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  const schema=JSON.parse(m[1]);translate(schema,file.replaceAll('-','_'));
  fs.writeFileSync(p,source.replace(m[0],`{% schema %}\n${JSON.stringify(schema,null,2)}\n{% endschema %}`));
}
const globalPath='config/settings_schema.json';
const globals=JSON.parse(fs.readFileSync(globalPath,'utf8'));
for(const group of globals) if(group.name==='ALIENS design system') translate(group,'design');
fs.writeFileSync(globalPath,JSON.stringify(globals,null,2)+'\n');
for(const file of ['header','announcement-bar']) {
  const p=`sections/${file}.liquid`,source=fs.readFileSync(p,'utf8'),m=source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  const schema=JSON.parse(m[1]);
  schema.settings.forEach(setting=>{
    if(['transparent_home','mega_featured_collection','dismissible'].includes(setting.id)) translate(setting,file.replaceAll('-','_'),setting.id);
  });
  fs.writeFileSync(p,source.replace(m[0],`{% schema %}\n${JSON.stringify(schema,null,2)}\n{% endschema %}`));
}
fs.writeFileSync(localePath,JSON.stringify(locale,null,2)+'\n');
console.log('ALIENS editor controls are translation ready.');
