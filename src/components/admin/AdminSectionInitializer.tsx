import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Component to initialize missing admin sections
export const AdminSectionInitializer: React.FC = () => {
  const { isRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initializeMissingSections = async () => {
      // Only run for super admin to avoid multiple executions
      if (!isRole('super_admin')) return;

      try {
        // Check if sections already exist
        const { data: existingSections } = await supabase
          .from('admin_permissions')
          .select('section')
          .in('section', ['special-offers', 'video-gallery', 'service-management', 'popular-services']);

        const existingSectionNames = existingSections?.map(s => s.section) || [];
        
        const missingSections = [
          {
            section: 'special-offers',
            display_name: 'Special Offers',
            description: 'Manage promotional offers and discounts',
            is_enabled: true,
            sort_order: 12
          },
          {
            section: 'video-gallery',
            display_name: 'Video Gallery',
            description: 'Manage video content and gallery',
            is_enabled: true,
            sort_order: 13
          },
          {
            section: 'service-management',
            display_name: 'Service Status Control',
            description: 'Control service status and availability',
            is_enabled: true,
            sort_order: 14
          },
          {
            section: 'popular-services',
            display_name: 'Popular Services',
            description: 'Manage featured and popular services',
            is_enabled: true,
            sort_order: 15
          }
        ].filter(section => !existingSectionNames.includes(section.section));

        if (missingSections.length > 0) {
          const { error } = await supabase
            .from('admin_permissions')
            .insert(missingSections);

          if (error) {
            console.error('Error adding missing admin sections:', error);
          } else {
            console.log('✅ Added missing admin sections:', missingSections.map(s => s.section));
            // Optionally show a toast notification
            toast({
              title: "Admin Sections Updated",
              description: `Added ${missingSections.length} missing admin sections.`,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing admin sections:', error);
      }
    };

    initializeMissingSections();
  }, [isRole, toast]);

  // This component doesn't render anything
  return null;
};