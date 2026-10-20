# ALIENS store setup

This repository contains the theme, not the store catalog. Products, inventory, collections, menus, customer accounts, checkout configuration and legal policies are managed in Shopify. Do not commit credentials or customer exports.

## Preview and sync

Run `shopify theme dev --store aliens-apn7njcd.myshopify.com` from the project folder. Use the preview and editor URLs printed by that command. Saving local files updates that development theme. The GitHub-connected theme updates only when changes reach its connected branch. Publishing that connected theme makes future pushes visible to its visitors. Keep experimental changes on a separate development theme or branch.

Use `shopify theme check` before syncing. Confirm changes in the development preview before publishing. Store password protection and theme publication are separate controls; a demo development store can remain password protected.

## Catalog and navigation

1. Add actual products in Shopify **Products**, including descriptions, product types, prices, options, variants, inventory and descriptive image alternative text.
2. Create collections for the categories you sell, such as headbands, hats, caps, helmets and accessories. Publish intended products to the Online Store sales channel.
3. Configure menus in Shopify's navigation/menu area and select them in the header and footer editor settings. Do not leave menus pointing to absent pages.
4. Select products and collections in the ALIENS section pickers. Empty sections may show editor guidance or hide on the storefront; these are not populated demo inventory.
5. Configure native filters using Shopify Search & Discovery. Available filters depend on your catalog and store configuration.

Use owned or licensed product and campaign photography. Add real product media to Shopify and select appropriate desktop/mobile images in the editor. No theme image should be treated as proof of certification or product performance.

## Demo imagery provenance

`assets/aliens-campaign-demo.png` is AI-generated illustrative fashion campaign imagery, not a photograph of actual catalog products. It is supplied for the demo presentation only. Upload owned or licensed photography of your real products in Shopify admin and select it in the relevant sections before presenting products for sale.

## Product metafields

Create product definitions under **Settings → Custom data → Products** (the admin may label this **Metafields and metaobjects**). Use namespace `custom` and the keys below. Populate only relevant products. The specifications section suppresses missing data and formats typed values using Shopify's metafield renderer.

| Key | Suggested definition type | Purpose |
| --- | --- | --- |
| `material` | Single line text | Verified material composition |
| `fit` | Single line text | Fitted, adjustable, or product-specific fit |
| `dimensions` | Multi-line text | Labeled dimensions including units |
| `weight` | Weight | Verified weight with its unit |
| `care_instructions` | Rich text | Product-specific care instructions |
| `certification` | Multi-line text | Verified standards and applicable product/model |
| `technical_specifications` | Rich text | Structured technical detail with readable headings/lists |

Additional size guides can be stored as page references or reusable metaobjects and linked through configurable product information blocks. Define filterable attributes such as color family separately using the types supported by Search & Discovery. The listed custom sections do not automatically consume arbitrary metafields.

**Product specifications** uses the current product unless a product is selected explicitly. Additional specification blocks can be bound to compatible dynamic sources in the editor. Static blocks added to a shared product template appear on every product using that template: use dynamic sources or a separate template for product-specific claims.

**Helmet feature showcase** uses a selected product (or the current product), its image, and optional feature blocks. It can also display material, fit, weight and certification metafields. Enter only substantiated technical and safety information. Leaving a field empty is preferable to an invented claim.

## Recommendations and browsing history

Configure complementary products for each product in Shopify Search & Discovery, then add **Complementary products** to the product template. The section requests Shopify's native complementary recommendations and renders the existing Dawn product cards. It hides when no recommendations are returned. The existing related-products section remains available for related recommendations.

**Recently viewed** is disabled by default in global theme settings. Enable it and include the section on product templates to record visits. It reads and writes history only when Shopify's Customer Privacy API reports `analyticsProcessingAllowed() === true`, including Shopify's region-specific consent determination. If the API cannot load, or processing is not allowed, no history is read or written. The section responds to `visitorConsentCollected` changes, and editor previews do not record visits.

When allowed, it stores up to 20 product handles in this browser's local storage, scoped to the store, and excludes the current product from results. It fetches current public product prices in the active storefront currency, respects the theme currency-code display setting, and links to the product page for variant selection. It does not store customer details or send browsing history to an external service. It is a convenience feature rather than cross-device history; disabled storage, deleted products or network failures can result in no cards. Configure Shopify's customer privacy settings and applicable browser-storage disclosures before enabling it.

## Pages and content

