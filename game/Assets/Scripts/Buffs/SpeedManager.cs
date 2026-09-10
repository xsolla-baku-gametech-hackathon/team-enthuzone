using System.Collections;
using UnityEngine;

public class SpeedManager : MonoBehaviour
{
    public static SpeedManager Instance;
    private Coroutine activeRoutine;
    public bool speedTrigger;

    //[SerializeField] private float speedUpTime = 1f;   // Sürekli artış süresi
    [SerializeField] private float speedUp = 0.5f;     // Sürekli artış miktarı
    [SerializeField] private float minAllowedSpeed = 20f;

    private void Awake()
    {
        Instance = this;
    }



    // ------------------------------
    // Sürekli hız artışı
    // ------------------------------
    private void Update()
    {
        
    
       if (SnakeController.Instance.maxSpeed > SnakeController.Instance.normalSpeed && !speedTrigger && !SnakeSizeManager.Instance.bigSize && !JumpManager.Instance.isJumping)
        {
            SnakeController.Instance.speed += speedUp * Time.deltaTime;;
            SnakeController.Instance.normalSpeed += speedUp * Time.deltaTime;

            // Alt sınır kontrolü
            SnakeController.Instance.speed = Mathf.Max(SnakeController.Instance.speed, minAllowedSpeed);
            SnakeController.Instance.normalSpeed = Mathf.Max(SnakeController.Instance.normalSpeed, minAllowedSpeed);
         
        }
    }

    // ------------------------------
    // Geçici hız etkisi (power-up gibi)
    // ------------------------------
    public void ApplySpeedEffect(float targetSpeed, float holdTime, float afterLoss, float smoothTime)
    {
        if (activeRoutine != null)
            StopCoroutine(activeRoutine);

        activeRoutine = StartCoroutine(SpeedEffectRoutine(targetSpeed, holdTime, afterLoss, smoothTime));
    }

    private IEnumerator SpeedEffectRoutine(float targetSpeed, float holdTime, float afterLoss, float smoothTime)
    {
        float originalSpeed = SnakeController.Instance.speed;
        float normalSpeed = SnakeController.Instance.normalSpeed;

        // Hedef hıza yumuşak geçiş
        float elapsed = 0f;
        while (elapsed < smoothTime)
        {
            SnakeController.Instance.speed = Mathf.Lerp(originalSpeed, targetSpeed, elapsed / smoothTime);
            SnakeController.Instance.speed = Mathf.Max(SnakeController.Instance.speed, minAllowedSpeed);
            elapsed += Time.deltaTime;
            yield return null;
        }
        SnakeController.Instance.speed = Mathf.Max(targetSpeed, minAllowedSpeed);

        // Hedef hızda bekleme
        yield return new WaitForSeconds(holdTime);

        // Kaybı sonrası normal hıza yumuşak geçiş
        elapsed = 0f;
        while (elapsed < smoothTime)
        {
            SnakeController.Instance.speed = Mathf.Lerp(targetSpeed, normalSpeed, elapsed / smoothTime);
            SnakeController.Instance.speed = Mathf.Max(SnakeController.Instance.speed, minAllowedSpeed);
            elapsed += Time.deltaTime;
            yield return null;
        }
        SnakeController.Instance.speed = Mathf.Max(normalSpeed, minAllowedSpeed);

        // Kapat
        activeRoutine = null;
    }
}
