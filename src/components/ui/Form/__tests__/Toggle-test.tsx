import { useForm } from "react-hook-form";
import { render } from "test-utils";
import Toggle from "../Toggle";

const UseFormWrapper = (args: any) => {
  const formHook = useForm();
  const { register } = formHook;
  return <Toggle {...args} registered={register("exampleInput")} formHook={formHook} />;
};

it("Toggle Input should render correctly unspecified", () => {
  const { container } = render(
    <UseFormWrapper
      id="toggle-input"
      toggleProps={{
        label: "Hello"
      }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="c-input c-input--toggle"
      >
        <label
          class="c-input__label"
          data-headlessui-state=""
          for="headlessui-switch-undefined"
          id="headlessui-label-undefined"
        >
          Hello
        </label>
        <button
          aria-checked="false"
          aria-labelledby="headlessui-label-undefined"
          class="c-input__toggle"
          data-headlessui-state=""
          id="headlessui-switch-undefined"
          role="switch"
          tabindex="0"
          type="button"
        >
          <span
            class="c-input__toggle-indicator"
          />
        </button>
      </div>
    </div>
  `);
});

it("Toggle Input should render correctly as true", () => {
  const { container } = render(
    <UseFormWrapper
      id="toggle-input"
      toggleProps={{
        label: "Hello",
        defaultValue: true
      }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="c-input c-input--toggle"
      >
        <label
          class="c-input__label"
          data-headlessui-state=""
          for="headlessui-switch-undefined"
          id="headlessui-label-undefined"
        >
          Hello
        </label>
        <button
          aria-checked="true"
          aria-labelledby="headlessui-label-undefined"
          class="c-input__toggle c-input__toggle--on"
          data-checked=""
          data-headlessui-state="checked"
          id="headlessui-switch-undefined"
          role="switch"
          tabindex="0"
          type="button"
        >
          <span
            class="c-input__toggle-indicator"
          />
        </button>
      </div>
    </div>
  `);
});

it("Toggle Input should render correctly as false", () => {
  const { container } = render(
    <UseFormWrapper
      id="toggle-input"
      toggleProps={{
        label: "Hello",
        defaultValue: false
      }}
    />
  );

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="c-input c-input--toggle"
      >
        <label
          class="c-input__label"
          data-headlessui-state=""
          for="headlessui-switch-undefined"
          id="headlessui-label-undefined"
        >
          Hello
        </label>
        <button
          aria-checked="false"
          aria-labelledby="headlessui-label-undefined"
          class="c-input__toggle"
          data-headlessui-state=""
          id="headlessui-switch-undefined"
          role="switch"
          tabindex="0"
          type="button"
        >
          <span
            class="c-input__toggle-indicator"
          />
        </button>
      </div>
    </div>
  `);
});
