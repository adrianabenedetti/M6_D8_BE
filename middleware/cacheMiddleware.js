const cache = new Map();

const cacheMiddleware = (req, res, next) => {
  const { url } = req;
  const cachedResponse = cache.get(url);

  if (cachedResponse) {
    return res.send(cachedResponse);
  }
  res.sendReponse = res.send;
  res.send = (body) => {
    cache.set(url, body);
    res.sendReponse(body);
  };

  next();
};

export default cacheMiddleware;
