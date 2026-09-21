/** Canonical origin, used for absolute links in emails. */
export const SITE_URL = "https://gmstechnicalsolutions.com";

export const CONTACT = {
  phone: "+919027252242",
  phoneDisplay: "+91 90272 52242",
  whatsapp: "919027252242",
  email: "admissions@gmstechnicalsolutions.com",
  addressLines: ["62/2 B, Vijay Colony", "Hathibarkala, Dehradun", "Uttarakhand 248001"],
  hours: "10 am to 7 pm, Monday to Saturday",
  mapsUrl: "https://maps.google.com/?q=62%2F2+B+Vijay+Colony+Hathibarkala+Dehradun",
};

/**
 * Formats an Indian number for display. Mobiles start 6-9 and read as 5+5;
 * landlines carry an STD code and read as 3+3+4, so splitting every 10-digit
 * number like a mobile turns +91 135 265 4321 into the unreadable +91 13526 54321.
 */
export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("91") ? digits.slice(2) : digits;
  if (local.length !== 10) return raw;
  return /^[6-9]/.test(local)
    ? `+91 ${local.slice(0, 5)} ${local.slice(5)}`
    : `+91 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}
