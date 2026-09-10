using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameOverManager : MonoBehaviour
{
    public static GameOverManager Instance;
    public bool gameOver = false;


    private void Awake()
    {
        Instance = this;

    }
    public void GameOver()
    {
        if (!gameOver)
        {
            TelemetrySender.Instance.EndRequest();
            SnakeController.Instance.FreezAll();
            SoundManager.Instance.PlaySound(SoundType.LooseSound);
            ScoreManager.Instance.StopScore();
            CameraManager.Instance.follow = false;
            UIManager.Instance.gameUI.SetActive(false);
            UIManager.Instance.gameOverUI.SetActive(true);
            
           // SnakeController.Instance.turn = false;
            gameOver = true;
        }


    }
    public bool isGameOver
    {
        get { return gameOver; }
    }
}
