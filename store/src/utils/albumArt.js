// Fetches album cover art from the iTunes Search API.
// Results are cached in-memory to avoid duplicate requests.
// Falls back to null if nothing is found — components show the vinyl disc instead.

const cache = new Map()

export async function fetchAlbumArt(title, artist) {
  const key = `${artist}::${title}`

  if (cache.has(key)) return cache.get(key)

  // Mark as in-flight immediately so concurrent callers don't double-fetch
  cache.set(key, null)

  try {
    const q   = encodeURIComponent(`${artist} ${title}`)
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&media=music&entity=album&limit=5&country=us`
    )
    if (!res.ok) return null

    const data = await res.json()
    if (!data.results?.length) return null

    // artworkUrl100 → replace size token for a 600px image
    const url = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb')
    cache.set(key, url)
    return url
  } catch {
    return null
  }
}