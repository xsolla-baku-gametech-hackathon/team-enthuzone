using UnityEngine;

public class TriggerSlowLine : MonoBehaviour
{
    public float slowAmount = 7f;
    public float holdTime = 1f;
    public float afterRecover = 0f;
    public float smoothTime = 1f;
    public float minAllowedSpeed = 20f;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver && !SnakeSizeManager.Instance.bigSize)
        {
            float targetSpeed = Mathf.Max(SnakeController.Instance.speed - slowAmount, minAllowedSpeed);
            SpeedManager.Instance.ApplySpeedEffect(targetSpeed, holdTime, afterRecover, smoothTime);
            UIManager.Instance.ShowBuffPopUp("Slow", 1);
        }
    }

  
}
