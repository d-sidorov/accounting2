function request(method, fields) {
  let arr = [];
  return new Promise(function(resolve) {
    BX24.callMethod(method, fields, function(result) {
      if (result.error()) {
        console.log(result.error());
      }
      if (Array.isArray(result.data())) {
        if (result.more()) {
          arr.push(...result.data());
          result.next();
        } else {
          arr.push(...result.data());
          return resolve(arr);
        }
      } else return resolve(result.data());
    });
  });
}

function batchRequest(calls) {
  return new Promise(function(resolve) {
    BX24.callBatch(calls, function(result) {
      return resolve(result);
    });
  });
}

export { request, batchRequest };
