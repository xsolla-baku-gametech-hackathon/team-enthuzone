using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SocialPlatforms.Impl;

public class CubeObstacle : MonoBehaviour
{
    public bool score = true;
    public int addScore = 1;
    public void OnTriggerEnter(Collider other)
    {

        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver && !SnakeSizeManager.Instance.bigSize)
        {


            GameOverManager.Instance.GameOver();

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


            if (score && !GameOverManager.Instance.gameOver)
            {
                SoundManager.Instance.PlaySound(SoundType.BlockDest);
                ScoreManager.Instance.AddScore(addScore);
                UIManager.Instance.AddScoreUIPopUpFunc(addScore);
                score = false;
            }
        }
    }



}