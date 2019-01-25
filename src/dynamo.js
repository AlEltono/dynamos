import "./styles.css";
import { app } from "hyperapp";

export default class Dynamos {
  constructor(options) {
    this.options = Object.assign(
      {
        globalDynamos: {},
        dynamos: {}
      },
      options
    );

    // Add globals if available.
    if (options.globalDynamos && typeof options.globalDynamos === "object") {
      for (const globalType of Object.keys(options.globalDynamos)) {
        options.globalDynamos[globalType].then(data => {
          this.addGlobal(globalType, data.default);
        });
      }
    }

    // Init the dynamos.
    this.init({ context: "init" });

    // Attach public SDK methods.
    window.Dynamos = window.Dynamos || {};
    window.Dynamos.SDK = this.publicMethods();
  }

  init(args = {}) {
    new Promise(async resolve => {
      // Get the DOM elements that use dynamo and prepare some Magic©.
      document.querySelectorAll("[data-dynamo]").forEach(elt => {
        const dynamoType = elt.getAttribute("data-dynamo");
        const dynamos = this.options.dynamos;

        if (Object.keys(dynamos).indexOf(dynamoType) === -1) {
          return;
        }

        dynamos[dynamoType].then(data => {
          this.attachDynamo(data.default, elt);
        });
      });

      resolve();
    });
  }

  attachDynamo(dynamo, elt) {
    const { state, actions, view } = dynamo();
    const dynamoProps = elt.getAttribute("data-dynamo-props") || {};

    // Create a clone of the DOM so we can use it in our dynamo module.
    const eltClone = elt.cloneNode(true);

    // Reset inner HTML content, it will be set by the dynamo module.
    elt.innerHTML = "";

    // Prepare bindings.
    const bindings = {
      initialElt: eltClone,
      currentElt: elt,
      props: dynamoProps.length > 0 ? JSON.parse(dynamoProps) : {}
    };

    // Init hyperApp
    const dynamoApp = app(state, actions, view, elt);

    // Execute mounted if found.
    if (dynamo().mounted) {
      dynamo(dynamoApp).mounted(bindings);
    }

    // Detach the dynamos attributes.
    elt.removeAttribute("data-dynamo");
    elt.removeAttribute("data-dynamo-props");

    return dynamoApp;
  }

  async addGlobal(name, dynamo) {
    // Find the DOM element that represent this global dynamo.
    let DOM = document.querySelectorAll(`[data-dynamo=${name}]`);

    if (DOM.length > 1) {
      this.log(
        "error",
        `[Dynamo: ${name}] Only one dynamo DOM instance can be set for a global dynamo object.`
      );
    } else if (DOM.length === 0) {
      this.log(
        "warn",
        `[Dynamo: ${name}] Could no find DOM element to attach the dynamo.`
      );
      return;
    }

    DOM = DOM[0];

    const dynamoAppActions = this.attachDynamo(dynamo, DOM);

    // Attach all actions linked to this global dynamo.
    await this.attachActions(name, dynamoAppActions);
  }

  /**
   * Attach all dynamo external actions from DOM.
   */
  attachActions(dynamo, dynamoActions) {
    return new Promise(resolve => {
      document
        .querySelectorAll(`[data-dynamo-target=${dynamo}]`)
        .forEach(actionDom => {
          const action = actionDom.getAttribute("data-dynamo-action");
          const event = actionDom.getAttribute("data-dynamo-event");
          const propsString = actionDom.getAttribute("data-dynamo-props");
          const props = propsString.length > 0 ? JSON.parse(propsString) : {};

          // Clean the element.
          actionDom.removeAttribute("data-dynamo-action");
          actionDom.removeAttribute("data-dynamo-target");
          actionDom.removeAttribute("data-dynamo-event");
          actionDom.removeAttribute("data-dynamo-props");

          if (dynamo === null) {
            this.log("warn", `[Dynamo Action : ${dynamo}] Action is missing !`);
          }

          let actions = dynamoActions[dynamo] || dynamoActions;

          if (Object.keys(actions).indexOf(action) === -1) {
            this.log(
              "warn",
              `[Dynamo Action : ${dynamo}] The action ${action} does not exists !`
            );
          }

          // Attach event to DOM element.
          actionDom.addEventListener(event, e => {
            actions[action].call(event, props);
          });
        });

      resolve();
    });
  }

  publicMethods() {
    return {
      refresh: async () => await this.init({ context: "refresh" })
    };
  }

  /**
   * Log for development mode.
   */
  log(type, message) {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    switch (type) {
      case "warn":
        console.warn(message);
        break;

      case "error":
        throw new Error(message);
        break;
    }
  }
}
