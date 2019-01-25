import { h } from "hyperapp";

export default actions => ({
  state: {
    popins: {
      content: null
    }
  },
  view(state, actions) {
    if (state.popins.content !== null) {
      const content =
        state.popins.type === "image" ? (
          <img src={state.popins.content} alt="" />
        ) : (
          state.popins.content
        );

      const popinWrapper = (
        <div class="popin">
          <div class="popin-close" onclick={() => actions.popins.close()}>
            X<div class="popin-contents">{content}</div>
          </div>
        </div>
      );

      return popinWrapper;
    }
  },
  actions: {
    popins: {
      openPopinHTML: props => state => ({
        content: props.html,
        type: "html"
      }),
      openPopinImage: props => state => ({
        content: props.img,
        type: "image"
      }),
      openArticle: props => state => ({}),
      close: () => state => ({
        content: null
      })
    }
  }
});
