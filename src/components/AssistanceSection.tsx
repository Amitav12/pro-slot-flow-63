import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AssistanceSection = () => {
  return (
    <section className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Need immediate assistance?
        </h2>
        <p className="text-gray-600 mb-8">
          Our support team is here to help you 24/7
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          {/* Call Support */}
          <div className="bg-green-100 rounded-lg p-6 flex-1 w-full">
            <div className="flex items-center justify-center mb-3">
              <Phone className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Call Support</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Speak to our experts</p>
            <p className="text-sm font-medium text-gray-900 mb-3">1-800-URBAN-CO</p>
          </div>
          
          {/* Live Chat */}
          <div className="bg-blue-100 rounded-lg p-6 flex-1 w-full">
            <div className="flex items-center justify-center mb-3">
              <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Live Chat</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">Chat with our team</p>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-600">Online now</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            View All Support Options
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AssistanceSection;