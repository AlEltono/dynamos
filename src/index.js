import dynamoSDK from "./dynamo";
import popins from "./dynamos/popins/index";

// Init dynamos.
new dynamoSDK({
  dynamos: {
    story: import("./dynamos/story"),
    loadmore: import("./dynamos/loadMore")
  },
  // Globals will expose the events to the whole window.
  // Use Dynamos.<dynamoID>.<actionName>()
  globals: {
    popins: popins
  }
});