Create the pages you need in Shopify: About, FAQ, Contact, Shipping, Returns, Size and Fit. Assign relevant theme templates and link them in navigation. Create policies from your actual business practices in Shopify policy settings; the theme must not supply invented legal terms. Add approved reviews only, and configure a review provider if you want aggregate ratings. Add social profiles, newsletter copy and merchant contact details in theme settings.

## Default composition and optional sections

The homepage includes the campaign hero, category explorer, actual catalog products,
manifesto, collection editorial, and newsletter. The helmet showcase, discovery,
reviews, and social gallery are present but disabled in the default JSON template.
Enable them after assigning appropriate products, images, collection links, and approved
content. They are also available through **Add section**. Category tiles without a
collection are intentionally unlinked; select their collections in the editor.

The existing store currently contains Shopify's generated snowboard products. These
are shown as actual catalog data, not represented as ALIENS headwear. Add your headwear
products and choose the desired featured collection to replace them.

The current header menu and footer links come from Shopify navigation. Populate those
menus to match the brief. Creating a page template in Git does not create a Shopify Page:
create the page in admin, then assign the corresponding template.

### Campaign image generation record

Asset: `assets/aliens-campaign-demo.png`, 1536 × 1024. Built-in ImageGen was used.
The hero requests responsive CDN sizes for the bundled image. Upload your actual
campaign photograph through the hero image picker to replace it.

Prompt:

> Use case: ads-marketing. Asset type: wide premium headwear ecommerce homepage campaign hero, illustrative DEMO imagery, not actual catalog photography. Generate a photorealistic fashion editorial photograph in landscape 3:2 format. Scene: monumental brutalist warm-gray concrete architecture with spare geometric planes. Subject: one adult fashion model on the right side, wearing a matte black unbranded technical baseball cap and silver-gray structured outerwear, three-quarter waist-up portrait, composed natural pose and serious calm expression. Keep the left half empty, dark neutral concrete in shade, usable for a headline overlay. Frame cap and face completely inside the right half with generous space above. Dramatic natural directional sunlight illuminating the model and creating architectural shadows. Restrained monochromatic palette of charcoal, black, silver gray, warm gray concrete. Real skin texture, tactile woven cap fabric and stitching, premium fashion editorial quality with fine subtle photographic grain. No text, logos, watermarks, neon, planets, helmets, or extra people. No branding or product claims.

## Checks performed during implementation

- Shopify Theme Check: zero errors, eight inherited warnings.
- JSON/schema validation: 72 section definitions, template and block references, range
  increments and select values validated.
- JavaScript syntax validation for all ALIENS scripts.
- Live development preview: homepage, collection and product pages render.
- Homepage quick-add opens the cart drawer; quantity two doubles the subtotal; removing
  the test line restores the empty state. No checkout or purchase was performed.
- Escape closes the cart and returns focus to the triggering add button.
- Availability filtering reduces the sample collection from 13 products to 10.
- Selecting another product variant changes the selected option and variant URL; purchase
  controls re-enable after loading.

The browser view used for these checks was approximately 615px wide. Desktop, small-phone,
assistive technology, newsletter submission, third-party reviews, full checkout and
Core Web Vitals testing remain to be completed with final catalog and content.

## Verification before sharing or launch

- Run theme validation and check the browser console.
- Preview homepage, collection, product, cart, search, blog and support pages at narrow mobile, tablet and desktop widths.
- Check long titles, empty collections, missing imagery, sold-out variants and products with multiple options.
- Verify filters, sorting, pagination, predictive search, variant prices, add-to-cart, quantity updates and removal with real catalog data.
- Confirm cart checkout navigation using Shopify test settings appropriate to the store.
- Check newsletter error/success states and contact form behavior in Shopify.
- Tab through menus, drawers, accordions and purchase controls; confirm visible focus and Escape/focus return for dialogs.
- Verify reduced-motion mode, image descriptions, screen reader labels and contrast.
- Add, duplicate, reorder and reload custom sections in the editor. Confirm each instance updates independently.
- Verify recently viewed cards after browsing several products and with storage disabled; verify no-data recommendation states.
- Confirm that certificate, weight, price, rating and availability content matches merchant evidence and actual store data.
- Run accessibility and Lighthouse checks against the real preview, then review real-user performance after deployment.

Local static checks do not establish live checkout correctness, accessibility conformance, real-world performance, third-party integration readiness, or the accuracy of catalog claims. These require testing in the Shopify store and manual review.
