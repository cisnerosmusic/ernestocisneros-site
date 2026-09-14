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

# 2 y 4. Paginas
missing = []
for path in html_files():
    s = io.open(path, encoding='utf-8').read()
    for block in LDJSON.findall(s):
        try:
            json.loads(block)
        except Exception as e:
            errors.append(f'JSON-LD inline invalido en {rel(path)}: {e}')
    if '<!-- off-map room -->' in s:
        continue
    has_structured = 'schema-loader' in s or 'application/ld+json' in s
    has_analytics = 'goatcounter' in s
    if not (has_structured and has_analytics):
        missing.append(rel(path))

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
