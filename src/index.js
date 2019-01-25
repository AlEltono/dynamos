import dynamoSDK from "./dynamo";

// Init dynamos.
new dynamoSDK({
  dynamos: {
    story: import("./dynamos/story"),
    loadmore: import("./dynamos/loadMore")
  },
  // Globals will expose the events to the whole window.
  // Use Dynamos.<dynamoID>.<actionName>()
  globalDynamos: {
    popins: import("./dynamos/popins")
  }
});
