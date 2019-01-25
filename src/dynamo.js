import "./styles.css";
import { app } from "hyperapp";

export default class Dynamos {
  constructor(options) {
    this.options = Object.assign(
      {
        globals: {},
        dynamos: {}
      },
      options
    );

    // Add globals if available.
    if (options.globals && typeof options.globals === "object") {
      for (const globalType of Object.keys(options.globals)) {
        this.addGlobal(globalType, options.globals[globalType]);
      }
    }

    // Init the dynamos.
    this.init({ context: "init" });

    // Attach public SDK methods.
    window.Dynamos = window.Dynamos || {};
    window.Dynamos.SDK = this.publicMethods();
  }

  init(args = {}) {
    new Promise(resolve => {
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

      // Attach all actions.
      this.attachActions();

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
  }

  addGlobal(name, dynamo) {
    // Find the DOM element that represent this global dynamo.
    let DOM = document.querySelectorAll(`[data-dynamo=${name}]`);

    if (DOM.length > 1) {
      throw Error(
        `[Dynamo: ${name}] Only one dynamo DOM instance can be set for a global dynamo object.`
      );
    } else if (DOM.length === 0) {
      console.warn(
        `[Dynamo: ${name}] Could no find DOM element to attach the dynamo.`
      );
      return;
    }

    DOM = DOM[0];

    this.attachDynamo(dynamo, DOM);
  }

  /**
   * Attach all dynamo external actions from DOM.
   */
  attachActions() {
    document.querySelectorAll(`[data-dynamo-action]`).forEach(actionDom => {
      const action = actionDom.getAttribute("data-dynamo-action");
      const dynamo = actionDom.getAttribute("data-dynamo-target");
      const event = actionDom.getAttribute("data-dynamo-event");
      if (dynamo === null) {
        console.warn(
          `[Dynamo Action : ${action}] A dynamo action without a dynamo target can not work !`
        );
      }
    });
  }

  publicMethods() {
    return {
      refresh: async () => await this.init({ context: "refresh" })
    };
  }

  log(type, args) {
    switch (
      type
      // case ''
    ) {
    }
  }
}
