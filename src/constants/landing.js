import { TWITTER_WIDGET_API } from "./global";

export const GFW_ASSETS_PATH = process.env.REACT_APP_GFW_ASSETS_PATH;
export const SOCIAL_SHARE_URL = "https://globalnaturewatch.org/";
export const FACEBOOK_SHARE_URL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
  SOCIAL_SHARE_URL
)}`;

export const SOCIAL_FOOTER_SCRIPT = `
      // Twitter
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="${TWITTER_WIDGET_API}";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    `;

const Landing = {
  SOCIAL_FOOTER_SCRIPT,
  GFW_ASSETS_PATH,
  SOCIAL_SHARE_URL,
  FACEBOOK_SHARE_URL
};

export default Landing;
