"""Build the editorial page from the owner's verbatim approved copy."""
from pathlib import Path
import re, html, json

root=Path(__file__).resolve().parents[1]
source=(root/'content/private-sessions.md').read_text()
sections={}
for chunk in re.split(r'^# ',source,flags=re.M)[1:]:
    name,body=chunk.split('\n',1)
    blocks=[]
    for raw in re.split(r'\n\s*\n',body.strip()):
        raw=raw.strip()
        if not raw or raw=='---': continue
        if raw.startswith('#'):
            m=re.match(r'(#+) (.*)',raw);blocks.append({'kind':'heading','level':len(m[1]),'text':m[2]})
        elif raw.startswith('- '): blocks.append({'kind':'list','items':[line[2:] for line in raw.splitlines()]})
        elif raw.startswith('|'): blocks.append({'kind':'table','rows':[[c.strip() for c in line.strip('|').split('|')] for line in raw.splitlines()]})
        else: blocks.append({'kind':'p','text':raw})
    sections[name.strip()]=blocks

ARROW='<svg class="icon icon-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.5"/></svg>'
PLAY='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor"/></svg>'
CHECK='<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="1.5"/></svg>'
action_urls={'Private Hypnotherapy Sessions':'https://www.ashiratantra.com/hypnotherapy'}
def inline(text):
    text=html.escape(text,quote=False)
    text=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',r'<a href="\2">\1</a>',text)
    text=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',text)
    text=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<em>\1</em>',text)
    text=re.sub(r'\[([^\]]+)\]',lambda m:f'<a href="{action_urls.get(html.unescape(m[1]),"#begin")}">{m[1]}</a>',text)
    return text
def render(block,cls=''):
    attr=f' class="{cls}"' if cls else ''
    if block['kind']=='p': return f'<p{attr}>{inline(block["text"])}</p>'
    if block['kind']=='list':return f'<ul class="quiet-list">'+''.join(f'<li>{inline(x)}</li>' for x in block['items'])+'</ul>'
    if block['kind']=='heading': return f'<h{block["level"]}{attr}>{inline(block["text"])}</h{block["level"]}>'
    raise ValueError(block)
def paras(blocks):return '\n'.join(render(b) for b in blocks)
def button(label,href='#begin',cls='button',attrs=''):
    return f'<a class="{cls}" href="{href}" {attrs}>{inline(label)}{ARROW}</a>'
def label(text):return f'<p class="eyebrow">{inline(text)}</p>'
def find_heading(blocks,text):return next(i for i,b in enumerate(blocks) if b['kind']=='heading' and b['text']==text)
def detail_groups(blocks):
    groups=[]
    for b in blocks:
        if b['kind']=='heading':groups.append([b,[]])
        elif groups:groups[-1][1].append(b)
    return groups

hero=sections['PRIVATE SESSIONS'];practice=sections['TANTRA KUNDALINI ACTIVATION'];who=sections['WHO IS THIS FOR?'];experience=sections['INSIDE A PRIVATE TANTRA SESSION'];testimonials=sections["WORDS FROM THOSE WHO'VE EXPERIENCED THE WORK"];memberships=sections['PRIVATE TANTRA MEMBERSHIPS'];temples=sections['TANTRA TEMPLES'];referrals=sections['FOR THERAPISTS & REFERRING PRACTITIONERS'];faq=sections['FREQUENTLY ASKED QUESTIONS'];work=sections['WORK WITH ME']
individual_start=find_heading(practice,'Private Tantra for Women & Men');couples_start=find_heading(practice,'Couples Tantra & Intimacy Sessions')
individual=practice[individual_start:couples_start];couples=practice[couples_start:-1]
development_start=find_heading(experience,'How Our Work Develops')
privileges_start=find_heading(memberships,'Membership Privileges')
conversation_start=find_heading(work,'A Conversation Before We Begin')

