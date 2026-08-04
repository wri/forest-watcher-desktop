import { Component } from "react";
import FacebookLogo from "assets/images/icons/facebook-logo.svg";
import { FACEBOOK_SHARE_URL, SOCIAL_FOOTER_SCRIPT, SOCIAL_SHARE_URL } from "../../constants/landing";

class SocialFooter extends Component {
  componentDidMount() {
    if (!SOCIAL_FOOTER_SCRIPT) return;

    this.script = document.createElement("script");
    this.script.type = "text/javascript";
    this.script.async = true;
    this.script.innerHTML = SOCIAL_FOOTER_SCRIPT;
    document.body.appendChild(this.script);
  }

  componentWillUnmount() {
    if (this.script?.parentNode) {
      this.script.parentNode.removeChild(this.script);
    }
  }

  render() {
    return (
      <div className="c-social">
        <div className="row">
          <div className="small-6 columns">
            <div className="text -title-xxs -color-5">Spread the word</div>
            <div className="c-social__buttons">
              <a
                href="https://twitter.com/share"
                rel="noreferrer noopener"
                target="_blank"
                className="twitter-share-button"
                data-url={SOCIAL_SHARE_URL}
                data-text="Global Forest Watch"
              >
                Tweet
              </a>
              <a
                href={FACEBOOK_SHARE_URL}
                rel="noreferrer noopener"
                target="_blank"
                className="c-social__button-link"
                aria-label="Share Global Forest Watch on Facebook"
              >
                <span className="c-social__button-icon" aria-hidden="true">
                  <img alt="" src={FacebookLogo} />
                </span>
                Share
              </a>
            </div>
          </div>
          <div className="small-6 columns">
            <div className="text -title-xxs -color-5">Sign up to receive updates</div>
            <div className="c-social__icons">
              <a href="?show_newsletter=true" title="Receive Global Forest Watch updates">
                <svg className="icon">
                  <use xlinkHref="#icon-mail" />
                </svg>
              </a>
              <a
                href="https://twitter.com/globalforests"
                rel="noreferrer noopener"
                title="Follow @globalforests"
                target="_blank"
              >
                <svg className="icon">
                  <use xlinkHref="#icon-twitter" />
                </svg>
              </a>
              <a
                href="http://instagram.com/globalforests"
                rel="noreferrer noopener"
                title="Follow @globalforests Instagram"
                target="_blank"
              >
                <svg className="icon">
                  <use xlinkHref="#icon-instagram" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SocialFooter;
