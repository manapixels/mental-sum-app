"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeOff } from "lucide-react";
import { useAudio } from "@/lib/hooks/use-audio";
import { useSoundEffects } from "@/lib/hooks/use-audio";

export function SoundToggleButton() {
  const { settings, updateSettings } = useAudio();
  const { playSettingsToggle } = useSoundEffects();

  const handleToggle = () => {
    const newSoundEnabled = !settings.soundEnabled;

    // Play toggle sound only if we're enabling sound
    if (newSoundEnabled) {
      // Small delay to ensure the setting is updated first
      setTimeout(() => playSettingsToggle(), 50);
    }

    updateSettings({ soundEnabled: newSoundEnabled });
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed bottom-4 left-4 z-30 backdrop-blur-sm border border-white/20 rounded-full p-3 transition-all duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={settings.soundEnabled ? "Mute sounds" : "Enable sounds"}
    >
      <motion.div
        animate={{
          scale: settings.soundEnabled ? 1 : 0.9,
        }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
      >
        {settings.soundEnabled ? (
          <Volume2 className="h-5 w-5 text-gray-600" />
        ) : (
          <VolumeOff className="h-5 w-5 text-gray-400" />
        )}
      </motion.div>
    </motion.button>
  );
}