schema={'@context':'https://schema.org','@graph':[
 {'@type':'Organization','@id':'https://www.ashiratantra.com/#organization','name':'Ashira Tantra','url':'https://www.ashiratantra.com/','founder':{'@type':'Person','name':'Maryam Lopes'}},
 {'@type':'WebPage','@id':'https://www.ashiratantra.com/private-tantra-sessions-philadelphia/#page','url':'https://www.ashiratantra.com/private-tantra-sessions-philadelphia/','name':'Private Tantra Sessions in Philadelphia | Ashira Tantra','inLanguage':'en-US','mainEntity':{'@id':'https://www.ashiratantra.com/private-tantra-sessions-philadelphia/#service'}},
 {'@type':'Service','@id':'https://www.ashiratantra.com/private-tantra-sessions-philadelphia/#service','name':'Private Tantra Sessions in Philadelphia','serviceType':'Private Tantra and Kundalini activation sessions','provider':{'@id':'https://www.ashiratantra.com/#organization'},'areaServed':{'@type':'City','name':'Philadelphia'},'offers':[
 {'@type':'Offer','name':'Single Session','price':'460','priceCurrency':'USD','description':'One two-hour in-person private session.'},
 {'@type':'Offer','name':'Monthly','price':'368','priceCurrency':'USD','description':'One two-hour session per month.'},
 {'@type':'Offer','name':'Twice Monthly','price':'644','priceCurrency':'USD','description':'Two two-hour sessions per month; $322 per session.'}]},
 {'@type':'FAQPage','mainEntity':[{'@type':'Question','name':head['text'],'acceptedAnswer':{'@type':'Answer','text':' '.join(b['text'].replace('**','') for b in body)}} for head,body in detail_groups(faq)]}
]}
out=[]
def add(s):out.append(s)
add(f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173fe7">
<title>Private Tantra Sessions in Philadelphia | Ashira Tantra</title>
<meta name="description" content="Private Tantra sessions in Philadelphia with Maryam Lopes. Tantra, Kundalini activation and couples intimacy. Two-hour in-person sessions and private memberships.">
<link rel="canonical" href="https://www.ashiratantra.com/private-tantra-sessions-philadelphia/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Ashira Tantra"><meta property="og:title" content="Private Tantra Sessions in Philadelphia | Ashira Tantra">
<meta property="og:description" content="Tantra · Kundalini Activation · Couples Intimacy. In-person private sessions in Philadelphia."><meta property="og:url" content="https://www.ashiratantra.com/private-tantra-sessions-philadelphia/">
<meta property="og:image" content="https://www.ashiratantra.com/private-tantra-sessions-philadelphia/media/practice-poster.jpg"><meta property="og:image:alt" content="Maryam guiding a clothed private somatic practice"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="media/ashira-original-mark.png"><link rel="preload" href="media/practice-poster.jpg" as="image" fetchpriority="high">
<link rel="preconnect" href="https://use.typekit.net" crossorigin><link rel="preconnect" href="https://file.squarespace-cdn.com" crossorigin>
<link rel="stylesheet" href="hero-fonts.css"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="journey.css">
<script src="vendor/gsap.min.js" defer></script><script src="vendor/ScrollTrigger.min.js" defer></script><script src="site-config.js" defer></script><script src="script.js" defer></script><script src="motion.js" defer></script>
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False)}</script>
</head><body>
<a class="skip-link" href="#main">Skip to content</a><div class="reading-progress" aria-hidden="true"></div>
<header class="site-header">
 <a class="wordmark" href="#main" aria-label="Ashira Tantra home"><img src="media/ashira-original-mark.png" alt="" width="40" height="45"><span>ASHIRA TANTRA</span></a>
 <nav class="desktop-nav" aria-label="Main navigation"><a href="#private-sessions">Private sessions</a><a href="#experience">The experience</a><a href="#memberships">Memberships</a><a href="#about">About</a></nav>
 <a href="#begin" class="header-cta">Work with me{ARROW}</a>
 <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button>
 <nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation" hidden><a href="#private-sessions">Private sessions</a><a href="#experience">The experience</a><a href="#memberships">Memberships</a><a href="#about">About</a><a href="#begin">Work with me{ARROW}</a></nav>
</header>
<main id="main">
<section class="hero" aria-labelledby="hero-title">
 <div class="hero-light" aria-hidden="true"></div>
 <div class="hero-meta" data-hero-reveal>{label('PRIVATE SESSIONS')}<span>{inline(hero[-2]['text'].replace('**',''))}</span></div>
 <div class="hero-stage"><video id="hero-video" muted loop playsinline preload="none" poster="media/practice-poster.jpg" aria-label="Maryam guiding a clothed private somatic practice"><source data-src="media/practice-loop.mp4" type="video/mp4"></video></div>
 <h1 id="hero-title"><span class="hero-title-top" data-hero-reveal>You can understand <span>your story</span></span> <span class="hero-title-bottom" data-hero-reveal>without ever feeling <em>free inside it.</em></span></h1>
 <div class="hero-bottom" data-hero-reveal>{button('Explore Private Sessions','#private-sessions','button button-light')}<p>{inline(hero[0]['text'])}</p></div>
 <button id="hero-toggle" class="video-toggle" aria-label="Play background film"><span aria-hidden="true">{PLAY}</span><span class="video-label">Film</span></button>
