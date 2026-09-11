using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class UIManager : MonoBehaviour
{
    /// <summary>
    /// Add Score textleri ucun
    /// </summary>
    private Vector3 startPos;
    private Sequence popupSeq;
    /// <summary>
    /// 
    /// </summary>
    /// 
    /// <summary>
    /// Buff Textleri ucun
    /// </summary>
    private Vector3 startPosBuff;
    private Sequence popupSeqBuff;
    /// <summary>
    /// 
    /// </summary>






    public static UIManager Instance;

    public GameObject menuUI;
    public GameObject gameUI;
    public GameObject gameOverUI;
    public GameObject pauseUI;
    public GameObject TutUIPC;
    public GameObject TutUIMobile;

    public GameObject NextLevelUI;

    public GameObject Conffeti;


    public GameObject onSound;
    public GameObject offSound;

    public GameObject turnAreLeft; 
    public GameObject turnAreRight;

    public GameObject speedUpButton;

    public GameObject ReSpawnButton;

    public RectTransform turnArea;
    
    public RectTransform apple;

    public RectTransform pauseButton;

    public RectTransform scoreUI;

    public RectTransform AddScorePopUpUI;

    public RectTransform BuffPopUpUI;

    public RectTransform BigSizeSlider;

    public RectTransform Fade;

    public RectTransform tutHand;

    public RectTransform tutLeftArrow;
    public RectTransform tutRightArrow;

    public RectTransform tutLine;

    public RectTransform tutText;


    public RectTransform speedBoostButtonFade;

    public RectTransform buttonGroup;






    private void Awake()
    {
        Instance = this;
    }








    public void AddScoreUIPopUpFunc(int score)
    {
        var text = AddScorePopUpUI.GetComponent<TMPro.TextMeshProUGUI>();

        // Aktif animasyon varsa iptal et
        if (popupSeq != null && popupSeq.IsActive())
            popupSeq.Kill();

        // Text'i ayarla
        text.text = "+" + score;

        // Reset
        AddScorePopUpUI.gameObject.SetActive(true);
        text.color = new Color(text.color.r, text.color.g, text.color.b, 1);
        AddScorePopUpUI.transform.localScale = Vector3.zero;

        // Pozisyonu resetle
        if (startPos == Vector3.zero)
            startPos = AddScorePopUpUI.transform.position;
        AddScorePopUpUI.transform.position = startPos;

        // Yeni animasyon
        popupSeq = DOTween.Sequence();
        popupSeq.Append(AddScorePopUpUI.transform.DOScale(1.2f, 0.2f).SetEase(Ease.OutBack)) // pop efekti
                .Append(AddScorePopUpUI.transform.DOScale(1f, 0.1f)) // biraz geri küçül
                .Join(AddScorePopUpUI.transform.DOMoveY(startPos.y + 100f, 1f)) // yukarı süzül
                .Join(text.DOFade(0, 1f)) // alpha azalır
                .OnComplete(() => AddScorePopUpUI.gameObject.SetActive(false));
    }
    public void ShowBuffPopUp(string value, int isBuff)
    {
        var text = BuffPopUpUI.GetComponent<TextMeshProUGUI>();

        // Eğer animasyon varsa durdur
        if (popupSeqBuff != null && popupSeqBuff.IsActive())
            popupSeqBuff.Kill();

        // Text ve alpha reset
        if(isBuff == 0)
        {
            ColorUtility.TryParseHtmlString("#40FF20", out Color green);
            text.color = Color.green;
        }
        if (isBuff == 1)
        {
            ColorUtility.TryParseHtmlString("#FD312A", out Color red);
            text.color = Color.red;
        }
        if (isBuff == 2)
        {
            ColorUtility.TryParseHtmlString("#593C89", out Color purple);
            text.color = purple;
            
        }
        text.text = value;
        BuffPopUpUI.gameObject.SetActive(true);
        text.color = new Color(text.color.r, text.color.g, text.color.b, 1);
        BuffPopUpUI.localScale = Vector3.zero;

        // Başlangıç pozisyonunu sakla ve resetle
        if (startPosBuff == Vector3.zero)
            startPosBuff = BuffPopUpUI.position;
        BuffPopUpUI.position = startPosBuff;

        // Animasyon sequence
        popupSeqBuff = DOTween.Sequence();
        popupSeqBuff.Append(BuffPopUpUI.DOScale(1.2f, 0.2f).SetEase(Ease.OutBack)) // pop efekti
                    .Append(BuffPopUpUI.DOScale(1f, 0.1f)) // biraz geri küçül
                    .Join(BuffPopUpUI.DOMoveY(startPosBuff.y + 100f, 1f)) // yukarı süzül
                    .Join(text.DOFade(0, 1f)) // alpha azalır
                    .OnComplete(() => BuffPopUpUI.gameObject.SetActive(false));
    }

}
