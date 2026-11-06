# Handoff: Deploy the Friends of FCAS website

## Goal
Put this static website on GitHub and turn on free hosting with GitHub Pages. The site is already built and you should not redesign it. After it's live, a non-technical volunteer will edit it through Pages CMS (https://pagescms.org).

## What you're starting with
- A zip file named `ffcas-website.zip`, probably in `~/Downloads`. It unzips to a folder named `ffcas-site/`.
- It's a plain static site with **no build step**: HTML pages, `assets/style.css`, and `assets/site.js`. Each page loads its text from the JSON files in `content/`.
- `.pages.yml` holds the Pages CMS editor config. It must stay at the repo root.
- `.nojekyll` makes GitHub Pages serve the files as they are. Keep it.
- `README.md` has the full human setup guide. `EDITING-GUIDE.md` is for the volunteer.

## Rules
- Do not change the design, the copy, or the JSON structure in `content/`. Pages CMS depends on that structure matching `.pages.yml`.
- Do not add a framework, a bundler, or a build step.
- Hidden files must be committed: `.pages.yml`, `.nojekyll`, `.gitignore`, and `images/.gitkeep`.
- Don't commit or print tokens or credentials.
- Ask me before creating anything under a GitHub organization, and before buying or configuring a domain.

## Steps

### 1. Unpack and check the files
```bash
mkdir -p ~/Sites && cd ~/Sites
unzip -o ~/Downloads/ffcas-website.zip
mv ffcas-site ffcas-website
cd ffcas-website
ls -a
python3 -c "import json,glob,yaml;[json.load(open(f)) for f in glob.glob('content/*.json')];yaml.safe_load(open('.pages.yml'));print('content + config OK')"
```
If `yaml` is missing, run `pip3 install pyyaml`, or skip the YAML check.

### 2. Test it locally
```bash
python3 -m http.server 8000
```
- Open http://localhost:8000 and check that all six pages render with text: index, about, animals, events, help, and contact.
- The browser console should have no JavaScript errors. A Google Fonts failure when offline is fine.
- Stop the server when you're done.

### 3. Create the GitHub repo and push
Use the GitHub CLI. If `gh auth status` fails, ask me to run `gh auth login`.
```bash
git init -b main
git add -A
git commit -m "Initial Friends of FCAS website"
gh repo create ffcas-website --public --source=. --remote=origin --push
```
- The repo must be **public** so GitHub Pages works on a free account.
- If the name `ffcas-website` is taken, ask me which name to use.

### 4. Turn on GitHub Pages
```bash
OWNER=$(gh api user -q .login)
gh api -X POST repos/$OWNER/ffcas-website/pages -f "source[branch]=main" -f "source[path]=/"
```
Then poll until the status is `built`, waiting about 30 seconds between checks:
```bash
gh api repos/$OWNER/ffcas-website/pages -q '.status + "  " + .html_url'
```

### 5. Check the live site
```bash
URL=$(gh api repos/$OWNER/ffcas-website/pages -q .html_url)
for p in "" about.html animals.html events.html help.html contact.html content/settings.json assets/site.js; do
  echo "$(curl -s -o /dev/null -w '%{http_code}' "$URL$p")  $URL$p"
done
```
Every line should show `200`. If a browser tool is available, open the live URL and confirm the text renders on both a desktop-width and a phone-width window.

### 6. Stop and tell me what I need to do
These steps need a person to sign in, so list them for me and don't try them yourself:
1. Go to https://app.pagescms.org, sign in with GitHub, and install the Pages CMS GitHub app on the `ffcas-website` repo.
2. Open the repo in Pages CMS and confirm the menu shows Site Settings, Home Page, About Page, Animals, Events & News, How to Help, and Contact Page.
3. In Pages CMS, go to Collaborators and invite the volunteer by email.
4. Optional: add a custom domain in GitHub Settings → Pages.

## Done when
- [ ] The repo exists, is public, and has every file including the hidden ones.
- [ ] GitHub Pages status is `built`.
- [ ] Every URL in step 5 returns 200.
- [ ] You've reported back with the repo URL, the live site URL, and the manual steps from step 6.

## If something goes wrong
- **Pages shows a 404 right after it's enabled:** wait 2–3 minutes and check again. The first deploy can be slow.
- **Pages show no text:** `content/*.json` failed to load. Check for a path or case mismatch, and make sure the files were committed.
- **Pages CMS can't find the config:** `.pages.yml` must be at the repo root on `main`.
