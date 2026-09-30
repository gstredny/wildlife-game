"""Download licensed photos for expanded habitats and promote them to offline assets.

python3 tools/fetch-habitat-photos.py [bullfrog woodDuck ...]
Needs cwebp, like the original photo downloader. Existing downloads are reused.
"""
import json
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / 'src' / 'photos-new.js'
HEADER = '// Verified Commons photo references and the local illustration fallbacks.\nexport const NEW_PHOTOS = '
HEADERS = {'User-Agent': 'WildlifeGamePhotoFetcher/0.2 (https://github.com/gstredny)'}


def fetch(url):
    time.sleep(2)
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS)).read()


def download_photo(photo, target):
    query = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'titles': photo['title'],
                                   'prop': 'imageinfo', 'iiprop': 'url', 'iiurlwidth': 960})
    pages = json.loads(fetch(f'https://commons.wikimedia.org/w/api.php?{query}'))['query']['pages']
    info = next(iter(pages.values()))['imageinfo'][0]
    with tempfile.NamedTemporaryFile(suffix=Path(photo['title']).suffix) as source:
        source.write(fetch(info.get('thumburl', info['url'])))
        source.flush()
        subprocess.run(['cwebp', '-quiet', '-q', '82', '-resize', '960', '0',
                        source.name, '-o', str(target)], check=True)


def load_catalog():
    text = CATALOG.read_text()
    return json.loads(text[text.index('{'):text.rindex('}') + 1])


def save_catalog(photos):
    CATALOG.write_text(HEADER + json.dumps(photos, indent=2) + ';\n')


def main():
    photos = load_catalog()
    kinds = sys.argv[1:] or list(photos)
    for kind in kinds:
        photo = photos[kind]
        target = ROOT / 'art' / 'animals' / f'{kind}.webp'
        if not target.exists():
            download_photo(photo, target)
        photo['file'] = f'art/animals/{kind}.webp'
        save_catalog(photos)  # Preserve successes if the next download fails.
        print(kind, target.stat().st_size, 'bytes', flush=True)
    subprocess.run(['node', str(ROOT / 'tools' / 'cache-files.mjs')], check=True)


if __name__ == '__main__':
    main()
