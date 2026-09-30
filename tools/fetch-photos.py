# Downloads each card photo from Wikimedia Commons and saves it as a 960×720 WebP in art/animals/.
# The crop (x, y, width, height) is in pixels of Commons' 1920-pixel-wide copy and keeps the animal
# in frame at 4:3. Credits live in src/photos.js and CREDITS.md. Needs `cwebp` (brew install webp).
#
#   python3 tools/fetch-photos.py            # every photo
#   python3 tools/fetch-photos.py heron deer # just these
import json
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

PHOTOS = {
    "cicada": ("File:Neotibicen superbus P1500620a.jpg", (0, 30, 1920, 1440)),
    "spoonbill": ("File:042 Roseate spoonbill in Encontro das Águas State Park Photo by Giles Laurent.jpg", (106, 0, 1707, 1280)),
    "ibis": ("File:White ibis (10239).jpg", (0, 290, 1920, 1440)),
    "heron": ("File:Great Blue Heron (Ardea herodias), hunting.jpg", (77, 0, 1627, 1220)),
    "alligator": ("File:Alligator at ChampionGates.jpg", (134, 0, 1648, 1236)),
    "coyote": ("File:Urban Coyote, Bernal Heights.jpg", (0, 40, 1920, 1440)),
    "hog": ("File:Wild hogs family.jpg", (0, 40, 1920, 1440)),
    "deer": ("File:20241125 white tailed deer cedar hill cemetery PD205041.jpg", (0, 180, 1920, 1440)),
}
# Wikimedia asks every tool to name itself; it answers too many quick requests with 429.
AGENT = {"User-Agent": "WildlifeGamePhotoFetcher/0.1 (https://github.com/gstredny)"}
OUT = Path(__file__).resolve().parent.parent / "art" / "animals"


def get(url):
    time.sleep(2)
    return urllib.request.urlopen(urllib.request.Request(url, headers=AGENT)).read()


def commons_copy(title):
    query = urllib.parse.urlencode({"action": "query", "format": "json", "titles": title,
                                    "prop": "imageinfo", "iiprop": "url", "iiurlwidth": 1920})
    pages = json.loads(get(f"https://commons.wikimedia.org/w/api.php?{query}"))["query"]["pages"]
    return get(next(iter(pages.values()))["imageinfo"][0]["thumburl"])


def main():
    kinds = sys.argv[1:] or list(PHOTOS)
    OUT.mkdir(parents=True, exist_ok=True)
    for kind in kinds:
        title, (x, y, width, height) = PHOTOS[kind]
        with tempfile.NamedTemporaryFile(suffix=".jpg") as source:
            source.write(commons_copy(title))
            source.flush()
            subprocess.run(["cwebp", "-quiet", "-q", "78", "-crop", str(x), str(y), str(width), str(height),
                            "-resize", "960", "720", source.name, "-o", str(OUT / f"{kind}.webp")], check=True)
        print(kind, (OUT / f"{kind}.webp").stat().st_size, "bytes")


if __name__ == "__main__":
    main()
