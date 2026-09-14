#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validacion de integridad del sitio (ver AGENTS.md).

Comprueba:
  1. Todos los assets/schemas/*.json son JSON valido.
  2. Todos los bloques <script type="application/ld+json"> inline parsean.
  3. sitemap.xml es XML valido y cada <loc> corresponde a un archivo real.
  4. Cobertura: cada pagina lleva GoatCounter y datos estructurados
     (schema-loader o JSON-LD inline). Las paginas off-map (marcadas con
     <!-- off-map room -->), components/ y las listadas en
     scripts/coverage-baseline.txt (deuda conocida) estan exentas.
     El CI falla solo ante REGRESIONES nuevas.

Uso: python scripts/validate.py [--update-baseline]
"""
import io
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASELINE = os.path.join(ROOT, 'scripts', 'coverage-baseline.txt')
LDJSON = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)
errors = []


def rel(path):
    return os.path.relpath(path, ROOT).replace('\\', '/')


def html_files():
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'components', '.github')]
        for name in files:
            if name.endswith('.html') and not name.startswith('google'):
                yield os.path.join(root, name)


# 1. Schemas externos
schema_dir = os.path.join(ROOT, 'assets', 'schemas')
for name in sorted(os.listdir(schema_dir)):
    if name.endswith('.json'):
        try:
            json.load(io.open(os.path.join(schema_dir, name), encoding='utf-8'))
        except Exception as e:
            errors.append(f'schema invalido: assets/schemas/{name}: {e}')

# 2 y 4-9. Paginas
CANON = re.compile(r'<link rel="canonical"')
DSCHEMA = re.compile(r'data-schema="([^"]+)"')
HREFLANG = re.compile(r'<link rel="alternate" hreflang="[^"]+" href="([^"]+)"')
IMG = re.compile(r'<img\b[^>]*>')
DECOR = re.compile(r'^\s*animate(?:Gold|Particles)\(\);\s*$', re.M)
ANCHOR = re.compile(r'<a\s[^>]*href="([^"#?]+\.html)[#?]?[^"]*"')

def local_exists(url):
    p = url.replace('https://ernestocisneros.art/', '', 1)
    if p == '' or p.endswith('/'):
        p += 'index.html'
    return os.path.exists(os.path.join(ROOT, p))

missing = []
broken_links = []
for path in html_files():
    s = io.open(path, encoding='utf-8').read()
    r = rel(path)
    for block in LDJSON.findall(s):
        try:
            json.loads(block)
        except Exception as e:
            errors.append(f'JSON-LD inline invalido en {r}: {e}')
    # canonicals duplicados
    if len(CANON.findall(s)) > 1:
        errors.append(f'canonical duplicado en {r}')
    # data-schema debe apuntar a un JSON existente
    for name in DSCHEMA.findall(s):
        if name != 'none' and not os.path.exists(
                os.path.join(schema_dir, name + '.json')):
            errors.append(f'data-schema "{name}" sin JSON en {r}')
    # hreflang con destino local existente
    for url in HREFLANG.findall(s):
        if url.startswith('https://ernestocisneros.art') and not local_exists(url):
            errors.append(f'hreflang a destino inexistente en {r}: {url}')
    # imagenes sin dimensiones (los placeholders dinamicos con src="" se excluyen)
    for tag in IMG.findall(s):
        if 'width=' not in tag and 'src=""' not in tag:
            errors.append(f'img sin width/height en {r}: {tag[:80]}')
    # bucles decorativos sin respetar prefers-reduced-motion
    for m in DECOR.finditer(s):
        errors.append(f'bucle decorativo sin guarda reduced-motion en {r}: {m.group(0).strip()}')
    # enlaces internos rotos (solo .html locales)
    base = os.path.dirname(path)
    for href in ANCHOR.findall(s):
        if href.startswith(('http:', 'https:', '//', 'mailto:')):
            if href.startswith('https://ernestocisneros.art') and not local_exists(href):
                broken_links.append(f'{r} -> {href}')
            continue
        target = os.path.normpath(os.path.join(ROOT, href.lstrip('/'))) if href.startswith('/') \
            else os.path.normpath(os.path.join(base, href))
        if not os.path.exists(target):
            broken_links.append(f'{r} -> {href}')
    if '<!-- off-map room -->' in s:
        continue
    has_structured = 'schema-loader' in s or 'application/ld+json' in s
    has_analytics = 'goatcounter' in s
    if not (has_structured and has_analytics):
        missing.append(rel(path))

for b in broken_links:
    errors.append(f'enlace interno roto: {b}')

# 3. Sitemap
sitemap = os.path.join(ROOT, 'sitemap.xml')
try:
    tree = ET.parse(sitemap)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for loc in tree.getroot().iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
        url = loc.text.strip()
        path = url.replace('https://ernestocisneros.art/', '', 1)
        if path == url:
            errors.append(f'sitemap: dominio inesperado en {url}')
            continue
        if path == '' or path.endswith('/'):
            path += 'index.html'
        if not os.path.exists(os.path.join(ROOT, path)):
            errors.append(f'sitemap: {url} no corresponde a ningun archivo')
except Exception as e:
    errors.append(f'sitemap.xml invalido: {e}')

# 4. Cobertura vs linea base
if '--update-baseline' in sys.argv:
    io.open(BASELINE, 'w', encoding='utf-8', newline='\n').write(
        '\n'.join(sorted(missing)) + '\n')
    print(f'linea base actualizada: {len(missing)} paginas con deuda conocida')
    sys.exit(0)

known = set()
if os.path.exists(BASELINE):
    known = {l.strip() for l in io.open(BASELINE, encoding='utf-8') if l.strip()}
regressions = [m for m in missing if m not in known]
for r in regressions:
    errors.append(f'REGRESION de cobertura (sin GoatCounter o datos estructurados): {r}')
resolved = known - set(missing)
if resolved:
    print(f'nota: {len(resolved)} paginas de la linea base ya estan resueltas; '
          'ejecuta --update-baseline para encogerla')

if errors:
    print(f'FALLO: {len(errors)} problemas')
    for e in errors:
        print(' -', e)
    sys.exit(1)
print(f'OK: schemas validos, sitemap coherente, sin regresiones '
      f'(deuda conocida: {len(missing)} paginas)')
