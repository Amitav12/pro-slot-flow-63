import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { supabase } from '@/integrations/supabase/client';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
}

export const VideoCarousel: React.FC = () => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveVideos();
  }, []);

  const loadActiveVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading active videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (videos.length === 0 && !loading) {
    return null; // Don't show the section if no active videos
  }

  const handlePlayVideo = async (videoUrl: string) => {
    console.log('handlePlayVideo called with URL:', videoUrl);
    if (!videoUrl) {
      console.error('No video URL provided');
      return;
    }
    
    // Pause all other videos
    Object.values(videoRefs.current).forEach(video => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    
    // Toggle current video
    if (playingVideo === videoUrl) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(videoUrl);
      // Start playing the video
      const videoElement = videoRefs.current[videoUrl];
      if (videoElement) {
        try {
          await videoElement.play();
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/services/${category}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Watch our gallery
          </p>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Video Gallery
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our collection of videos showcasing our work and services.
          </p>
        </div>



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
              {videos.map((video) => (
                <CarouselItem key={video.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div 
                    className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10"
                  >
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[video.video_url] = el;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      preload="metadata"
                      muted={playingVideo !== video.video_url}
                      controls={playingVideo === video.video_url}
                      loop
                      onEnded={() => setPlayingVideo(null)}
                      onPause={() => {
                        if (playingVideo === video.video_url) {
                          setPlayingVideo(null);
                        }
                      }}
                    >
                      <source src={video.video_url} type="video/mp4" />
                    </video>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Play Button - Only show when video is not playing */}
                    {playingVideo !== video.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <button
                          onClick={() => {
                            console.log('Video play button clicked for:', video.video_url);
                            try {
                              if (video.video_url) {
                                handlePlayVideo(video.video_url);
                              } else {
                                console.error('No video URL available');
                              }
                            } catch (error) {
                              console.error('Video play failed:', error);
                            }
                          }}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110 border border-white/30 z-20"
                        >
                          <Play className="h-8 w-8 text-white fill-white" />
                        </button>
                      </div>
                    )}
                    
                    {/* Text Content */}
                    <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                      <h3 className="text-white font-bold text-xl md:text-2xl leading-tight mb-2">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="text-white/90 text-sm md:text-base leading-tight line-clamp-2">
                          {video.description}
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