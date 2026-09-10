using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnvTrigger : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver)
        {
            GameOverManager.Instance.GameOver();










        }
    }
}
