using System.Collections;
using UnityEngine;

public class ReSpawnManager : MonoBehaviour
{
    public static ReSpawnManager Instance;

  

    private void Awake()
    {
        Instance = this;
    }

    public void SpawnerTimer()
    {
        StartCoroutine(FreezeTimeCoroutine());
    }

    private IEnumerator FreezeTimeCoroutine()
    {
        Fade.Instance.whiteFade.gameObject.SetActive(true);
        Fade.Instance.whiteFade.raycastTarget = true;
        Fade.Instance.whiteFade.canvasRenderer.SetAlpha(1f);

        // 0.5 saniye beyaz ekran
        yield return new WaitForSecondsRealtime(0.5f);

        // Zamanı durdur
        TimeManager.Instance.StopTime();

        // freezeTimeAfterRewind boyunca bekle
        yield return new WaitForSecondsRealtime(0.3f);

        // Zamanı başlat
        TimeManager.Instance.StartTime();

        // FadeOut yap (beyaz kaybolsun)
        Fade.Instance.FadeIn();

        Fade.Instance.whiteFade.raycastTarget = false;

        EnvColor.Instance.ChangeColor();
        ScoreManager.Instance.ResumeScore();

    }
}
