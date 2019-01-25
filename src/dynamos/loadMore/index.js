import { h } from "hyperapp";
import axios from "axios";
require("intersection-observer");

export default actions => ({
  async mounted(bindings) {
    // Get the props.
    const { props, currentElt } = bindings;

    // Attach current element to state so we can reference it later.
    actions.loadmore.setDomElement(currentElt);

    // Prepare the interaction obervable event.
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0.5) {
            // Init the call to the endpoint and populate the article.
            actions.loadmore.setStatus("loading");
            actions.loadmore.getArticle(props.id);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        // Play with margin so can preload early
        rootMargin: "0px",
        threshold: 1.0
      }
    );

    // Observe the target element.
    observer.observe(currentElt);
  },
  state: {
    loadmore: {
      endpoint: "https://demo9065320.mockable.io/getArticle",
      status: "idle",
      articleContents: {},
      DOMelement: null,
      loadingGif:
        "https://loading.io/spinners/typing/lg.-text-entering-comment-loader.gif"
    }
  },
  view(state, actions) {
    // Will be displayed when the content is loading.
    const loading = (
      <div>
        <img src={state.loadmore.loadingGif} />
      </div>
    );

    // We show the article in two steps :
    // - First we build the HTML for the article
    // - Then we set a class to "show" so we can do a nice transition.
    const article = (
      <div class={`${state.loadmore.status === "display" ? "show" : null}`}>
        <h2>{state.loadmore.articleContents.title}</h2>
        <div oncreate={element => actions.loadmore.buildHtml(element)} />
      </div>
    );

    switch (state.loadmore.status) {
      case "loaded":
      case "display":
        return article;

      case "loading":
        return loading;

      default:
        return <div />;
    }
  },
  actions: {
    loadmore: {
      setDomElement: DOMelement => state => ({
        DOMelement
      }),
      setStatus: status => state => ({
        status
      }),
      getArticle: id => {
        return (state, actions) => {
          axios
            .get(state.endpoint, {
              params: {
                id
              }
            })
            .then(({ data }) => {
              setTimeout(() => {
                actions.prepareArticle(data);
              }, 2000);
            });
        };
      },
      prepareArticle: data => state => ({
        articleContents: data,
        status: "loaded"
      }),
      buildHtml: element => async (state, actions) => {
        element.innerHTML = state.articleContents.body;

        // Make sure that we launch the dynamos tat got injected in DOM.
        await Dynamos.SDK.refresh();

        if (state.articleContents.loadMore) {
          actions.prepareNextArticle(state.articleContents.loadMore);
        }

        return {
          status: "display"
        };
      },
      prepareNextArticle: ({ id }) => async state => {
        // Create the DOM for the next item.
        const nextArticleDOM = document.createElement("article");
        nextArticleDOM.setAttribute("data-dynamo", "loadmore");
        nextArticleDOM.setAttribute(
          "data-dynamo-props",
          JSON.stringify(`{id:${id}}`)
        );

        state.DOMelement.parentNode.insertBefore(
          nextArticleDOM,
          state.DOMelement.nextSibling
        );

        await Dynamos.SDK.refresh();
      }
    }
  }
});
