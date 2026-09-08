#!/usr/bin/env python3
"""Проставляет версии подключаемым файлам.

GitHub Pages отдаёт CSS и JS с max-age=600, поэтому после деплоя браузер
до десяти минут показывает старую версию — обновление страницы не всегда
помогает. Короткий хэш в ссылке делает каждый изменённый файл новым URL,
и кэш перестаёт мешать. Запускать перед коммитом."""
import hashlib, re, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()

def stamp(m):
    attr, path = m.group(1), m.group(2)
    f = root / path
    if not f.exists():
        return m.group(0)
    h = hashlib.sha1(f.read_bytes()).hexdigest()[:8]
    return f'{attr}="{path}?v={h}"'

new = re.sub(r'(href|src)="(assets/(?:style\.css|[a-z-]+\.js))(?:\?v=[0-9a-f]+)?"', stamp, html)
if new != html:
    (root / 'index.html').write_text(new)
for m in re.finditer(r'(?:href|src)="(assets/[a-z.-]+)\?v=([0-9a-f]+)"', new):
    print(f'  {m.group(1)} -> {m.group(2)}')
