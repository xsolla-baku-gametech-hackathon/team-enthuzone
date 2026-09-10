using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SnakePositionChecker : MonoBehaviour
{
    [Header("Settings")]
    public float minMoveDistance = 3f;   // en az hareket etmesi gereken mesafe
    public float maxIdleTime = 0.5f;     // hareketsiz kalma süresi (saniye)

    private float idleTimer;
    private Vector3 lastPosition;

    void Start()
    {
        lastPosition = transform.position;
        idleTimer = 0f;
    }

    void Update()
    {
        // X ve Z'deki farkı ölç
        float distanceX = Mathf.Abs(transform.position.x - lastPosition.x);
        float distanceZ = Mathf.Abs(transform.position.z - lastPosition.z);

        if (distanceX < minMoveDistance && distanceZ < minMoveDistance)
        {
            // Hareket etmemişse süre saymaya devam et
            idleTimer += Time.deltaTime;

            if (idleTimer >= maxIdleTime)
            {
                GameOver();
            }
        }
        else
        {
            // Yeterince hareket ettiyse sıfırla
            idleTimer = 0f;
            lastPosition = transform.position;
        }
    }

    void GameOver()
    {
        GameOverManager.Instance.GameOver();
    }
}
