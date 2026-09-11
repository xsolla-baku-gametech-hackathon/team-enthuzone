using UnityEngine;

public class TriggerSpeedLine : MonoBehaviour
{
    public float speedBoost = 15f;
    public float holdTime = 1f;
    public float afterLoss = 5f;
    public float smoothTime = 1f;
    public bool trigger = false;

    private System.Collections.IEnumerator resetCoroutine;

    private void Update()
    {
        // Eğer button aktifse Coroutine varsa durdur ama trigger resetleme
        if (ButtonManger.Instance.speedBuffButton && resetCoroutine != null)
        {
            StopCoroutine(resetCoroutine);
            resetCoroutine = null; // Coroutine durdu
            // trigger ve speedTrigger burada değiştirilmez
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") &&
            !GameOverManager.Instance.gameOver &&
            !SnakeSizeManager.Instance.bigSize &&
            !trigger)
        {
            SpeedManager.Instance.speedTrigger = true;
            SpeedUpManager.Instance.ResetTrigger();

            if (!ButtonManger.Instance.speedBuffButton)
            {
                float targetSpeed = SnakeController.Instance.speed + speedBoost;
                SpeedManager.Instance.ApplySpeedEffect(targetSpeed, holdTime, afterLoss, smoothTime);
            }
            else
            {
                SnakeController.Instance.speed += 5;
            }

            UIManager.Instance.ShowBuffPopUp("speed up !", 0);
            SoundManager.Instance.PlaySound(SoundType.SpeedUp);

            trigger = true;
            resetCoroutine = ResetTriggerAfterDelay(2f);
            StartCoroutine(resetCoroutine);
        }
    }

    private System.Collections.IEnumerator ResetTriggerAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        trigger = false;
        SpeedManager.Instance.speedTrigger = false;
        resetCoroutine = null;
    }
}
