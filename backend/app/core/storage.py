"""Supabase Storage helper for product images.

Talks to the Supabase Storage REST API directly (no heavy SDK).
Files are stored in a public bucket; the public URL is persisted on the
ProductImage row so it survives ephemeral/read-only deploy filesystems.
"""
import mimetypes

import httpx

from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)


def public_url(path: str) -> str:
    """Public URL for an object path within the bucket."""
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{path}"


def _headers(extra: dict | None = None) -> dict:
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "apikey": SUPABASE_SERVICE_KEY,
    }
    if extra:
        headers.update(extra)
    return headers


async def upload(path: str, content: bytes, content_type: str | None = None) -> str:
    """Upload bytes to the bucket and return the public URL."""
    if not is_configured():
        raise RuntimeError(
            "Supabase storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY."
        )

    if not content_type:
        content_type = mimetypes.guess_type(path)[0] or "application/octet-stream"

    endpoint = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}"
    headers = _headers({"Content-Type": content_type, "x-upsert": "true"})

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(endpoint, content=content, headers=headers)

    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Supabase upload failed ({resp.status_code}): {resp.text}"
        )

    return public_url(path)


async def delete(path: str) -> None:
    """Delete an object from the bucket. Silent if not configured/missing."""
    if not is_configured() or not path:
        return

    endpoint = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            await client.delete(endpoint, headers=_headers())
    except httpx.HTTPError as e:
        print(f"Supabase delete failed for {path}: {e}")
