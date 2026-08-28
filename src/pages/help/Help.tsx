import Hero from "components/layouts/Hero/Hero";
import EmptyState from "components/ui/EmptyState/EmptyState";
import Section from "components/ui/Section/Section";
import { fireGAEvent } from "helpers/analytics";
import { FormattedMessage, useIntl } from "react-intl";
import HelpIcon from "assets/images/icons/Help.svg";

const ZENDESK_FORM_LOCALES: Record<string, string> = {
  en: "en-us",
  es: "es-419",
  fr: "fr",
  id: "id",
  pt: "pt-br",
  nl: "en-us",
  mg: "en-us"
};

const Help = () => {
  const intl = useIntl();
  const zendeskFormLocale = ZENDESK_FORM_LOCALES[intl.locale] || ZENDESK_FORM_LOCALES.en;
  const zendeskFormUrl = `https://globalnaturewatch.zendesk.com/hc/${zendeskFormLocale}/requests/new`;

  return (
    <article className="relative">
      <Hero title={"help.title"} />

      <Section altBackground>
        <Section.Title className="mb-3">
          <FormattedMessage id="help.helpCenter.title" />
        </Section.Title>

        <Section.Text className="mb-10">
          <FormattedMessage id="help.helpCenter.subtitle" />
        </Section.Text>

        <EmptyState
          iconUrl={HelpIcon}
          title={intl.formatMessage({ id: "help.helpCenter.cta.title" })}
          text={intl.formatMessage({ id: "help.helpCenter.cta.subtitle" })}
          ctaText={intl.formatMessage({ id: "help.helpCenter.cta.link" })}
          ctaTo="https://globalnaturewatch.org/help/"
          ctaIsExternal
          ctaOnClick={() =>
            fireGAEvent({
              category: "Help",
              action: "help_centre",
              label: "visited_GNW_Help"
            })
          }
          textClassName="max-w-[600px]"
        />
      </Section>

      <Section>
        <Section.Title className="mb-3">
          <FormattedMessage id="help.form.title" />
        </Section.Title>

        <Section.Text>
          <FormattedMessage
            id="help.form.subtitle"
            values={{
              link: chunks => (
                <a href={zendeskFormUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {chunks}
                </a>
              )
            }}
          />
        </Section.Text>
      </Section>
    </article>
  );
};

export default Help;
