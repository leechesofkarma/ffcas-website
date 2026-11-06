# Friends of FCAS Website: Setup Guide

This is a free, lightweight website. All of the words and photos are stored in `content/*.json` and `images/`. Your friend edits them through **Pages CMS**, a simple form-based editor, and never touches code.

## What's in here

| Path | What it is |
|---|---|
| `index.html`, `about.html`, `animals.html`, `events.html`, `help.html`, `contact.html` | Page layouts (rarely need editing) |
| `assets/style.css` | Colors, fonts, layout |
| `assets/site.js` | Builds each page from the content files |
| `content/*.json` | **All editable text** (what Pages CMS edits) |
| `images/` | Uploaded photos land here |
| `.pages.yml` | Tells Pages CMS which fields to show the editor |

## One-time setup (about 20 minutes)

### 1. Put the site on GitHub
1. Create a free GitHub account if you don't have one. Ideally make an account for the organization (e.g. using the org's email) so it isn't tied to one person.
2. Create a new **public** repository, e.g. `ffcas-website`.
3. Upload everything in this folder, **including the hidden `.pages.yml` file**. On a Mac, press `Cmd + Shift + .` in Finder to show hidden files.

### 2. Turn on free hosting (GitHub Pages)
1. In the repo, go to **Settings → Pages**.
2. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then Save.
3. After a minute or two, the site is live at `https://YOUR-ACCOUNT.github.io/ffcas-website/`.

*(Cloudflare Pages or Netlify also work and are free. Just connect the repo with no build command.)*

### 3. Connect the editor (Pages CMS)
1. Go to **https://app.pagescms.org** and sign in with GitHub.
2. Install the Pages CMS GitHub app when asked, and give it access to the `ffcas-website` repo.
3. Open the repo in Pages CMS. You'll see the menu: Site Settings, Home Page, About Page, Animals, Events & News, How to Help, Contact Page.

### 4. Give your friend access
In Pages CMS, open the repo and go to **Collaborators**, then invite your friend by email. He signs in with a link from that email, so he doesn't need a GitHub account. (If you'd rather, you can instead add him as a collaborator on the GitHub repo and he signs in with GitHub.)

### 5. Optional: custom domain
Buy a domain (e.g. `forsythshelterfriends.org`, about $10–15/year from Cloudflare, Namecheap, or Porkbun). Then in **GitHub Settings → Pages → Custom domain**, enter it and follow the DNS instructions. HTTPS is free.

## Fill these in first (Site Settings in the editor)
- Contact email, phone, mailing address
- Donate link (Zeffy is free for nonprofits; Givebutter or PayPal also work)
- Volunteer sign-up link (a Google Form works well)
- Link to FCAS's adoptable animals page
- Facebook / Instagram / TikTok links
- EIN, if you want it in the footer
- Logo (optional)

Anything left blank is simply hidden on the site, so nothing looks broken.

Then replace the **example animals** and **example event** with real ones, and add photos.

## Previewing locally
The pages load their content with JavaScript, so opening `index.html` by double-clicking won't show text. Run a tiny local server instead:

```
cd ffcas-website
python3 -m http.server 8000
```
Then visit http://localhost:8000.

## Changing the look
- Colors are at the top of `assets/style.css` (`--forest`, `--marigold`, etc.).
- Fonts are Fraunces (headings) and Nunito Sans (body), loaded from Google Fonts in each HTML file.
