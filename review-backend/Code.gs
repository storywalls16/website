/**
 * STORYWALLS reviews: a tiny review inbox that lives in your own Google account.
 *
 *  - The website sends each new review here. It is saved in the Google Sheet as "pending"
 *    and emailed to you with APPROVE and REJECT buttons.
 *  - Approve  -> the review appears on the website automatically (within a minute).
 *  - Reject   -> it never appears.
 *  - Reviewers' email addresses are kept in the sheet only; the website never sees them.
 *
 * Setup steps are in guide.md, section "Automatic review approval".
 */

const OWNER_EMAIL = "storywallsarchitects@gmail.com";   // where review emails go
const SHEET_ID    = "1Cly4TOWIZ93gKa9MugrBInGFTVqThZ45fmvic4PDRWQ";   // the "STORYWALLS reviews" Google Sheet
const SHEET_NAME  = "Reviews";
const HEADERS     = ["id", "submitted", "status", "stars", "name", "email", "project", "review"];

/* Private key used only inside the approve/reject links emailed to you; created once and kept in the script's own settings */
function key_() {
  const props = PropertiesService.getScriptProperties();
  let k = props.getProperty("APPROVE_KEY");
  if (!k) { k = Utilities.getUuid().replace(/-/g, ""); props.setProperty("APPROVE_KEY", k); }
  return k;
}

function sheet_() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); sh.setFrozenRows(1); }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function clean_(s, max) {
  return String(s || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

/* New review from the website */
function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "bad request" }); }
  if (d.website) return json_({ ok: true });                       // hidden field filled in: a bot
  const stars = Math.max(1, Math.min(5, Math.round(Number(d.stars) || 0)));
  const name = clean_(d.name, 60), email = clean_(d.email, 100), project = clean_(d.project, 80), review = clean_(d.review, 600);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || review.length < 10) return json_({ ok: false, error: "missing fields" });

  const id = Utilities.getUuid().slice(0, 8);
  sheet_().appendRow([id, new Date(), "pending", stars, name, email, project, review]);

  const base = ScriptApp.getService().getUrl();
  const link = action => `${base}?action=${action}&id=${id}&key=${key_()}`;
  const starText = "★".repeat(stars) + "☆".repeat(5 - stars);
  const btn = (href, text, bg) => `<a href="${href}" style="display:inline-block;padding:12px 22px;margin-right:8px;border-radius:999px;background:${bg};color:#fff;text-decoration:none;font-weight:600">${text}</a>`;
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: `New ${stars}★ review from ${name} – approve?`,
    htmlBody:
      `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2F2219;max-width:560px">
        <p style="font-size:20px;color:#B65F3B;margin:0 0 8px">${starText}</p>
        <p style="font-size:17px;line-height:1.5;margin:0 0 14px">“${review}”</p>
        <p style="margin:0 0 4px"><b>${name}</b>${project ? " · " + project : ""}</p>
        <p style="margin:0 0 20px;color:#6B5D52">Email: ${email}</p>
        ${btn(link("approve"), "Approve – show on website", "#4B5541")}${btn(link("reject"), "Reject", "#97492A")}
        <p style="margin-top:20px;color:#6B5D52;font-size:13px">Approved reviews appear on the website within about a minute. You can also change the status in the Google Sheet at any time (approved / rejected).</p>
        <p style="color:#6B5D52;font-size:13px">Want to add a review yourself? <a href="${writeLink_()}" style="color:#97492A">Write a review</a></p>
      </div>`,
    replyTo: email
  });
  return json_({ ok: true });
}

