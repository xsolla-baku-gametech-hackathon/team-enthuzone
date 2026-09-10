using UnityEngine;
using UnityEngine.UI;

public class Fade : MonoBehaviour
{
    public static Fade Instance;
    public Image whiteFade;
    public float fadeDuration = 0.5f;

    private void Awake()
    {
       
        
         Instance = this;
            
       
    }

    public void FadeIn()
    {
            
            whiteFade.CrossFadeAlpha(0f, fadeDuration, false);
    }

    public void FadeOut()
    {
        
        whiteFade.CrossFadeAlpha(1f, fadeDuration, false);

    }
}
