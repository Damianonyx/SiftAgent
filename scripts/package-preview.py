"""Produce an offline landing-page preview and a repository-ready source ZIP."""
from pathlib import Path
import base64, json, re, zipfile
root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
out = root / 'artifacts'
out.mkdir(exist_ok=True)
def data_url(path):
    mime = {'.jpg':'image/jpeg', '.png':'image/png', '.woff':'font/woff'}[path.suffix]
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()
def inline_css(name):
    css = (dist / name).read_text()
    return re.sub(r"url\('([^']+)'\)", lambda m: "url('" + data_url(dist / m[1]) + "')", css)
html = (dist / 'index.html').read_text()
for name in ('styles.css', 'hero.css'):
    html = html.replace('<link rel="stylesheet" href="'+name+'">', '<style>'+inline_css(name)+'</style>')
html = re.sub(r'\s*<link rel="preload"[^>]+>', '', html)
html = re.sub(r'\s*<link rel="manifest"[^>]+>', '', html)
html = html.replace('<script type="module" src="app.js"></script>', '')
mascot = (dist / 'app/mascot.js').read_text().replace('export function', 'function')
mascot = mascot.replace("new URL('./reference-art.jpg', import.meta.url).href", json.dumps(data_url(dist / 'app/reference-art.jpg')))
script = (dist / 'app.js').read_text().replace("import { startMascot } from './app/mascot.js';", '')
html = html.replace('</body>', '<script>'+mascot+'\n'+script+'</script></body>')
html = re.sub(r'href="(/app/icons/[^"]+)"', lambda m: 'href="'+data_url(dist / m[1].lstrip('/'))+'"', html)
html = html.replace('href="/app/', 'href="https://siftagent-five.vercel.app/app/')
html = html.replace('href="/"', 'href="https://siftagent-five.vercel.app/"')
(out / 'sift-preview.html').write_text(html)
with zipfile.ZipFile(out / 'sift-website.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root)
        if file.is_file() and not any(part in ('artifacts','.git','node_modules','.vercel','__pycache__') or part.startswith('.env') for part in relative.parts):
            archive.write(file, 'sift-web/'+str(relative))
print('Created', out / 'sift-preview.html')
print('Created', out / 'sift-website.zip')
