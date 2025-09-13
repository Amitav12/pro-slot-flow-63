import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Upload,
  Video,
  Play,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Edit3
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Database } from '@/integrations/supabase/types';

type VideoItem = Database['public']['Tables']['gallery_videos']['Row'];

const VideoGalleryManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const videosPerPage = 4;
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const currentVideos = videos.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage
  );

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load videos. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateVideoFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a valid video file.';
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'Video file size must be less than 50MB.';
    }

    // Check video format
    const allowedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedFormats.includes(file.type)) {
      return 'Only MP4, WebM, and OGG video formats are supported.';
    }

    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      // Skip bucket creation since buckets already exist

      // Upload video to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('gallery_videos')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          video_url: publicUrl,
          file_size: file.size,
          is_active: true,
          description: ''
        });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Video uploaded successfully!',
      });

      // Reload videos
      await loadVideos();
    } catch (error) {
      console.error('Error uploading video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload video. Please try again.';
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteVideo = async (videoId: string, videoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = videoUrl.split('/');
      const filePath = `videos/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery_videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Video deleted successfully!',
      });

      // Reload videos
      await loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete video. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_videos')
        .update({ is_active: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Video ${!currentStatus ? 'activated' : 'deactivated'} successfully!`,
      });

      // Reload videos
      await loadVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update video status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDescription = async (videoId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('gallery_videos')
        .update({ description })
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Description updated successfully!',
      });

      setEditingVideo(null);
      setEditDescription('');
      // Reload videos
      await loadVideos();
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update description. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const startEditingDescription = (videoId: string, currentDescription: string) => {
    setEditingVideo(videoId);
    setEditDescription(currentDescription || '');
  };

  const cancelEditingDescription = () => {
    setEditingVideo(null);
    setEditDescription('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Video Gallery Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Upload and manage videos for the homepage carousel
          </p>
        </div>
        
        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Currently Showing</p>
                <p className="text-2xl font-bold">{Math.min(videosPerPage, videos.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(videos.reduce((acc, video) => acc + video.file_size, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Video Gallery</CardTitle>
          <CardDescription>
            Manage your video collection. Videos are displayed on the homepage carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No videos uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first video to get started with the gallery.
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload First Video
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentVideos.map((video) => (
                  <div key={video.id} className="group relative">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-video bg-gray-100">
                        <video
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          <source src={video.video_url} type="video/mp4" />
                        </video>
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setPreviewVideo(video.video_url)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteVideo(video.id, video.video_url)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm truncate flex-1" title={video.title}>
                            {video.title}
                          </h4>
                          <Badge variant={video.is_active ? 'default' : 'secondary'} className="ml-2">
                            {video.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        {/* Active Toggle */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground">Display on homepage:</span>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={video.is_active || false}
                              onCheckedChange={() => handleToggleActive(video.id, video.is_active || false)}
                            />
                          </div>
                        </div>
                        
                        {/* Description Section */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Description:</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingDescription(video.id, video.description || '')}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {editingVideo === video.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Enter video description..."
                                className="text-xs min-h-[60px]"
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateDescription(video.id, editDescription)}
                                  className="h-6 text-xs px-2"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingDescription}
                                  className="h-6 text-xs px-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground min-h-[40px] line-clamp-3">
                              {video.description || 'No description added'}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{formatFileSize(video.file_size)}</span>
                          <span>{formatDate(video.created_at)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <Badge variant="outline">
                      {videos.length} total videos
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      {previewVideo && (
        <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
              <DialogDescription>
                Preview your uploaded video
              </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                controls
                autoPlay
                className="w-full h-full"
                src={previewVideo}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VideoGalleryManager;