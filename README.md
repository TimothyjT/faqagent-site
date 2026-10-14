# Website FAQ & Lead Capture Agent — standalone product site

The standalone website for Website FAQ & Lead Capture Agent, a product by [Northbeam Builds](https://northbeambuilds.com).
northbeambuilds.com is the company site; each product gets its own site like this one.
Pattern reference: TimothyjT/nevermiss-site (see its README for the full replication pattern).

Planned address: **https://faqagent.northbeambuilds.com** (custom-domain binding + HTTPS are finalized
in a separate pass once product names are confirmed in the branding sprint).

## Name handling (rename-ready)

All product-name and subdomain strings in this site were generated from ONE product
record in the site generator (name, wordmark, base URL, titles, meta). A rename is a
mechanical pass: update the record, regenerate, push. Name-dependent files: every
HTML page (titles, headings, footer line), llms.txt, sitemap.xml, robots.txt, CNAME.

## Layout

```
index.html            Home: hero, what it does, fit, price summary, demo/FAQ teasers, CTA
pricing/index.html    Full price box with totals, terms, buy button
faq/index.html        FAQ with FAQPage structured data
contact/index.html    northbeambuilds@gmail.com card + buy button
{ demos/index.html    Concept demo (links to northbeambuilds.com/demos/<name>/, labeled "Concept demo — not a client") — delete this line if no demo }
llms.txt              Plain-language product summary for LLM search
assets/site.css       Shared design system (from the flagship product site)
assets/site.js        Header nav toggle + FAQ chat widget (carried over from the company site)
CNAME                 faqagent.northbeambuilds.com
robots.txt, sitemap.xml
```
