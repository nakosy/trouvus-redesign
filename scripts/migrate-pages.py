from pathlib import Path
import re

SOURCE = Path('../../outputs').resolve()
DEST = Path('src/pages')

pages = {
    'index.html': ('index.astro', 'Trouvus | AI Transformation Strategy and Implementation', 'Trouvus turns AI ambition into operating capability through strategy, business-model innovation, implementation design and workforce transformation.'),
    'expertise.html': ('expertise.astro', 'Expertise | Trouvus', 'AI strategy, business-model innovation, implementation design, workforce transformation and AI venture advisory.'),
    'approach.html': ('approach.astro', 'Approach | Trouvus', 'The Trouvus Strategy-to-Scale Framework: diagnose, prioritize, design, pilot and scale.'),
    'perspectives.html': ('perspectives.astro', 'Perspectives | Trouvus', 'The research foundations, original frameworks and transformation standards behind the Trouvus approach to enterprise AI.'),
    'about.html': ('about.astro', 'About | Trouvus', 'Trouvus closes the gap between AI possibility and organizational reality through research-grounded transformation.'),
    'contact.html': ('contact.astro', 'Book an Executive Consultation | Trouvus', 'Discuss AI strategy, business-model innovation, implementation, workforce transformation or executive education with Trouvus.'),
}

route_map = {
    'index.html': '/',
    'expertise.html': '/expertise/',
    'approach.html': '/approach/',
    'results.html': '/perspectives/',
    'perspectives.html': '/perspectives/',
    'insights.html': '/insights/',
    'about.html': '/about/',
    'contact.html': '/contact/',
    'insight-why-ai-strategies-fail.html': '/insights/why-ai-strategies-fail/',
    'insight-transformation-portfolio.html': '/insights/transformation-portfolio/',
    'insight-cognitive-offloading.html': '/insights/cognitive-offloading/',
    'insight-beyond-cost-reduction.html': '/insights/beyond-cost-reduction/',
    'insight-habmc.html': '/insights/human-augmented-business-model-canvas/',
    'insight-strategy-to-scale.html': '/insights/strategy-to-scale/',
}

def transform(markup: str) -> str:
    markup = markup.replace('src="images/', 'src="/images/')
    for old, new in route_map.items():
        markup = markup.replace(f'href="{old}#', f'href="{new}#')
        markup = markup.replace(f'href="{old}"', f'href="{new}"')
    markup = markup.replace('<div class="pipe-node">', '<div class="pipe-node" tabindex="0">')
    return markup

for source_name, (dest_name, title, description) in pages.items():
    source = (SOURCE / source_name).read_text()
    match = re.search(r'<main>(.*?)</main>', source, re.S)
    if not match:
        raise RuntimeError(f'No main element in {source_name}')
    main = transform(match.group(1)).strip()
    output = f'''---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title={title!r} description={description!r}>
{main}
</BaseLayout>
'''
    (DEST / dest_name).write_text(output)
    print(f'{source_name} -> {dest_name}')
