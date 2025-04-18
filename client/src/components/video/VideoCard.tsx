import { Link } from "wouter";
import { type Video } from "@shared/schema";
import { formatDuration, formatViewCount, formatRelativeDate } from "@/lib/video";

interface VideoCardProps {
  video: Video;
}

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link href={`/video/${video.id}`}>
      <div className="video-card bg-[#242424] rounded-lg overflow-hidden hover:shadow-lg cursor-pointer transition-transform duration-200 hover:scale-103">
        <div className="relative aspect-w-16 aspect-h-9">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="object-cover w-full h-full"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-md mb-1 line-clamp-2 text-white">
            {video.title}
          </h3>
          <p className="text-[#B3B3B3] text-sm mb-1">
            {video.uploadedBy}
          </p>
          <div className="flex items-center text-[#B3B3B3] text-xs">
            <span>{formatViewCount(video.views)} views</span>
            <span className="mx-1">•</span>
            <span>{formatRelativeDate(new Date(video.uploadedAt))}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
