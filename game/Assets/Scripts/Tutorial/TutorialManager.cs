using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class TutorialManager : MonoBehaviour
{

    public float minX = -156f;     // Sol sınır
    public float maxX = 216f;      // Sağ sınır
    public float duration = 2f;    // Bir yönde gitme süresi

    void Start()
    {
        if (ResponsiveManager.Instance.IsDesktop)
        {
     
           StartSwingPC();
        }

        if (ResponsiveManager.Instance.IsMobile)
        {
            StartSwingPC();
        }

    }

    void StartSwingPC()
    {
        //UIManager.Instance.TutUIMobile.SetActive(false);
        UIManager.Instance.TutUIPC.SetActive(true);
        UIManager.Instance.tutHand.anchoredPosition = new Vector2(minX, UIManager.Instance.tutHand.anchoredPosition.y);

        UIManager.Instance.tutHand.DOAnchorPosX(maxX, duration)
              .SetEase(Ease.InOutSine)
              .SetLoops(-1, LoopType.Yoyo)
              .SetUpdate(true); // <<< unscaledTime, pause olsa bile çalışır


        TMP_Text tutText = UIManager.Instance.tutText.GetComponent<TMP_Text>();

        tutText.DOFade(0f, 1f)
               .SetLoops(-1, LoopType.Yoyo)
               .SetUpdate(true);

        TMP_Text tutText1 = LevelTextManager.Instance.levelText.GetComponent<TMP_Text>();

        tutText1.DOFade(0f, 1f)
               .SetLoops(-1, LoopType.Yoyo)
               .SetUpdate(true);

    }


    void StartSwingMobile()
    {
        
        
    }
}
