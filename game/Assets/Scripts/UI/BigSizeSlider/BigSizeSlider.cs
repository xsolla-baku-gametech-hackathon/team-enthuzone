using UnityEngine;
using UnityEngine.UI;
using DG.Tweening;

public class BigSizeSlider : MonoBehaviour
{
    public static BigSizeSlider Instance;
    public Slider slider;

    public float maxValue = 100f;

    private Tween sliderTween;

    private void Awake()
    {
        Instance = this;
    }

    public void InitializeSlider(float duration)
    {
        // Önceki animasyonu iptal et
        if (sliderTween != null && sliderTween.IsActive())
            sliderTween.Kill();

        // Baştan başlasın
        slider.maxValue = maxValue;
        slider.value = maxValue;

        // Yeni tween başlat
        sliderTween = slider.DOValue(0f, duration)
    .SetEase(Ease.Linear)
    .OnComplete(() =>
    {
       
        SnakeSizeManager.Instance.SetNormalSize(); // Animasyon bittiğinde çağrılır
    });
    }
}
