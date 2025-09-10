import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAdminSettings } from '@/hooks/useAdminSettings';

interface VideoCategory {
  id: string;
  title: string;
  subtitle?: string;
  videoThumbnail: string;
  videoUrl: string;
  category: string;
}

export const VideoCarousel: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { data: videoData, isLoading } = useAdminSettings('video_carousel');

  if (isLoading) {
    return <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="animate-pulse text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </section>;
  }

  const videoCategories: VideoCategory[] = (videoData as any)?.videos?.map((video: any, index: number) => ({
    id: (index + 1).toString(),
    title: video.title.split(' ')[0],
    subtitle: video.title.split(' ').slice(1).join(' '),
    videoThumbnail: video.thumbnail,
    videoUrl: video.video_url,
    category: video.title.toLowerCase().replace(/\s+/g, '-')
  })) || [];

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/services/${category}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Watch real transformations
          </p>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {(videoData as any)?.title || 'Service Experience Videos'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {(videoData as any)?.subtitle || 'See our professional services in action and the quality transformations we deliver.'}
          </p>
        </div>

        {/* Video Modal */}
        {currentVideo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setCurrentVideo(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
              <div className="bg-black rounded-xl overflow-hidden">
                <video
                  controls
                  autoPlay
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh' }}
                >
                  <source src={currentVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        )}

        {/* Video Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {videoCategories.map((category) => (
                <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div 
                    className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10"
                  >
                    <img
                      src={category.videoThumbnail}
                      alt={`${category.title} ${category.subtitle || ''}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          console.log('Video play button clicked for:', category.videoUrl);
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlayVideo(category.videoUrl);
                        }}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110 border border-white/30"
                      >
                        <Play className="h-8 w-8 text-white fill-white" />
                      </button>
                    </div>
                    
                    {/* Text Content */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white font-bold text-2xl md:text-3xl leading-tight">
                        {category.title}
                      </h3>
                      {category.subtitle && (
                        <p className="text-white/90 font-bold text-2xl md:text-3xl leading-tight">
                          {category.subtitle}
                        </p>
                      )}
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="hidden md:flex -left-6 bg-white/90 hover:bg-white border-0 shadow-lg h-12 w-12" />
            <CarouselNext className="hidden md:flex -right-6 bg-white/90 hover:bg-white border-0 shadow-lg h-12 w-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};