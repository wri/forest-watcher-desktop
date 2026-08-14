const ReactDOM = require("react-dom");
const ReactDOMClient = require("react-dom/client");
const React = require("react");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockUseIdCounter = 0;
jest.spyOn(React, "useId").mockImplementation(() => `:r${mockUseIdCounter++}:`);

beforeEach(() => {
  mockUseIdCounter = 0;
});

const roots = new WeakMap();

if (typeof ReactDOM.render !== "function") {
  ReactDOM.render = (element, container) => {
    let root = roots.get(container);

    if (!root) {
      root = ReactDOMClient.createRoot(container);
      roots.set(container, root);
    }

    root.render(element);
    return root;
  };
}

if (typeof ReactDOM.unmountComponentAtNode !== "function") {
  ReactDOM.unmountComponentAtNode = container => {
    const root = roots.get(container);

    if (!root) {
      return false;
    }

    root.unmount();
    roots.delete(container);
    return true;
  };
}

jest.mock("react-intl", () => {
  const React = require("react");
  const translations = require("./locales").default;
  const { DEFAULT_LANGUAGE } = require("./constants/global");
  const currentTranslations = (translations && translations[DEFAULT_LANGUAGE]) || {};

  const formatWithValues = (message, values = {}) => {
    if (!values || typeof message !== "string") {
      return message;
    }

    return Object.keys(values).reduce((output, key) => {
      return output.replace(new RegExp(`\\{${key}\\}`, "g"), String(values[key]));
    }, message);
  };

  const getMessage = ({ id, defaultMessage }, values) => {
    const template = currentTranslations[id] || defaultMessage || id || "";
    return formatWithValues(template, values);
  };

  return {
    IntlProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    FormattedMessage: ({ id, defaultMessage, values, children }) => {
      const text = getMessage({ id, defaultMessage }, values);

      if (typeof children === "function") {
        return children(text);
      }

      return React.createElement(React.Fragment, null, text);
    },
    useIntl: () => ({
      formatMessage: (descriptor, values) => getMessage(descriptor, values)
    })
  };
});
