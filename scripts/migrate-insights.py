from pathlib import Path
import json
import re
from datetime import date

SOURCE = Path('../../outputs').resolve()
DEST = Path('src/content/insights')

articles = {
    'insight-why-ai-strategies-fail.html': {
        'slug': 'why-ai-strategies-fail', 'readTime': '7 min read',
        'tags': ['strategy', 'governance'], 'cardLabel': 'Executive briefing',
        'takeaway': 'Learn why tool-first planning and fragmented use cases fail—and how to build a portfolio logic that survives contact with operations.',
        'heroVariant': 'waves', 'visual': '/images/editorial-abstract.svg', 'featured': True,
    },
    'insight-transformation-portfolio.html': {
        'slug': 'transformation-portfolio', 'readTime': '7 min read',
        'tags': ['strategy', 'frameworks'], 'cardLabel': 'Framework',
        'takeaway': 'A five-dimension scoring model—Value, Feasibility, Strategy, Risk and Readiness—to rank enterprise initiatives.',
        'heroVariant': 'pipeline', 'visual': '/images/portfolio-matrix.svg',
    },
    'insight-cognitive-offloading.html': {
        'slug': 'cognitive-offloading', 'readTime': '6 min read',
        'tags': ['human-agency'], 'cardLabel': 'Research note',
        'takeaway': 'Capture short-term automation gains without eroding institutional judgment and domain expertise.',
        'heroVariant': 'network', 'visual': '/images/offloading-curve.svg',
    },
    'insight-beyond-cost-reduction.html': {
        'slug': 'beyond-cost-reduction', 'readTime': '6 min read',
        'tags': ['strategy'], 'cardLabel': 'Executive briefing',
        'takeaway': 'Expand AI value evaluation across Growth, Decision Quality, Resilience, Learning and Optionality.',
        'heroVariant': 'waves', 'visual': '/images/five-lenses.svg',
    },
    'insight-habmc.html': {
        'slug': 'human-augmented-business-model-canvas', 'readTime': '7 min read',
        'tags': ['frameworks', 'human-agency'], 'cardLabel': 'Framework',
        'takeaway': 'A structured lens for mapping work into Automate, Augment and Human-Led zones.',
        'heroVariant': 'pipeline', 'visual': '/images/habmc.svg',
    },
    'insight-strategy-to-scale.html': {
        'slug': 'strategy-to-scale', 'readTime': '7 min read',
        'tags': ['frameworks', 'strategy'], 'cardLabel': 'Field guide',
        'takeaway': 'Diagnose, prioritize, design, pilot and scale without losing strategic coherence.',
        'heroVariant': 'waves', 'visual': '/images/strategy-to-scale.svg',
    },
}

def text(pattern: str, source: str) -> str:
    match = re.search(pattern, source, re.S)
    if not match:
        raise RuntimeError(f'Pattern not found: {pattern}')
    return re.sub(r'<[^>]+>', '', match.group(1)).strip()

def slugify(value: str) -> str:
    value = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return value[:72]

for filename, data in articles.items():
    source = (SOURCE / filename).read_text()
    title = text(r'<h1[^>]*>(.*?)</h1>', source)
    description = re.search(r'<meta name="description" content="([^"]+)"', source).group(1)
    eyebrow = text(r'<div class="eyebrow">(.*?)</div>', source)
    lead = text(r'<section class="page-hero".*?<p class="lead">(.*?)</p>', source)
    article = re.search(r'<article class="content">(.*?)</article>', source, re.S).group(1).strip()
    article = article.replace('src="images/', 'src="/images/')
    article = article.replace('class="small muted"', 'class="author-note"')

    def heading(match):
        label = re.sub(r'<[^>]+>', '', match.group(1)).strip()
        return f'<h2 id="{slugify(label)}">{match.group(1)}</h2>'
    article = re.sub(r'<h2>(.*?)</h2>', heading, article, flags=re.S)

    cta_title = text(r'<section><div class="wrap"><div class="cta"><div><h2>(.*?)</h2>', source)
    cta_text = text(r'<section><div class="wrap"><div class="cta"><div><h2>.*?</h2><p class="muted">(.*?)</p>', source)

    frontmatter = {
        'title': title, 'description': description, 'eyebrow': eyebrow, 'lead': lead,
        'author': 'Dr. Mitt Nowshade Kabir', 'published': '2026-08-28',
        'readTime': data['readTime'], 'tags': data['tags'], 'cardLabel': data['cardLabel'],
        'takeaway': data['takeaway'], 'heroVariant': data['heroVariant'], 'visual': data['visual'],
        'featured': data.get('featured', False), 'draft': False,
        'ctaTitle': cta_title, 'ctaText': cta_text,
    }
    lines = ['---']
    for key, value in frontmatter.items():
        lines.append(f'{key}: {json.dumps(value, ensure_ascii=False)}')
    lines.extend(['---', '', article, ''])
    (DEST / f"{data['slug']}.md").write_text('\n'.join(lines))
    print(filename, '->', data['slug'])
