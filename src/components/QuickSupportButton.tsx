import React, { useState } from 'react';
import { Phone, MessageCircle, X, Headphones } from 'lucide-react';

const QuickSupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePhoneCall = () => {
    window.location.href = 'tel:1-800-URBAN-CO';
  };

  const handleWhatsAppChat = () => {
    // Replace with your actual WhatsApp Business number
    const whatsappNumber = '1234567890'; // Your WhatsApp Business number
    const message = encodeURIComponent('Hi, I need support with your services.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:from-blue-800 active:to-purple-800 text-white shadow-2xl hover:shadow-xl transition-all duration-200 rounded-full px-6 py-4 flex items-center gap-3 font-semibold text-sm transform hover:scale-105 active:scale-95 cursor-pointer select-none border-0 outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
          >
            {isOpen ? (
              <>
                <X className="h-5 w-5" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Headphones className="h-5 w-5 animate-pulse" />
                <span className="whitespace-nowrap">Quick Support</span>
              </>
            )}
          </button>
          
          {/* Pulse animation ring */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20 pointer-events-none"></div>
          )}
        </div>
      </div>

      {/* Support Options Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6" style={{ zIndex: 9998 }}>
          <div className="w-72 shadow-2xl border-0 bg-white rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <h3 className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <Headphones className="h-5 w-5" />
                Quick Support
              </h3>
              <p className="text-xs text-center opacity-90 mt-1">We're here to help you 24/7</p>
            </div>
            
            <div className="p-3 sm:p-4">
              <div className="space-y-3">
                {/* Phone Call Support */}
                <button
                  onClick={handlePhoneCall}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800 text-white flex items-center gap-3 sm:gap-4 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-3 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0 outline-none focus:ring-2 focus:ring-green-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base">Call Support</div>
                    <div className="text-xs opacity-90 truncate">1-800-URBAN-CO • Instant Help</div>
                  </div>
                </button>

                {/* WhatsApp Live Chat */}
                <button
                  onClick={handleWhatsAppChat}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 active:from-emerald-700 active:to-green-700 text-white flex items-center gap-3 sm:gap-4 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-0 outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-sm sm:text-base">WhatsApp Chat</div>
                    <div className="text-xs opacity-90 truncate">Live chat • Quick responses</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-3 sm:mt-4 text-center bg-gray-50 -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 p-3 rounded-b-2xl">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Available 24/7 • Average response: 2 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 cursor-pointer"
          style={{ zIndex: 9997 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default QuickSupportButton;