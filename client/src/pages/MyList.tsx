
import { useEffect, useState } from "react";
import { getMyList } from "@/lib/auth";
import VideoCard from "@/components/video/VideoCard";
import { type Video } from "@shared/schema";

export default function MyList() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchMyList = async () => {
      const myList = getMyList();
      const responses = await Promise.all(
        myList.map(id => 
          fetch(`/api/videos/${id}`).then(res => res.json())
        )
      );
      setVideos(responses.filter(video => video !== null));
    };
    
    fetchMyList();
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold my-4">My List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
