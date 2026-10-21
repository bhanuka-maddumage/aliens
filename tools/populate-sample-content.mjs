import fs from 'node:fs';
import path from 'node:path';

// Populate editable theme sections from a saved live-theme backup.
const backup = process.argv[2];
if (!backup) throw new Error('Pass the directory of the live-theme backup.');
const read = file => JSON.parse(fs.readFileSync(path.join(backup, file), 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const image = name => `shopify://shop_images/aliens-web-${name}.png`;
const editorial = (heading, text, photo, extra = {}) => ({ heading, text: `<p>${text}</p>`, image: image(photo), ...extra });
const questions = pairs => ({blocks: Object.fromEntries(pairs.map(([question, answer], i) => [`question${i}`, {type: 'question', settings: {question, answer: `<p>${answer}</p>`}}])), block_order: pairs.map((_,i) => `question${i}`)});

const home = read('templates/index.json');
Object.assign(home.sections.hero.settings, {
  eyebrow: 'ALIENS / THE EVERYDAY EDIT', heading: 'YOUR WORLD.\nYOUR PERSPECTIVE.',
  text: '<p>Headbands, hats and caps with a point of view. Find your signature, then make it your own.</p>',
  image: image('campaign'), mobile_image: image('about'), demo_image: false, overlay: 35,
  caption: 'FOR THE INDIVIDUAL. FOR THE EVERYDAY.', edition: 'THE ALIENS EDIT', height: 85
});
home.sections.hero.blocks.about = {type:'button',settings:{label:'Meet ALIENS',link:'/pages/about',secondary:true}};
home.sections.hero.block_order = ['shop','about'];
Object.assign(home.sections.categories.settings,{layout:'editorial',eyebrow:'THREE WAYS TO FIND YOUR FORM',heading:'CHOOSE YOUR DIRECTION.',text:'<p>Start with a silhouette. Make the rest your own.</p>'});
const categories = [
  ['headbands','headbands','Small details. A fresh point of view.'],
  ['hats-caps','campaign','Your daily signature, from the brim up.'],
  ['helmets','helmets','Explore the helmet concept collection.']
];
categories.forEach(([collection,photo,description],i)=>Object.assign(home.sections.categories.blocks[`category${i}`].settings,{collection,image:image(photo),link:`/collections/${collection}`,description}));
Object.assign(home.sections.manifesto.settings,editorial('A LITTLE DIFFERENT.\nENTIRELY YOU.','ALIENS is a place for individual expression. Clean silhouettes, a quiet palette and room to bring your own perspective. There is no single way to belong.','about',{eyebrow:'THE ALIENS PERSPECTIVE',label:'Our story',link:'/pages/about'}));
Object.assign(home.sections.editorial.settings,editorial('THE FINISHING TOUCH.','A black cap. A cream knit. A simple headband. Build your look around the pieces you keep coming back to.','details',{eyebrow:'THE EVERYDAY EDIT',label:'Explore the collection',link:'/collections/all',image_position:'left'}));
Object.assign(home.sections.newsletter.settings,{eyebrow:'STAY IN OUR ORBIT',heading:'A FRESH PERSPECTIVE.',text:'<p>Sign up for new collection notes, styling ideas and updates from ALIENS.</p>',note:'<p>Join when you like. Unsubscribe whenever you need.</p>'});
write('templates/index.json',home);

const about=read('templates/page.about.json');
Object.assign(about.sections.manifesto.settings,editorial('INDIVIDUAL BY NATURE.','We see headwear as a small canvas for personal style. Something familiar, worn your way. ALIENS brings together considered shapes, a pared-back palette and a different perspective on the everyday.','about',{eyebrow:'MEET ALIENS',large_type:true}));
Object.assign(about.sections.story.settings,editorial('FIND YOUR EVERYDAY.','Start with what feels like you: a twist of fabric, a curved brim, a clean silhouette. Explore the collection, mix it with your favourites and let your own style lead.','details',{eyebrow:'YOUR ROUTINE. YOUR RULES.',label:'Shop all headwear',link:'/collections/all',image_position:'left'}));
write('templates/page.about.json',about);

const faq=read('templates/page.faq.json');
Object.assign(faq.sections.faq,{settings:{eyebrow:'A LITTLE CLARITY',heading:'GOOD QUESTIONS.',text:'<p>Find your way around the ALIENS collection.</p>'},...questions([
 ['What can I find at ALIENS?','Explore three collections: Headbands, Hats & caps, and Helmets. Use the collection links to browse by shape, or view the full edit in Shop all.'],
 ['How do I choose a size?','Check the measurements and fit information on the individual product page. Our <a href="/pages/size-guide">size and fit guide</a> explains where to start. If a measurement is missing, ask us before ordering.'],
 ['Are these the final product photographs?','This preview uses sample products and AI-generated imagery to demonstrate the ALIENS collection. Images are illustrative and may not show every listed colour or detail.'],
 ['Where can I check delivery and returns?','Use the store policy links when available, or <a href="/pages/contact">contact us</a> to confirm the terms that apply to your order.'],
 ['Where can I find helmet specifications?','Use the individual product details and manufacturer documentation to confirm intended use, sizing and certification. The sample helmet listings and concept images do not establish protective performance.'],
 ['How can I ask another question?','Visit our <a href="/pages/contact">contact page</a>. Include the product name and the detail you would like us to clarify.']
 ])});
faq.sections.story={type:'collection-editorial',settings:editorial('FIND YOUR NEXT FAVOURITE.','Explore the shapes, colours and small details that make a look your own.','details',{label:'Browse all headwear',link:'/collections/all'})};
faq.order.push('story'); write('templates/page.faq.json',faq);

const fit=read('templates/page.size-guide.json');
Object.assign(fit.sections.guide,{settings:{eyebrow:'FIND YOUR FIT',heading:'START WITH THE DETAILS.',text:'<p>Product-specific measurements are your best starting point. Shapes and sizing can vary between styles.</p>'},...questions([
 ['Measure for a hat or cap','Use a soft measuring tape around your head where the hat will sit, keeping the tape level. Record the measurement in centimetres and compare it with the size range on the product page.'],
 ['Check the adjustment','Look for the closure and adjustment details on the product page. An adjustable style still has a size range; check it against your measurement.'],
 ['Choose a headband','Consider the band width, material and listed size. Decide whether you prefer a slim accent or a wider shape. Check the product details for stretch and fit information.'],
 ['Choose a helmet','Follow the specific manufacturer sizing and fitting instructions for the activity. Do not use cap sizing or sample imagery to judge a helmet fit. Confirm the product specifications before selecting a helmet.'],
 ['Need more information?','If a size range, measurement or care instruction is missing, <a href="/pages/contact">contact us</a> with the product name before ordering.']
 ])});
fit.sections.story={type:'product-story',settings:editorial('MAKE IT YOUR OWN.','A considered fit starts with the right information. Explore the collection and check the details on the piece you love.','headbands',{label:'Explore headbands',link:'/collections/headbands'})};
fit.order.push('story'); write('templates/page.size-guide.json',fit);

const product=read('templates/product.json');
product.sections.story={type:'product-story',settings:editorial('YOUR STYLE. YOUR SIGNATURE.','Discover the ALIENS perspective: understated colour, distinctive shapes and room for your own expression. Check each product description for the details that matter to you.','details',{eyebrow:'THE ALIENS EDIT',label:'Size & fit guide',link:'/pages/size-guide'})};
product.order.splice(product.order.indexOf('related'),0,'story'); write('templates/product.json',product);

const collection=read('templates/collection.json');
collection.sections.banner.settings.show_collection_image=true;
collection.sections.story={type:'collection-editorial',settings:editorial('A DIFFERENT PERSPECTIVE.','A look does not need a rulebook. Explore the rest of the ALIENS edit and find the pieces that fit your own direction.','about',{eyebrow:'MORE TO EXPLORE',label:'See all headwear',link:'/collections/all'})};
collection.order.push('story'); write('templates/collection.json',collection);

const contact=read('templates/page.contact.json');
contact.sections.story={type:'product-story',settings:editorial('LET’S TALK HEADWEAR.','Questions about a style, a size or a product detail? Send a note using the form below. Include the product name so we can point you in the right direction.','headbands',{eyebrow:'GET IN TOUCH',image_position:'right',padding_top:24,padding_bottom:40})};
contact.order.splice(1,0,'story'); write('templates/page.contact.json',contact);

// Only the three populated categories belong on the collection landing page.
const list=read('templates/list-collections.json');
list.sections={categories:structuredClone(home.sections.categories)};
list.sections.categories.settings.heading='THE COLLECTIONS.';
list.order=['categories']; write('templates/list-collections.json',list);

const footer=read('sections/footer-group.json');
footer.sections.footer.blocks['footer-0'].settings={heading:'Explore',menu:'main-menu'};
footer.sections.footer.blocks['footer-1'].settings={heading:'Good to know',menu:'footer'};
footer.sections.footer.blocks['footer-2'].settings.subtext='<p>Headwear from another perspective.<br>For the individual. For the everyday.</p><p>Explore the ALIENS sample collection.</p>';
write('sections/footer-group.json',footer);
console.log('Updated eight editable templates and the footer.');
