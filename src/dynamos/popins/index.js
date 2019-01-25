import { h } from "hyperapp";

export default actions => ({
  state: {
    popins: {}
  },
  view(state, actions) {
    return <div>coucou</div>;
  },
  actions: {
    popins: {
      openPopin() {}
    }
  }
});
