import { CONTACT, SITE_URL } from "@/lib/contact";

/**
 * The confirmation a student gets after enquiring.
 *
 * Written as tables with inline styles on purpose. Outlook renders through
 * Word, Gmail strips <style> blocks and most clients ignore flexbox, grid and
 * custom properties — so none of the site's CSS applies here. Width is capped
 * at 600px, which is the widest that survives the common preview panes.
 */

export type CourseSummary = {
  title: string;
  tagline: string | null;
  level: string;
  sessions: number;
  duration: string;
  url: string;
  kind: "course" | "internship";
};

export type BatchSummary = {
  label: string;
  mode: string;
  centreName: string | null;
};

export type OtherCourse = {
  title: string;
  tagline: string | null;
  url: string;
};

export type EnquiryEmailInput = {
  name: string;
  accent: string;
  course: CourseSummary | null;
  batch: BatchSummary | null;
  others: OtherCourse[];
};

/** User-supplied values land in markup, so every one of them is escaped. */
function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const INK = "#14162b";
const INK_2 = "#4b4f68";
const INK_3 = "#6b6f86";
const LINE = "#e0e2eb";
const SURFACE = "#f2f3f7";
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function firstName(full: string) {
  return full.trim().split(/\s+/)[0] || full.trim();
}

export function enquiryConfirmationEmail(input: EnquiryEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, accent, course, batch, others } = input;
  const who = esc(firstName(name));

  const subject = course
    ? `Your enquiry about ${course.title} — GMS Technical Solutions`
    : "Thanks for your enquiry — GMS Technical Solutions";

  // Sits in the inbox preview line, after the subject.
  const preheader = course
    ? `We have your enquiry about ${course.title}. Someone from the centre will call you within one working day.`
    : "We have your enquiry. Someone from the centre will call you within one working day.";

  const coursePanel = course
    ? `
    <tr>
      <td style="padding: 0 32px 8px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
               style="border: 1px solid ${LINE}; border-radius: 12px; background: #ffffff;">
          <tr>
            <td style="padding: 20px 22px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: ${accent}; padding-bottom: 8px;">
                ${course.kind === "internship" ? "Your internship" : "Your course"}
              </div>
              <div style="font-size: 19px; font-weight: 700; color: ${INK}; line-height: 1.3; padding-bottom: 6px;">
                ${esc(course.title)}
              </div>
              ${
                course.tagline
                  ? `<div style="font-size: 14px; color: ${INK_2}; line-height: 1.6; padding-bottom: 14px;">${esc(course.tagline)}</div>`
                  : ""
              }
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                     style="border-top: 1px solid ${LINE}; margin-top: 4px;">
                <tr>
                  <td style="padding: 12px 0 0 0; font-size: 13px; color: ${INK_2}; line-height: 1.9;">
                    <strong style="color: ${INK};">Level</strong> &nbsp;${esc(course.level)}<br>
                    <strong style="color: ${INK};">Sessions</strong> &nbsp;${course.sessions}<br>
                    <strong style="color: ${INK};">Duration</strong> &nbsp;${esc(course.duration)}
                    ${
                      batch
                        ? `<br><strong style="color: ${INK};">Batch</strong> &nbsp;${esc(batch.label)}
                           <br><strong style="color: ${INK};">Mode</strong> &nbsp;${esc(batch.mode)}${batch.centreName ? ` — ${esc(batch.centreName)}` : ""}`
                        : ""
                    }
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 18px;">
                <tr>
                  <td style="background: ${accent}; border-radius: 8px;">
                    <a href="${esc(course.url)}"
                       style="display: inline-block; padding: 12px 22px; font-family: ${FONT}; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none;">
                      View the full syllabus
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : "";

  const othersPanel = others.length
    ? `
    <tr>
      <td style="padding: 24px 32px 0 32px;">
        <div style="font-size: 16px; font-weight: 700; color: ${INK}; padding-bottom: 4px;">
          You might also be interested in
        </div>
        <div style="font-size: 13px; color: ${INK_3}; padding-bottom: 14px;">
          Other programmes running at our Dehradun centre and live online.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${others
            .map(
              (o) => `
          <tr>
            <td style="padding: 0 0 10px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                     style="border: 1px solid ${LINE}; border-radius: 10px; background: ${SURFACE};">
                <tr>
                  <td style="padding: 14px 16px;">
                    <a href="${esc(o.url)}" style="font-size: 15px; font-weight: 700; color: ${INK}; text-decoration: none;">
                      ${esc(o.title)}
                    </a>
                    ${
                      o.tagline
                        ? `<div style="font-size: 13px; color: ${INK_2}; line-height: 1.6; padding-top: 3px;">${esc(o.tagline)}</div>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>`,
            )
            .join("")}
        </table>
      </td>
    </tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${SURFACE}; font-family: ${FONT};">
<div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">
  ${esc(preheader)}
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${SURFACE};">
  <tr>
    <td align="center" style="padding: 24px 12px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
             style="width: 600px; max-width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid ${LINE};">

        <!-- brand bar -->
        <tr>
          <td style="background: ${accent}; padding: 22px 32px;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
              GMS Technical Solutions
            </div>
            <div style="font-size: 13px; color: #ffffff; opacity: 0.85; padding-top: 3px;">
              IT and CS training in Dehradun, and live online across India
            </div>
          </td>
        </tr>

        <!-- greeting -->
        <tr>
          <td style="padding: 30px 32px 18px 32px;">
            <div style="font-size: 22px; font-weight: 700; color: ${INK}; line-height: 1.35; padding-bottom: 10px;">
              Thank you, ${who}.
            </div>
            <div style="font-size: 15px; color: ${INK_2}; line-height: 1.7;">
              We have received your enquiry${course ? ` about <strong style="color: ${INK};">${esc(course.title)}</strong>` : ""}.
              Someone from the centre will call you within one working day to answer your questions
              and, if you would like, book you a free demo class. Our calls come from
              <strong style="color: ${INK};">${esc(CONTACT.phoneDisplay)}</strong>, so do save the number.
            </div>
          </td>
        </tr>

        ${coursePanel}

        <!-- what happens next -->
        <tr>
          <td style="padding: 22px 32px 0 32px;">
            <div style="font-size: 16px; font-weight: 700; color: ${INK}; padding-bottom: 10px;">
              What happens next
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="font-size: 14px; color: ${INK_2}; line-height: 1.7;">
              <tr>
                <td width="26" valign="top" style="padding: 0 0 8px 0; color: ${accent}; font-weight: 700;">1.</td>
                <td style="padding: 0 0 8px 0;">We call you to understand what you want to learn and where you are starting from.</td>
              </tr>
              <tr>
                <td width="26" valign="top" style="padding: 0 0 8px 0; color: ${accent}; font-weight: 700;">2.</td>
                <td style="padding: 0 0 8px 0;">You sit in on a free demo class, in person at the centre or live online.</td>
              </tr>
              <tr>
                <td width="26" valign="top" style="padding: 0 0 8px 0; color: ${accent}; font-weight: 700;">3.</td>
                <td style="padding: 0 0 8px 0;">If it suits you, we confirm your seat and share the fee details with you.</td>
              </tr>
            </table>
          </td>
        </tr>

        ${othersPanel}

        <!-- contact -->
        <tr>
          <td style="padding: 26px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="border-top: 1px solid ${LINE};">
              <tr>
                <td style="padding: 20px 0 0 0;">
                  <div style="font-size: 16px; font-weight: 700; color: ${INK}; padding-bottom: 10px;">
                    Talk to us sooner
                  </div>
                  <div style="font-size: 14px; color: ${INK_2}; line-height: 1.9;">
                    <strong style="color: ${INK};">Phone</strong> &nbsp;
                    <a href="tel:${esc(CONTACT.phone)}" style="color: ${accent}; text-decoration: none;">${esc(CONTACT.phoneDisplay)}</a><br>
                    <strong style="color: ${INK};">WhatsApp</strong> &nbsp;
                    <a href="https://wa.me/${esc(CONTACT.whatsapp)}" style="color: ${accent}; text-decoration: none;">Message the centre</a><br>
                    <strong style="color: ${INK};">Email</strong> &nbsp;
                    <a href="mailto:${esc(CONTACT.email)}" style="color: ${accent}; text-decoration: none;">${esc(CONTACT.email)}</a><br>
                    <strong style="color: ${INK};">Open</strong> &nbsp;${esc(CONTACT.hours)}
                  </div>
                  <div style="font-size: 14px; color: ${INK_2}; line-height: 1.7; padding-top: 12px;">
                    <strong style="color: ${INK};">Visit the centre</strong><br>
                    ${CONTACT.addressLines.map((l) => esc(l)).join("<br>")}<br>
                    <a href="${esc(CONTACT.mapsUrl)}" style="color: ${accent}; text-decoration: none;">Get directions</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding: 24px 32px 28px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="border-top: 1px solid ${LINE};">
              <tr>
                <td style="padding: 16px 0 0 0; font-size: 12px; color: ${INK_3}; line-height: 1.7;">
                  <a href="${esc(SITE_URL)}" style="color: ${INK_3}; text-decoration: none; font-weight: 600;">gmstechnicalsolutions.com</a><br>
                  You received this because you submitted an enquiry on our website.
                  If that was not you, please ignore this email.
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

  // Plain-text alternative, for clients that refuse HTML and for spam scoring.
  const lines = [
    `Thank you, ${firstName(name)}.`,
    "",
    course
      ? `We have received your enquiry about ${course.title}. Someone from the centre will call you within one working day.`
      : "We have received your enquiry. Someone from the centre will call you within one working day.",
    `Our calls come from ${CONTACT.phoneDisplay}, so do save the number.`,
    "",
  ];

  if (course) {
    lines.push(
      course.kind === "internship" ? "YOUR INTERNSHIP" : "YOUR COURSE",
      course.title,
      ...(course.tagline ? [course.tagline] : []),
      `Level: ${course.level}`,
      `Sessions: ${course.sessions}`,
      `Duration: ${course.duration}`,
    );
    if (batch) {
      lines.push(
        `Batch: ${batch.label}`,
        `Mode: ${batch.mode}${batch.centreName ? ` — ${batch.centreName}` : ""}`,
      );
    }
    lines.push(`Syllabus: ${course.url}`, "");
  }

  lines.push(
    "WHAT HAPPENS NEXT",
    "1. We call you to understand what you want to learn.",
    "2. You sit in on a free demo class, at the centre or live online.",
    "3. If it suits you, we confirm your seat and share the fee details with you.",
    "",
  );

  if (others.length) {
    lines.push("YOU MIGHT ALSO BE INTERESTED IN");
    for (const o of others) {
      lines.push(`- ${o.title}`, `  ${o.url}`);
    }
    lines.push("");
  }

  lines.push(
    "TALK TO US SOONER",
    `Phone: ${CONTACT.phoneDisplay}`,
    `WhatsApp: https://wa.me/${CONTACT.whatsapp}`,
    `Email: ${CONTACT.email}`,
    `Open: ${CONTACT.hours}`,
    "",
    CONTACT.addressLines.join(", "),
    "",
    SITE_URL,
    "You received this because you submitted an enquiry on our website.",
  );

  return { subject, html, text: lines.join("\n") };
}
