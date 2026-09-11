using TMPro;
using UnityEngine;

public class ScoreManager : MonoBehaviour
{
    public static ScoreManager Instance;

    public TMP_Text scoreText;          // mevcut score (senin kullandığın)
    public TMP_Text currentScoreText;   // leveldeki skor
    public TMP_Text highScoreText;      // high score

    private int score = 0;
    private int highScore = 0;

    private float timer = 0f;
    private float interval = 0.2f;

    private bool isRunning = false;

    private void Awake()
    {
        Instance = this;
    }

    void Start()
    {
        // Kayıtlı high score'u al
        highScore = PlayerPrefs.GetInt("HighScore", 0);

        UpdateScoreText();
        UpdateHighScoreText();
    }

    void Update()
    {
        if (isRunning)
        {
            timer += Time.deltaTime;
            if (timer >= interval)
            {
                timer = 0f;
                AddScore(1);
            }
        }
    }

    public void AddScore(int amount)
    {
        
        score += amount;

        // high score kontrol
        if (score > highScore)
        {
            highScore = score;
            PlayerPrefs.SetInt("HighScore", highScore);
            PlayerPrefs.Save();
            UpdateHighScoreText();
            
        }

        UpdateScoreText();
    }

    public void StopScore() => isRunning = false;

    public void ResumeScore() => isRunning = true;

    public void ResetScore()
    {
        score = 0;
        UpdateScoreText();
    }

    void UpdateScoreText()
    {
        scoreText.text = score.ToString();            // eski score text
        currentScoreText.text = "Score : " + score;    // yeni text
    }

    void UpdateHighScoreText()
    {
        highScoreText.text = "Best : " + highScore;
    }
    public int GetScore()
    {
        return score;
    }
}
