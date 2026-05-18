const API_KEY              = process.env.TWOFACTOR_API_KEY as string;
const SENDER_ID            = process.env.TWOFACTOR_SENDER_ID as string;
const OTP_TEMPLATE_NAME    = process.env.TWOFACTOR_OTP_TEMPLATE ?? 'General Otp';
const THANKS_TEMPLATE_NAME = process.env.TWOFACTOR_THANKS_TEMPLATE ?? 'General Thanking Template';

const THANKS_MESSAGE = () =>
  `Dear User, thank you for choosing us. Thank you for your support-QUIXENT DELIVERABLES PRIVATE LIMITED`;

const formatPhone = (mobile: string): string =>
  mobile.replace(/^\+?91/, '').trim().slice(-10);

export const sendOtpSms = async (mobile: string, otp: string): Promise<boolean> => {
  if (!API_KEY) return false;
  try {
    const phone = formatPhone(mobile);
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/${otp}/${encodeURIComponent(OTP_TEMPLATE_NAME)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json() as { Status: string };
    return data.Status === 'Success';
  } catch {
    return false;
  }
};

export const sendThankYouSms = async (mobile: string): Promise<boolean> => {
  if (!API_KEY) return false;
  try {
    const phone = formatPhone(mobile);
    const to       = encodeURIComponent(`+91${phone}`);
    const template = encodeURIComponent(THANKS_TEMPLATE_NAME);
    const msg      = encodeURIComponent(THANKS_MESSAGE());
    const url = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${API_KEY}&to=${to}&from=${SENDER_ID}&templatename=${template}&msg=${msg}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json() as { Status: string };
    return data.Status === 'Success';
  } catch {
    return false;
  }
};