</section>
<section class="invitation section-pad" id="invitation"><div class="wrap">
 <div class="invitation-opening"><p class="invitation-lead" data-reveal>{inline(hero[2]['text'])}</p><p data-reveal>{inline(hero[3]['text'])}</p></div>
 <p class="invitation-statement" data-reveal>{inline(hero[4]['text'])}</p>
 <div class="invitation-end"><span class="chapter-marker" aria-hidden="true">01 /</span><p data-reveal>{inline(hero[5]['text'])}</p></div>
</div></section>
<section class="practice section-pad" id="private-sessions" aria-labelledby="practice-title"><div class="wrap">
 <div class="practice-meta">{label('TANTRA KUNDALINI ACTIVATION')}<div>{render(practice[0])}{render(practice[1])}</div></div>
 <h2 id="practice-title" data-reveal>{inline(practice[2]['text']).replace("It's something you learn to inhabit.","<em>It's something you learn to inhabit.</em>")}</h2>
 <div class="practice-reading prose" data-reveal>{paras(practice[3:7])}</div>
 <figure class="connection-film" data-media-reveal><img src="media/connection.jpg" alt="Two people sharing a moment of connection beside a stream" width="1200" height="642" loading="lazy"><button class="film-button" data-film="ashira">{PLAY}<span>A glimpse of the work</span></button></figure>
</div></section>
<section class="session-section section-pad" aria-label="Individual and couples private sessions"><div class="wrap">
 <div class="session-tabs" role="tablist" aria-label="Choose your session type"><button role="tab" id="individual-tab" aria-selected="true" aria-controls="individual-panel" tabindex="0">For yourself <span>01</span></button><button role="tab" id="couples-tab" aria-selected="false" aria-controls="couples-panel" tabindex="-1">For your relationship <span>02</span></button></div>
 <div id="individual-panel" class="session-panel" role="tabpanel" aria-labelledby="individual-tab" tabindex="0"><div class="session-panel-heading"><h2>{inline(individual[0]['text'])}</h2><h3>{inline(individual[1]['text'])}</h3></div><div class="session-panel-copy prose">{paras(individual[2:])}</div></div>
 <div id="couples-panel" class="session-panel" role="tabpanel" aria-labelledby="couples-tab" tabindex="0" hidden><div class="session-panel-heading"><h2>{inline(couples[0]['text'])}</h2><h3>{inline(couples[1]['text'])}</h3></div><div class="session-panel-copy prose">{paras(couples[2:])}</div></div>
 <div class="session-footer"><span>{inline(practice[1]['text'].replace('**',''))}</span>{button('Book a Private Tantra Session — $460','#begin','text-link', 'data-select="individual" data-intent="session"')}</div>
</div></section>
<section class="sensory-interlude" aria-label="Our approach"><video class="ambient-video" muted loop playsinline preload="none" poster="media/sensory-poster.jpg" aria-hidden="true" tabindex="-1"><source data-src="media/sensory-loop.mp4" type="video/mp4"></video><div class="wrap"><p data-reveal>{inline(practice[7]['text'])}</p><button class="text-link" data-film="breath">Watch a breath practice{ARROW}</button></div></section>
<section class="concerns section-pad" id="who-its-for" aria-labelledby="concerns-title"><div class="wrap"><div class="section-intro">{label('WHO IS THIS FOR?')}<h2 id="concerns-title" data-reveal>WHO IS THIS FOR?</h2><div class="prose">{paras(who[:2])}</div></div><div class="concern-list">
''')
who_heads=[i for i,b in enumerate(who) if b['kind']=='heading']
for j,i in enumerate(who_heads):
    body=who[i+1:(who_heads[j+1] if j+1<len(who_heads) else len(who)-2)]
    add(f'<details class="indexed-detail"><summary><span class="detail-index">{j+1:02}</span><span class="detail-title">{inline(who[i]["text"])}</span><span class="detail-toggle" aria-hidden="true">+</span></summary><div class="detail-body">{paras(body)}</div></details>')
add(f'''</div><div class="concern-note prose">{paras(who[-2:])}</div></div></section>
<section class="experience section-pad" id="experience" aria-labelledby="experience-title"><div class="wrap"><div class="experience-heading">{label('INSIDE A PRIVATE TANTRA SESSION')}<h2 id="experience-title" data-reveal>INSIDE A PRIVATE TANTRA SESSION</h2><p class="experience-deck">{inline(experience[0]['text'])}</p></div><ol class="session-steps">''')
for i in range(1,development_start,2):
    step=experience[i]['text'].strip('*');num,title=step.split(' / ',1)
    add(f'<li class="session-step" data-step><span class="step-number">{num} /</span><div class="step-copy"><h3>{inline(title)}</h3>{render(experience[i+1])}</div></li>')
add(f'''</ol><div class="development"><h3>{inline(experience[development_start]['text'])}</h3><div class="prose">{paras(experience[development_start+1:-1])}</div><p class="development-note">{inline(experience[-1]['text'])}</p></div></div></section>
<section class="testimonials section-pad" aria-labelledby="testimonials-title"><div class="wrap"><div class="testimonial-heading">{label('WORDS FROM THE COMMUNITY')}<h2 id="testimonials-title" data-reveal>WORDS FROM THOSE WHO'VE EXPERIENCED THE WORK</h2></div><div class="quote-grid">''')
for i in range(0,6,2):
    author=testimonials[i+1]['text'];name,context=author.split(' — ',1)
    add(f'<figure data-reveal><blockquote>{inline(testimonials[i]["text"])}</blockquote><figcaption>{inline(name)}<span class="context">— {inline(context)}</span></figcaption></figure>')
