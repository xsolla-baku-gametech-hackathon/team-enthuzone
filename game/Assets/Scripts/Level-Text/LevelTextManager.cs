using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class LevelTextManager : MonoBehaviour
{
    public static LevelTextManager Instance;
    public TMP_Text levelText;

    public int level = 1;

    private void Awake()
    {
        Instance = this;

        // Kaydedilmiş level varsa onu yükle
        level = PlayerPrefs.GetInt("PlayerLevel", 1);
        UpdateText();
    }

    void Update()
    {
        if (AppleManager.Instance.apple >= 10 * level)
        {
            Debug.Log("Next Level");
            level += 1;

            // Yeni leveli kaydet
            PlayerPrefs.SetInt("PlayerLevel", level);
            PlayerPrefs.Save();

            UpdateText();


            ComplateLevel();
        }
    }

    public void UpdateText()
    {
        levelText.text = "Level : " + level;
    }

    public void ComplateLevel()
    {
        UIManager.Instance.gameUI.SetActive(false);
        GameOverManager.Instance.gameOver = true;
        CameraManager.Instance.follow = false;
        ScoreManager.Instance.StopScore();
        UIManager.Instance.NextLevelUI.SetActive(true);
        UIManager.Instance.Conffeti.SetActive(true);
        SoundManager.Instance.PlaySound(SoundType.Win);
    }
}
