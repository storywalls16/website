# STORYWALLS website: guide

This folder holds the complete website, exactly as it looks on the Claude preview, with all your saved edits and photos written in. It needs no server code, database or build step, so any static host works, including Vercel.

## 1. What's in this folder

```
website/
├── site/                     ← THE WEBSITE. This is the only folder Vercel needs.
│   ├── index.html            ← the whole site: layout, text, projects, contacts, reviews
│   └── images/               ← every picture the site uses (40 files)
│       └── uploads/          ← your own photos: projects, founder, paintings (33 files)
├── guide.md                  ← this guide
├── claude-artifact/          ← the Claude version, kept for reference (not uploaded)
│   ├── studio-website.html
│   └── content.json          ← edits saved from the Claude editor (already written into site/index.html)
└── unused-images/            ← 51 older pictures the site no longer uses (safe to delete)
```

From now on, `site/index.html` is the master copy. The Claude preview link will not pick up changes you make here.

## 2. Preview on your computer

Double-click `site/index.html`. It opens in your browser and works offline. The fonts need an internet connection; without one, the text shows in a fallback font.

If you prefer a local web address (needs Node.js, see section 3B):

```bash
npx serve site
```

Then open the address it prints (usually http://localhost:3000).

## 3. Put it on Vercel

### A. With GitHub (recommended: every change you push goes live automatically)

1. Create a new repository on github.com and upload the contents of this `website` folder.
2. On vercel.com, choose **Add New → Project** and import that repository.
3. Before deploying, set:
   - **Framework Preset:** Other
   - **Root Directory:** `site`
   - **Build Command** and **Output Directory:** leave empty
4. Click **Deploy**. Your site appears at an address like `storywalls.vercel.app`.

To update the site later, change the files and push to GitHub. Vercel redeploys within a minute.

### B. With the Vercel command line (no GitHub)

1. Install Node.js (LTS version) from nodejs.org.
2. Install the Vercel tool:

```bash
npm install -g vercel
```

3. Go into the site folder:

```bash
cd C:\Users\ShubhS\Downloads\website\site
```

4. Deploy a preview. The first time, it asks you to log in and set up a project. Accept the defaults; the code is in `./`.

```bash
vercel
```

5. Publish to your live address:

```bash
vercel --prod
```

To update later, edit the files and run `vercel --prod` again from the `site` folder.

### Your own domain

In Vercel, open the project and go to **Settings → Domains**. Add `www.storywallsarchitects.com` (and `storywallsarchitects.com`). Vercel shows the DNS records to add at your domain registrar. HTTPS is set up for you.

## 4. Before you go live

| What | Where in `site/index.html` | Change |
|---|---|---|
| The dark "Draft preview" strip at the top | `const CONFIG = {` | Already switched off (`draft: false`). Set `true` to show it again. |
| Client reviews | `const REVIEWS = [` | Check the quotes are your clients' real words (see 5.4). |
| Consultation requests by email | `formEndpoint: ""` in CONFIG | See section 5.8 |

## 5. How to edit

Open `site/index.html` in a text editor (VS Code is free and colours the code; Notepad also works). Use **Ctrl+F** to find things. Line numbers below are approximate.

**Golden rules:**
- Keep the quote marks `"..."` around every piece of text.
- Keep the commas between items (the last item in a list has no comma).
- Save, then double-click `index.html` to check before uploading.

### 5.1 Contact details: `const CONFIG = {` (line ~1619)

| Field | What it does |
|---|---|
| `phone`, `phone2` | Phone numbers. Leave `""` to hide the "Call" row. |
| `whatsapp` | Digits only, with country code: `"919156567163"`. Used by every WhatsApp button. |
| `email`, `address`, `website` | Shown in the booking section, footer and menu. |
| `instagramUrl`, `instagramHandle`, `linkedinUrl` | Social links. |
| `formEndpoint` | Optional email delivery for the booking form (see 5.8). |
| `closedDays` | Days the date picker blocks: `[0]` = Sunday, `[0, 6]` = Sunday and Saturday. |
| `ideas` | `true` shows the "Ideas" section, `false` hides it. |
| `draft` | `false` hides the "Draft preview" strip. |

### 5.2 Projects ("Selected work"): `const PROJECTS = [` (line ~1641)

Each project is one block, shown on the page in the same order:

```js
{ id: "baner", title: "Mr. Jaikanth's Apartment Renovation", status: "Completed", type: "Apartment 3.5 BHK", location: "Baner, Pune",
  scope: "Complete renovation and interiors", rooms: "Living, dining, kitchen, pooja, kids' bedroom, wardrobes",
  brief: "The paragraph shown when the project opens.",
  cover: "uploads/jaikanth-living-room-tv-unit.jpg",
  materials: [["Carved teak", "#5F432A"], ["Warm white", "#E8E2DE"], ["Sand texture", "#C9BAAD"], ["Charcoal accents", "#2E2622"]],
  photos: [
    ["uploads/jaikanth-living-room-tv-unit.jpg", "Living Room Tv Unit"],
    ["uploads/jaikanth-dining-area.jpg", "Dining Area"]
  ] },
```

- **`title`, `type`, `location`, `scope`, `rooms`, `brief`:** the text shown on the card and inside the project. Type and location appear on the card.
- **`status`:** the label on the card. `"Renovation"` gets a terracotta dot, `"Designed"` a tan dot, anything else (e.g. `"Completed"`) a sage dot.
- **`cover`:** the picture on the project's card. Usually one of its photos.
- **`materials`:** the colour palette: `["Name", "#hex colour"]`. Pick hex colours with any online colour picker.
- **`photos`:** `["file", "caption"]`, one per line, in the order they appear. A caption can be `""` (then only the photo number shows).
- **`id`:** an internal name. Leave it as is.

**To add a photo:**
1. Copy the picture into `site/images/uploads/`, e.g. `kategeri-bedroom.jpg`.
2. Add a line to that project's `photos` list: `["uploads/kategeri-bedroom.jpg", "Bedroom"],`.

**To remove a photo:** delete its line, and fix the commas.

**To change the card picture:** set `cover` to any photo's file.

**Photo shapes:** when a project opens, the frame takes the shape most of its photos share (wide or tall). Photos of that shape fill it; odd ones show whole on a soft blurred background. A project with all landscape (or all portrait) photos looks cleanest.

### 5.3 Opening slideshow (top of the page)

- **Captions:** `const SLIDES = [` (line ~1638). One caption per slide, in order.
- **Pictures:** search for `data-ik="hero-1"` (line ~972). The three `<img class="slide" ...>` lines below it hold the three photos in `src="images/..."`. Replace the file name, and update the `alt="..."` description too.

### 5.4 Client reviews: `const REVIEWS = [` (line ~1775)

```js
{ quote: "Their words…", name: "Rahul Deshmukh", project: "Full-home interiors · Pune", stars: 5, sample: false },
```

`stars` is the rating shown above the quote (1 to 5; left out means 5).

**Removing a review (owner only):** visitors can never delete reviews; only you can, by editing this file. To take a review off the site but keep it for later, add `hidden: true` to it, e.g. `{ quote: "…", name: "…", project: "…", stars: 5, hidden: true },`. To delete it for good, remove its whole `{ … },` line (keep the commas right). Then redeploy.

**Reviews from visitors (you approve every one):** the "Write a review" button lets anyone pick 1–5 stars and enter their name, email (required, never shown) and review. No login is needed. When they press "Send review", the review is emailed to storywallsarchitects@gmail.com automatically. Afterwards they also see an optional "Also share it on WhatsApp" link (WhatsApp only reaches you if they press send; websites cannot send WhatsApp messages by themselves).

### 5.4a Automatic review approval (Approve in email → shows on the website)

**This is set up and working.** It runs from a small free script in your own Google account (storywallsarchitects@gmail.com):

- Google Sheet **STORYWALLS reviews** (tab "Reviews") holds every review.
- Apps Script project: open it from <https://script.google.com> (it's called "Untitled project"). Its code is the same as `review-backend/Code.gs` in this folder.
- Web app URL, already in `site/index.html` as `reviewsApi`: `https://script.google.com/macros/s/AKfycbwXtFZEy4vaitv4rpP9kyHpOaFEX0RCQMAjP0yaroCJsVGPlTauBDm0m0LhlpaOj9kJ/exec`

If you ever change `Code.gs`: paste it into the Apps Script editor, **Save**, then **Deploy → Manage deployments → pencil (edit) → Version: New version → Deploy**. That keeps the same URL.

**Writing a review yourself:** open the email **"Your STORYWALLS review tools"** and click **Write a review** (every review email also has a "Write a review" link at the bottom). Reviews added there go live straight away. Keep the link private. To get the email again, run `sendOwnerLink` in the Apps Script editor.

How it works:
- Every new review arrives by email as **"New 4★ review from Priya – approve?"** with **Approve** and **Reject** buttons.
- **Approve** → it appears on the website within about a minute, newest first. **Reject** (or do nothing) → it never appears.
- The Google Sheet lists every review. To take an approved review down later, change its status cell from `approved` to `rejected`.
- Reviewers' emails stay in your sheet only; the website never shows them.

If `reviewsApi` is ever emptied, reviews fall back to a plain email via FormSubmit (`reviewEmailEndpoint`), and publishing them means adding them to `REVIEWS` by hand.

### 5.5 Founder photo and paintings

- **Founder photo:** search `founder-jayesh-lunawat.jpg` (line ~1161). Replace the file in `images/uploads/` with the same name, or change the name in `src="..."`.
- **Paintings:** search `art-eternal-refuge-ram-sita.jpg`, `art-equine-contrast.jpg` and `art-urban-nostalgia.jpg` (line ~1206). The titles under them are the `<figcaption>` text right after each painting.

### 5.6 Any other text on the page

Search for a few words of it (Ctrl+F) and change the text between the tags, for example `<p class="lead">your text</p>`.

- Keep tags such as `<em>…</em>` (italic) and `<br>` as they are.
- In text inside the page, write `&amp;` for "&".
- The footer tagline is on the line with `class="foot-about"` (line ~1487).

### 5.7 Other pictures

| Picture | File(s) in `site/images/` | Where it's set |
|---|---|---|
| Logo badge (header and browser tab icon) | `logo-badge.png` | Same file name everywhere |
| Before / after slider | `bn-before.jpg`, `bn-after.jpg` | Search `ba-before` |
| House plans | `arch-talegaon-gf.jpg` etc. | `const DRAWINGS = [` (line ~1768) |
| Ideas section | `idea-<room>-<style>.jpg` (e.g. `idea-living-boho.jpg`) and `idea-arch-<style>.jpg`; the extra references are the same name with `-2`, `-3`… (e.g. `idea-living-boho-2.jpg`) | Replace the file and keep its name. Photographer credits are in `const IDEA_CREDITS` (first photo) and `const IDEA_MORE` (the extra ones, in order, as `["photographer", "design idea shown"]`; the idea name appears in the caption). To add one more reference, save it as the next number and add `["photographer", "idea name"]` to that look's list in `IDEA_MORE`. The "More … ideas on Pinterest" link under each look opens Pinterest's own search for that style. |

### 5.8 Booking form

Right now, when a visitor finishes the consultation form, the site shows a summary with a **Send on WhatsApp** button. The request reaches you only if they press it.

To also receive every request by email:
1. Create a free form at formspree.io (or web3forms.com).
2. Paste its address into CONFIG: `formEndpoint: "https://formspree.io/f/xxxxxxx",`.

### 5.9 The "Edit website" button

The in-page editor only works inside Claude; on Vercel it stays hidden. To make changes, edit `site/index.html` as described above.

## 6. Photo tips

- Use JPG, about 2000 px on the long side, ideally under 1 MB each. Smaller files mean a faster site on phones.
- Name files in lowercase with dashes and no spaces: `agrekar-kids-bedroom.jpg`.
- Vercel treats `Kitchen.JPG` and `kitchen.jpg` as different files, so the name in `index.html` must match exactly.

## 7. If something looks wrong after an edit

| Problem | Likely cause |
|---|---|
| Projects, reviews or contact buttons stop working | A missing comma or quote mark in the part you just edited. Press F12 in the browser, open **Console**, and the red message gives the line number. Undo your last change and try again. |
| A picture is missing | The file name or folder doesn't match exactly (check capital letters and `uploads/`). |
| A change doesn't show on the live site | You edited but didn't redeploy (push to GitHub, or run `vercel --prod`). Refresh with Ctrl+F5. |
