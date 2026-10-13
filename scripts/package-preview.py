"""Produce an offline, self-contained HTML preview and a repository-ready ZIP."""
from pathlib import Path
import base64, re, zipfile
root=Path(__file__).resolve().parent.parent
dist=root/'dist'
out=root/'artifacts'
out.mkdir(exist_ok=True)
def data_url(path):
    mime={'.jpg':'image/jpeg','.woff':'font/woff'}[path.suffix]
    return 'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
html=(dist/'index.html').read_text()
css=(dist/'styles.css').read_text()
css=css.replace('assets/sift-pixel.woff',data_url(dist/'assets/sift-pixel.woff'))
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
html=html.replace('<link rel="stylesheet" href="hero.css">','<style>'+(dist/'hero.css').read_text()+'</style>')
html=html.replace('<script src="app.js" defer></script>','')
html=html.replace('</body>','<script>'+(dist/'app.js').read_text()+'</script></body>')
for asset in ('sift-mascot.jpg','sift-banner.jpg'):
    html=html.replace('assets/'+asset,data_url(dist/'assets'/asset))
(out/'sift-preview.html').write_text(html)
with zipfile.ZipFile(out/'sift-website.zip','w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted(root.rglob('*')):
        relative=file.relative_to(root)
        if file.is_file() and not any(part in ('artifacts','.git','node_modules') for part in relative.parts):
            z.write(file,'sift-web/'+str(relative))
print('Created',out/'sift-preview.html')
print('Created',out/'sift-website.zip')
