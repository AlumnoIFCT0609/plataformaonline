import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, CheckCircle } from 'lucide-react';

const VideoPlayer = ({ lesson, enrollmentId, onComplete }) => {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const progressUpdateInterval = useRef(null);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    loadProgress();
    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, []);

  const loadProgress = async () => {
    try {
      const response = await fetch(
        `/api/v1/enrollments/${enrollmentId}/lessons/${lesson.id}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      const data = await response.json();
      
      if (data.lastPositionSeconds && videoRef.current) {
        videoRef.current.currentTime = data.lastPositionSeconds;
      }
      
      setIsCompleted(data.isCompleted);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (timeSpent, position, completed = false) => {
    try {
      await fetch(
        `/api/v1/enrollments/${enrollmentId}/lessons/${lesson.id}/progress`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timeSpentSeconds: timeSpent,
            lastPositionSeconds: position,
            isCompleted: completed
          })
        }
      );
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        startProgressTracking();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startProgressTracking = () => {
    if (progressUpdateInterval.current) {
      clearInterval(progressUpdateInterval.current);
    }
    
    progressUpdateInterval.current = setInterval(() => {
      if (videoRef.current) {
        saveProgress(
          Math.floor(videoRef.current.currentTime),
          Math.floor(videoRef.current.currentTime)
        );
      }
    }, 30000); // Save every 30 seconds
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Auto-complete when 90% watched
      const percentWatched = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (percentWatched >= 90 && !isCompleted) {
        markAsComplete();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const markAsComplete = async () => {
    setIsCompleted(true);
    await saveProgress(
      Math.floor(duration),
      Math.floor(currentTime),
      true
    );
    
    if (onComplete) {
      onComplete();
    }
  };

  const handleProgressClick = (e) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
      <div 
        className="relative group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={lesson.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completado
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 group/progress"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full relative group-hover/progress:h-2 transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover/progress:opacity-100" />
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              {/* Skip Buttons */}
              <button 
                onClick={() => skip(-10)}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => skip(10)}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button 
                  onClick={toggleMute}
                  className="hover:bg-white/20 p-2 rounded transition"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                />
              </div>

              {/* Time */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:bg-white/20 p-2 rounded transition flex items-center gap-1"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">{playbackRate}x</span>
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl p-2 min-w-[120px]">
                    <p className="text-xs text-gray-400 px-2 py-1">Velocidad</p>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-white/10 ${
                          playbackRate === rate ? 'text-blue-500' : ''
                        }`}
                      >
                        {rate}x {playbackRate === rate && '✓'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button 
                onClick={toggleFullscreen}
                className="hover:bg-white/20 p-2 rounded transition"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Play Overlay when paused */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="bg-blue-500 rounded-full p-6 hover:bg-blue-600 transition">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
        {lesson.content && (
          <p className="text-gray-400 text-sm">{lesson.content}</p>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;