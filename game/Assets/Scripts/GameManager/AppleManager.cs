using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class AppleManager : MonoBehaviour
{
    public static AppleManager Instance;
    [Header("UI")]
    public TMP_Text amountApple;
    public TMP_Text amountAppleFinal;


    [Header("Apple Values")]
    public int apple = 0;        // Alma sayi
    public int totalApple = 0;   // Umumi alma sayi

    private void Awake()
    {
        Instance = this;
    }
    private void Start()
    {
        
        UpdateScoreText();
        
    }

    // Alma Artirma Fonksiyonu
    public void AddApple(int amount = 1)
    {
        apple += amount;
        totalApple += amount;
        UpdateScoreText();
    }

    // UI Update
    private void UpdateScoreText()
    {
        if (amountApple != null)
        {
            amountApple.text = apple.ToString() + "/" + 10*LevelTextManager.Instance.level;
            amountAppleFinal.text = apple.ToString() + "/" + 10 * LevelTextManager.Instance.level;
        }
    }

    // Alma Reset
    public void ResetApples()
    {
        apple = 0;
        totalApple = 0;
        UpdateScoreText();
    }
}
