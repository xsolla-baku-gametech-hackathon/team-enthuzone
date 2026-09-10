using System.Collections;
using UnityEngine;

public class LoopMovement : MonoBehaviour
{
    private bool triggered = false;
    public float distance = 10f;     // Gideceği mesafe, pozitif veya negatif olabilir
    public float speed = 5f;         // Hareket hızı
    private bool yes = true;
    private bool score = true;

    private Vector3 startPos;

    void Start()
    {
        startPos = transform.position;
    }

    void Update()
    {
        if (yes)
        {
            float moveDistance = Mathf.Abs(distance); // Pozitif değer al
            float zPos = Mathf.PingPong(Time.time * speed, moveDistance); // 0 -> distance -> 0
            transform.position = startPos + new Vector3(0, 0, zPos * Mathf.Sign(distance));
        }
        
    }

    private void OnTriggerEnter(Collider other)
    {
        if (!triggered && !GameOverManager.Instance.gameOver && other.CompareTag("SnakeHead")&&!SnakeSizeManager.Instance.bigSize)
        {
            triggered = true;
            GameOverManager.Instance.GameOver();
            StartCoroutine(ResetTrigger());
        }
        if (SnakeSizeManager.Instance.bigSize)
        {
            Rigidbody rb = GetComponent<Rigidbody>();
            if (rb == null)
            {
                rb = gameObject.AddComponent<Rigidbody>();
                rb.mass = 1f;

            }

            // Sağ veya sola doğru rastgele force uygula
            Vector3 direction = Random.value < 0.5f ? Vector3.back : Vector3.forward;
            rb.AddForce(direction * 2f, ForceMode.Impulse);

            // Rastgele dönme
            Vector3 randomSpin = new Vector3(
                Random.Range(-5f, 5f),  // X ekseni
                Random.Range(-5f, 5f),  // Y ekseni
                Random.Range(-5f, 5f)   // Z ekseni
            );
            rb.angularVelocity = randomSpin;
            yes = false;
            if (score && !GameOverManager.Instance.gameOver)
            {
                SoundManager.Instance.PlaySound(SoundType.BlockDest);
                ScoreManager.Instance.AddScore(5);
                UIManager.Instance.AddScoreUIPopUpFunc(5);
                score = false;
            }
            

        }
    }

    private IEnumerator ResetTrigger()
    {
        yield return new WaitForSeconds(0.1f);
        triggered = false;
    }
}
