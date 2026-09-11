using UnityEngine;

public class EnvWall : MonoBehaviour
{
    public Transform target; // Takip edilecek obje
    private Vector3 lastTargetPosition;

    void Start()
    {
        if (target != null)
            lastTargetPosition = target.position;
    }

    void Update()
    {
        if (target != null && !GameOverManager.Instance.gameOver)
        {
            // Hedefin bir önceki pozisyonu ile şimdiki pozisyonu arasındaki farkı hesapla
            Vector3 targetDelta = target.position - lastTargetPosition;

            // Aynı miktarda hareket et
            transform.position += targetDelta;

            // Son pozisyonu güncelle
            lastTargetPosition = target.position;
        }
    }
}
