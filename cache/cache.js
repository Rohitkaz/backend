import posts from "../models/post.js";
import { singleton } from "../utils/singleton.js";

const cache = singleton("serverCache", () => new Map());

function cacheget() {
  const duration=60000*10;
  if (cache.size == 0 || (Date.now()-cache.get("latestcomment").Date)>duration) {
    console.log("here");
    return null;
  }
  const data = {
    Latestpost: cache.get("latest").latest,
    Popularpost: cache.get("popular").popularpost,
    Trending: cache.get("trending").trending,
  };
  return data;
}
function cacheset(latest, popularpost, trending) {
  cache.set("latest", {latest:latest,Date:Date.now()});
  cache.set("trending", {trending:trending,Date:Date.now()});
  cache.set("popular", {popularpost:popularpost,Date:Date.now()});
}

async function getAllBlogs() {
  const LatestPro = posts.find({}).sort({ createdAt: -1 }).limit(10);
  const Popularpro = posts.find({}).sort({ views: -1 }).limit(10);
  const TrendingPro = posts.find({}).sort({ likes: -1, views: -1 }).limit(10);

  const [popular, latest, trending] = await Promise.all([
    LatestPro,
    Popularpro,
    TrendingPro,
  ]);

  return { popular, latest, trending };
}

export async function getCachedBlogs() {
    const cached = cacheget();
     if (cached) {
       return cached;
     }
  const { latest, popular, trending } = await getAllBlogs();
  cacheset(latest, popular, trending);
  return { Popularpost: popular, Latestpost: latest, Trending: trending };
}
