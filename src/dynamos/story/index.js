// Required for JSX (see .babelrc)
import { h } from "hyperapp";
import Swiper from "swiper";
import YoutubePlayer from "youtube-player";

export default actions => ({
  // In mounted we only have access to actions.
  mounted(bindings) {
    const { initialElt } = bindings;

    // Get images & videos.
    const SlidesAndTimes = Object.values(
      initialElt.querySelectorAll(".slide")
    ).map(item => {
      const type = item.getAttribute("data-slide-type");
      let src;

      if (type === "image") {
        src = item.children[0].getAttribute("src");
      } else {
        src = item.getAttribute("data-slide-src");
      }

      return {
        type: type,
        src,
        time: item.getAttribute("data-slide-duration")
      };
    });

    // Set slides.
    actions.story.setSlides(SlidesAndTimes);

    // Store a nice ID.
    actions.story.createID();
  },
  state: {
    story: {
      slides: [],
      sliderId: null,
      swiper: null,
      currentSlide: 1
    }
  },
  view(state, actions) {
    const items = [];

    for (const slideIndex of Object.keys(state.story.slides)) {
      const slide = state.story.slides[slideIndex];
      items.push(
        <div
          class="swiper-slide slide"
          data-swiper-autoplay={slide.type === "image" ? slide.time : 1000000}
        >
          {slide.type === "image" ? (
            <img
              src={slide.src + "&" + Math.random()}
              width="300"
              height="550"
            />
          ) : (
            <div
              id={`youtube-${slide.src}`}
              oncreate={() => {
                actions.story.initYoutubeVideo({
                  videoId: slide.src,
                  slideIndex
                });
              }}
            />
          )}
        </div>
      );
    }

    return state.story.slides.length > 0 ? (
      <div
        style="width:400px"
        class="swiper-container"
        key={state.story.sliderId}
        id={state.story.sliderId}
        oncreate={() => actions.story.initSlider()}
      >
        <div class="swiper-wrapper">{items}</div>
      </div>
    ) : (
      <div />
    );
  },
  actions: {
    story: {
      /**
       *
       */
      createID: value => state => ({
        sliderId: `slider-${((Math.random() * 16) | 0).toString(4)}`
      }),
      /**
       *
       */
      initSlider: () => (state, actions) => {
        state.swiper = new Swiper(`#${state.sliderId}`, {
          autoplay: state.slides[0] ? state.slides[0].time : false
        });

        // Play video if there is one to play.
        state.swiper.on("slideChange", async function() {
          const index = this.activeIndex;

          if (state.slides[index].yt) {
            await state.slides[index].yt.loadVideoById({
              videoId: state.slides[index].src,
              playerVars: {
                autoplay: 1,
                rel: 0,
                controls: 0,
                fs: 1,
                playsinline: 1,
                enablejsapi: 1,
                showinfo: 0
              }
            });
            await state.slides[index].yt.seekTo(0);
            await state.slides[index].yt.playVideo();
          }
        });

        state.swiper.autoplay.start();
      },
      /**
       *
       */
      setCurrentSlide: value => state => ({ currentSlide: value }),
      /**
       *
       */
      setSlides: slides => state => {
        state.slides = slides;
      },
      /**
       *
       */
      initYoutubeVideo: ({ videoId, slideIndex }) => (state, actions) => {
        const player = YoutubePlayer(`youtube-${videoId}`, {
          width: 300,
          height: 550
        });

        state.slides[slideIndex].yt = player;

        player.on("stateChange", event => {
          if (event.data === YT.PlayerState.ENDED) {
            state.swiper.slideNext();
          }
        });
      }
    }
  }
});
