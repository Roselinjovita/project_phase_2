import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WebcamCapture({ isActive, onFrameCapture }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isActive) {
            startWebcam();
        } else {
            stopWebcam();
        }
        return () => stopWebcam();
    }, [isActive]);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsEnabled(true);
            setError(null);
        } catch (err) {
            console.error('Error accessing webcam:', err);
            setError('Camera access denied. Please allow camera permissions.');
        }
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsEnabled(false);
    };

    const captureFrame = () => {
        if (videoRef.current && isEnabled) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);

            canvas.toBlob((blob) => {
                if (blob && onFrameCapture) {
                    onFrameCapture(blob);
                }
            }, 'image/jpeg', 0.8);
        }
    };

    // Auto-capture frames every 3 seconds when active
    useEffect(() => {
        if (isActive && isEnabled) {
            const interval = setInterval(() => {
                captureFrame();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isActive, isEnabled]);

    return (
        <Card className="p-4 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
                {isEnabled ? (
                    <Camera className="w-5 h-5 text-green-600" />
                ) : (
                    <CameraOff className="w-5 h-5 text-gray-400" />
                )}
                <h3 className="font-semibold text-gray-800">Emotion Detection</h3>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-sm p-4 text-center">
                        {error}
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {isEnabled && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    <span>Camera active - Analyzing emotions</span>
                </div>
            )}
        </Card>
    );
}
