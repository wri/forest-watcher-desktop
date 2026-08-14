import { render as utilRender, fireEvent } from "test-utils";
import RadioChipGroup, { IProps as IRadioChipGroupProps } from "../RadioChipGroup";

const radioOptions: IRadioChipGroupProps["options"] = [
  {
    className: "my-class-name",
    value: "email",
    name: "Email"
  },
  {
    className: "my-class-name",
    value: "zip",
    name: "Zip"
  },
  {
    className: "my-class-name",
    value: "pigeon",
    name: "Pigeon"
  }
];

describe("RadioChipGroup Component", () => {
  const onChange = jest.fn();

  const render = (props?: Omit<Omit<IRadioChipGroupProps, "options">, "onChange">) =>
    utilRender(<RadioChipGroup options={radioOptions} onChange={onChange} {...props} />);

  it("should render correctly", () => {
    const { container } = render({
      className: "my-class-name"
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="my-class-name c-radio-chip-group"
          id="headlessui-radiogroup-undefined"
          role="radiogroup"
        >
          <div
            class="c-radio-chip-group__options"
          >
            <div
              aria-checked="true"
              class="my-class-name c-radio-chip-group__item"
              data-checked=""
              data-headlessui-state="checked"
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="0"
            >
              <span
                class="c-chip c-chip--primary c-chip--is-selectable c-chip--is-selected"
              >
                Email
              </span>
            </div>
            <div
              aria-checked="false"
              class="my-class-name c-radio-chip-group__item"
              data-headlessui-state=""
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="-1"
            >
              <span
                class="c-chip c-chip--secondary c-chip--is-selectable"
              >
                Zip
              </span>
            </div>
            <div
              aria-checked="false"
              class="my-class-name c-radio-chip-group__item"
              data-headlessui-state=""
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="-1"
            >
              <span
                class="c-chip c-chip--secondary c-chip--is-selectable"
              >
                Pigeon
              </span>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it("should render with a label", () => {
    const { container } = render({
      label: "my.label"
    });

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-labelledby="headlessui-label-undefined"
          class="c-radio-chip-group"
          id="headlessui-radiogroup-undefined"
          role="radiogroup"
        >
          <div
            class="c-radio-chip-group__label"
            data-headlessui-state=""
            id="headlessui-label-undefined"
          >
            my.label
          </div>
          <div
            class="c-radio-chip-group__options"
          >
            <div
              aria-checked="true"
              class="my-class-name c-radio-chip-group__item"
              data-checked=""
              data-headlessui-state="checked"
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="0"
            >
              <span
                class="c-chip c-chip--primary c-chip--is-selectable c-chip--is-selected"
              >
                Email
              </span>
            </div>
            <div
              aria-checked="false"
              class="my-class-name c-radio-chip-group__item"
              data-headlessui-state=""
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="-1"
            >
              <span
                class="c-chip c-chip--secondary c-chip--is-selectable"
              >
                Zip
              </span>
            </div>
            <div
              aria-checked="false"
              class="my-class-name c-radio-chip-group__item"
              data-headlessui-state=""
              id="headlessui-radiogroup-option-undefined"
              role="radio"
              tabindex="-1"
            >
              <span
                class="c-chip c-chip--secondary c-chip--is-selectable"
              >
                Pigeon
              </span>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it("should correctly set the initial value", () => {
    const { getAllByRole } = render({
      value: "zip"
    });

    const zipChip = getAllByRole("radio")[1];

    expect(zipChip.attributes.getNamedItem("aria-checked")!.value).toBe("true");
  });

  it("should call onChange when radio option is changed", () => {
    const { getAllByRole } = render();

    fireEvent.click(getAllByRole("radio")[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith("zip");
  });
});
