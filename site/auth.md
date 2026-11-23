# sandy.tayts.com auth.md

## Audience

Any agent, crawler or assistant reading this portfolio on someone's behalf.

## Registration

None. There is nothing to register for: no accounts, no API keys, no OAuth.

## Supported methods

- **Anonymous, unauthenticated HTTPS `GET`** of every public page and file.

## Credentials

None are issued and none are accepted. Send no `Authorization` header.
Everything under `https://sandy.tayts.com/` is public and read-only.

## What is available

- Pages as HTML, or as Markdown: send `Accept: text/markdown`, or request the `.md` copy.
- An overview: `https://sandy.tayts.com/llms.txt`
- The API catalog: `https://sandy.tayts.com/.well-known/api-catalog`
- Usage preferences: `Content-Signal` in `https://sandy.tayts.com/robots.txt`

To reach Sandy, see `https://sandy.tayts.com/contact.md`.
