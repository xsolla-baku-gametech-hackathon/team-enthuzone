using UnityEngine;
using System.Collections.Generic;

public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance;

    [System.Serializable]
    public class SoundData
    {
        public string name;
        public SoundType type;
        public AudioClip clip;
    }

    [Header("Audio")]
    public AudioSource sfxSource;
    public List<SoundData> sounds;
    public bool sound = true;

    private Dictionary<SoundType, AudioClip> soundDict;

    private void Awake()
    {
       Instance = this;
       BuildDictionary(); 
        
    }

    private void BuildDictionary()
    {
        soundDict = new Dictionary<SoundType, AudioClip>();
        foreach (var s in sounds)
        {
            if (!soundDict.ContainsKey(s.type))
                soundDict.Add(s.type, s.clip);
        }
    }

    public void PlaySound(SoundType type)
    {
        if (soundDict.TryGetValue(type, out AudioClip clip) && sound)
        {
            sfxSource.PlayOneShot(clip);
        }
      
    }

    public void MuteSound()
    {
        sound = false;
    }

    public void MaxSound()
    {
        
        sound = true;
    }
}

public enum SoundType
{
   LooseSound,
   BackGroundSound,
   EatApple,
   UISound,
   SnakeTurnSound,
   CompleteStage,
   SpeedUp,
   Jump,
   BlockDest,
   GrowUp,
   Win

    // Əlavə səs tipləri...
}

