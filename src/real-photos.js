// Keeps each player's own photos of animals they saw for real, on this device. Photos are too big for
// localStorage (where players.js saves everything else), so they live in IndexedDB, one per player
// and animal, shrunk first: a phone photo is several megabytes.
const DATABASE = "wildlife-real-photos";
const STORE = "photos";
const LONGEST = 1024;

export function openRealPhotos(factory = globalThis.indexedDB) {
  const ready = new Promise((resolve, reject) => {
    if (!factory) return reject(new Error("This browser cannot keep photos"));
    const request = factory.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  ready.catch(() => {}); // each call below reports it instead

  function run(mode, work) {
    return ready.then(database => new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const request = work(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = transaction.onabort = () => reject(transaction.error);
    }));
  }

  return {
    save: (player, kind, photo) => run("readwrite", store => store.put(photo, [player, kind])),
    load: (player, kind) => run("readonly", store => store.get([player, kind])),
    // Every photo of one player: their keys run from [player] up to [player, []], as arrays sort
    // after every animal's name.
    forget: player => run("readwrite", store => store.delete(IDBKeyRange.bound([player], [player, []])))
  };
}

// A JPEG copy no more than LONGEST pixels across. Drawing an <img> keeps the photo the right way up.
export async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, LONGEST / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("The photo could not be shrunk")), "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}
