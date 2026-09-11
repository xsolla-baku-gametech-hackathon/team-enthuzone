using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class SpeedBoostButton : MonoBehaviour
{
    public static SpeedBoostButton Instance;
    private float cooldownTime = 15; // cooldown süresi (sn)
    public bool isCoolingDown = false;
    private Image buttonImage;
    private void Awake()
    {
   
       Instance = this;
     
    }
    private void Start()
    {
        buttonImage = UIManager.Instance.speedBoostButtonFade.GetComponent<Image>();
    }

    public void CoolDown()
    {
        isCoolingDown = true;
        StopAllCoroutines(); // aynı anda birden fazla çalışmasın
        StartCoroutine(CooldownRoutine());
    }

    private IEnumerator CooldownRoutine()
    {
        buttonImage.fillAmount = 1f;
        float elapsed = 0f;

        while (elapsed < cooldownTime)
        {
            elapsed += Time.deltaTime;
            buttonImage.fillAmount = 1f - (elapsed / cooldownTime);
            yield return null;
        }

        buttonImage.fillAmount = 0f; // garanti olsun
        isCoolingDown = false;
    }
}