/* Approve / reject links from the email, and the list of approved reviews for the website */
function doGet(e) {
  const p = e.parameter || {};
  if (p.action === "write") {
    if (p.key !== key_()) return HtmlService.createHtmlOutput("<p>Link not valid.</p>");
    return HtmlService.createHtmlOutput(writeForm_(p.key)).setTitle("Add a review – STORYWALLS")
      .addMetaTag("viewport", "width=device-width, initial-scale=1");
  }
  if (p.action === "approve" || p.action === "reject") {
    if (p.key !== key_()) return HtmlService.createHtmlOutput("<p>Link not valid.</p>");
    const sh = sheet_(), rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(p.id)) {
        const status = p.action === "approve" ? "approved" : "rejected";
        sh.getRange(i + 1, 3).setValue(status);
        CacheService.getScriptCache().remove("approved");
        return HtmlService.createHtmlOutput(
          `<div style="font-family:Arial,sans-serif;padding:40px;text-align:center;color:#2F2219">
             <h2 style="color:${status === "approved" ? "#4B5541" : "#97492A"}">Review ${status}</h2>
             <p>${status === "approved" ? "It will appear on the STORYWALLS website within a minute." : "It will not appear on the website."}</p>
           </div>`);
      }
    }
    return HtmlService.createHtmlOutput("<p>Review not found.</p>");
  }

  /* Public list: approved reviews only, newest first, without email addresses */
  const cache = CacheService.getScriptCache(), hit = cache.get("approved");
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
  const rows = sheet_().getDataRange().getValues().slice(1)
    .filter(r => String(r[2]).toLowerCase() === "approved")
    .reverse()
    .map(r => ({ stars: Number(r[3]) || 5, name: String(r[4]), project: String(r[6] || ""), quote: String(r[7]) }));
  const out = JSON.stringify({ reviews: rows });
  cache.put("approved", out, 60);
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

/* ----- Your own reviews: a private page (link in every review email) that publishes straight away ----- */
function writeLink_() {
  return `${ScriptApp.getService().getUrl()}?action=write&key=${key_()}`;
}

function writeForm_(key) {
  const field = "display:block;width:100%;box-sizing:border-box;margin:6px 0 16px;padding:11px 12px;border:1px solid #E4D9CA;border-radius:10px;font:16px Arial,sans-serif";
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:30px auto;padding:0 18px;color:#2F2219">
    <h2 style="font-weight:400">Add a review to the STORYWALLS website</h2>
    <p style="color:#6B5D52">It is published straight away (no approval needed).</p>
    <label>Rating<select id="stars" style="${field}"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>
    <label>Client name<input id="name" style="${field}"></label>
    <label>Home / project (optional)<input id="project" style="${field}" placeholder="e.g. 3 BHK interiors · Pune"></label>
    <label>Review<textarea id="review" rows="5" style="${field}"></textarea></label>
    <button id="go" style="padding:12px 24px;border:0;border-radius:999px;background:#B65F3B;color:#fff;font-size:15px;cursor:pointer">Publish review</button>
    <p id="msg" style="color:#4B5541"></p>
  </div>
  <script>
    document.getElementById("go").onclick = function () {
      var v = function (id) { return document.getElementById(id).value; };
      document.getElementById("msg").textContent = "Publishing…";
      google.script.run.withSuccessHandler(function (r) {
        document.getElementById("msg").textContent = r;
        if (r.indexOf("Published") === 0) ["name", "project", "review"].forEach(function (id) { document.getElementById(id).value = ""; });
      }).addOwnReview(${JSON.stringify(key)}, { stars: v("stars"), name: v("name"), project: v("project"), review: v("review") });
    };
  </script>`;
}

function addOwnReview(key, d) {
  if (key !== key_()) return "Link not valid.";
  const stars = Math.max(1, Math.min(5, Math.round(Number(d.stars) || 5)));
  const name = clean_(d.name, 60), project = clean_(d.project, 80), review = clean_(d.review, 600);
  if (!name || review.length < 10) return "Please add a name and a few words of review.";
  sheet_().appendRow([Utilities.getUuid().slice(0, 8), new Date(), "approved", stars, name, "(added by studio)", project, review]);
  CacheService.getScriptCache().remove("approved");
  return "Published! It will show on the website within a minute.";
}

/* Run once after deploying: emails you your private "Write a review" link */
function sendOwnerLink() {
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: "Your STORYWALLS review tools",
    htmlBody: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2F2219">
      <p>Reviews from the website will arrive here with <b>Approve</b> and <b>Reject</b> buttons.</p>
      <p>To add a review yourself (published straight away), use this private link. Keep it to yourself:</p>
      <p><a href="${writeLink_()}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#B65F3B;color:#fff;text-decoration:none;font-weight:600">Write a review</a></p>
    </div>`
  });
}
