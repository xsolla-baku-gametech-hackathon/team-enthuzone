using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WaterMelon : MonoBehaviour
{
    public float duration = 5f;
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver)
        {


            SnakeAnimator snakeAnimator = FindObjectOfType<SnakeAnimator>();    
            snakeAnimator.AnimEat(); // animasya
            SoundManager.Instance.PlaySound(SoundType.GrowUp);
            SnakeSizeManager.Instance.SetBigSize(duration);
            ParticleManager.Instance.PlayBuffParticle();










            Destroy(gameObject); // Yox olsun
        }
    }
}
