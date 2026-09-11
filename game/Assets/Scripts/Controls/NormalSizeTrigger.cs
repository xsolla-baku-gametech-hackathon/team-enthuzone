using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NormalSizeTrigger : MonoBehaviour
{
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver && SnakeSizeManager.Instance.bigSize)
        {
            SnakeSizeManager.Instance.SetNormalSize();

        }
    }
}