add(f'''</div><div class="testimonial-link">{render(testimonials[-1])}</div></div></section>
<section class="memberships section-pad" id="memberships" aria-labelledby="membership-title"><div class="wrap"><div class="membership-heading">{label('PRIVATE TANTRA MEMBERSHIPS')}<h2 id="membership-title" data-reveal>{inline(memberships[0]['text']).replace('an embodied practice.','<em>an embodied practice.</em>')}</h2></div><div class="membership-intro prose">{paras(memberships[1:4])}</div><div class="pricing-table-wrap" tabindex="0" role="region" aria-label="Compare private session memberships"><table class="pricing-table"><caption class="sr-only">Private Tantra session and membership pricing</caption>''')
rows=next(b['rows'] for b in memberships if b['kind']=='table')
add('<thead><tr><td></td>'+''.join(f'<th scope="col">{inline(x)}</th>' for x in rows[0][1:])+'</tr></thead><tbody>')
for row in rows[2:]:
    cls='price-row' if row[0]=='Per session' else 'total-row' if row[0]=='Monthly total' else ''
    add(f'<tr class="{cls}"><th scope="row">{inline(row[0])}</th>'+''.join(f'<td>{inline(x)}</td>' for x in row[1:])+'</tr>')
add('<tfoot><tr><td></td>'+''.join(f'<td>{button(name,"#begin","plan-link",f"data-plan=\"{plan}\"")}</td>' for plan,name in [('single','Single Session'),('monthly','Monthly'),('twice','Twice Monthly')])+'</tr></tfoot></table></div>')
add(f'''<div class="membership-privileges"><h3>{inline(memberships[privileges_start]['text'])}</h3><div class="prose">{paras(memberships[privileges_start+1:-1])}</div></div>{button('Explore Private Memberships','#begin','button','data-plan="monthly"')}</div></section>
<section class="temples section-pad" id="temples" aria-labelledby="temple-title"><div class="wrap">{label('TANTRA TEMPLES')}<h2 id="temple-title" data-reveal>{inline(temples[0]['text'])}</h2><div class="temple-copy prose">{paras(temples[1:])}</div></div></section>
<section class="referrals section-pad" id="referrals" aria-labelledby="referral-title"><div class="wrap"><div class="referral-heading">{label('FOR THERAPISTS & REFERRING PRACTITIONERS')}<h2 id="referral-title" data-reveal>{inline(referrals[0]['text'])}</h2></div><div class="referral-copy"><div class="prose">{paras(referrals[1:-1])}</div>{button('Inquire About a Professional Referral','#begin','text-link','data-intent="referral"')}</div></div></section>
<section class="faq section-pad" id="faq" aria-labelledby="faq-title"><div class="wrap"><div class="faq-heading">{label('YOUR QUESTIONS')}<h2 id="faq-title" data-reveal>FREQUENTLY ASKED QUESTIONS</h2></div><div class="faq-list">''')
for head,body in detail_groups(faq):add(f'<details><summary>{inline(head["text"])}<span class="detail-toggle" aria-hidden="true">+</span></summary><div class="detail-body prose">{paras(body)}</div></details>')
add(f'''</div></div></section>
<section class="about" id="about" aria-labelledby="about-title"><div class="about-portrait"><img src="media/maryam.jpg" width="1400" height="750" alt="Maryam in a sensory practice with a rose" loading="lazy"><p class="portrait-caption">Maryam Lopes · Ashira Tantra</p></div><div class="about-copy">{label('WORK WITH ME')}<h2 id="about-title" data-reveal>{inline(work[0]['text'])}</h2><div class="prose">{paras(work[1:conversation_start])}</div>{button('Schedule a 15-Minute Conversation','#begin','text-link','data-intent="conversation"')}</div></section>
<section class="begin section-pad" id="begin" aria-labelledby="begin-title"><div class="wrap"><div class="begin-heading">{label('WORK WITH ME')}<h2 id="begin-title" data-reveal>{inline(work[conversation_start]['text'])}</h2></div><div class="begin-grid"><div class="begin-copy"><div class="prose">{paras(work[conversation_start+1:conversation_start+5])}</div><p class="begin-location">In-person private sessions in Philadelphia</p></div><div class="begin-choice"><h3>I'm exploring this…</h3><div class="audience-options" role="group" aria-label="Who is the session for?"><button type="button" class="audience-option selected" data-audience="individual" aria-pressed="true"><span class="name">For myself</span><span class="option-check">{CHECK}</span></button><button type="button" class="audience-option" data-audience="couple" aria-pressed="false"><span class="name">With my partner</span><span class="option-check">{CHECK}</span></button></div><p class="selection-note" id="selection-note" aria-live="polite">A space to explore your intentions, at your own pace.</p><button type="button" class="button button-light" id="conversation-cta">Schedule a 15-Minute Conversation{ARROW}</button><button type="button" class="text-link" id="session-cta">Request a Private Session{ARROW}</button></div></div><div class="hypnotherapy-note">{render(work[-1])}</div></div></section>
</main>
<footer class="site-footer"><div class="wrap"><div class="footer-top"><a class="footer-brand" href="#main"><img src="media/ashira-original-mark.png" alt="" width="50" height="60"><span>ASHIRA TANTRA</span></a><a href="#main" class="back-top">Back to the beginning{ARROW}</a></div><div class="footer-bottom"><span>© <span id="copyright-year">2026</span> Ashira Tantra · Maryam Lopes</span><span>Philadelphia, Pennsylvania</span><a href="https://www.ashiratantra.com/somaticeventsnearyou">O-Circle LIVE{ARROW}</a></div></div></footer>
<div class="mobile-bottom-bar"><span>Private sessions<small>Philadelphia · $460 / 2 hours</small></span><a href="#begin">Work with me{ARROW}</a></div>
<button type="button" class="motion-toggle" id="motion-toggle" aria-pressed="false" aria-label="Pause background motion"><span aria-hidden="true">{PLAY}</span><span class="motion-label">Pause motion</span></button>
<dialog class="film-dialog" id="film-dialog" aria-labelledby="film-title"><div class="dialog-top"><h2 id="film-title">A glimpse of the work</h2><button type="button" class="dialog-close" data-close aria-label="Close film">×</button></div><video id="film-player" controls playsinline preload="none"></video><p id="film-description">A sensory glimpse from the Ashira film.</p></dialog>
<dialog class="inquiry-dialog" id="inquiry-dialog" aria-labelledby="inquiry-title"><button type="button" class="dialog-close" data-close aria-label="Close inquiry">×</button><p class="eyebrow">A CONVERSATION BEFORE WE BEGIN</p><h2 id="inquiry-title">Work with me</h2><p id="inquiry-summary">A complimentary 15-minute conversation about an individual session.</p><div class="booking-status"><strong>Online scheduling is coming soon.</strong><p>No request or booking has been submitted. You're welcome to explore Ashira Tantra in the meantime.</p></div><a class="button" id="inquiry-destination" href="https://www.ashiratantra.com/">Visit Ashira Tantra{ARROW}</a><button type="button" class="text-link" data-close>Keep exploring{ARROW}</button></dialog>
<noscript><style>.reveal,[data-reveal],[data-hero-reveal],[data-media-reveal]{{opacity:1;transform:none}}#couples-panel[hidden]{{display:grid!important;margin-top:60px}}.menu-toggle,.motion-toggle,.video-toggle,.film-button,[data-film]{{display:none}}.desktop-nav{{display:flex;flex-wrap:wrap}}.header-cta{{display:none}}</style><p class="noscript-note">Interactive session choices and films use JavaScript. All session information is available on this page. <a href="https://www.ashiratantra.com/">Visit Ashira Tantra</a>.</p></noscript>
</body></html>''')
(root/'public/index.html').write_text('\n'.join(out))
print(f'Generated public/index.html from {len(sections)} approved copy sections.')
