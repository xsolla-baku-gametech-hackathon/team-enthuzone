using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ResponsiveUIManager : MonoBehaviour
{
    // Start is called before the first frame update
    void Update()
    {
        if (ResponsiveManager.Instance.IsMobile)
        {
          //  UIManager.Instance.apple.localScale = new Vector2(1f, 1f); // apple UI
          //  UIManager.Instance.pauseButton.localscale = new Vector2(1f, 1f); // pasue button
            UIManager.Instance.turnArea.gameObject.SetActive(false);
        }
        if (ResponsiveManager.Instance.IsDesktop)
        {
           
            UIManager.Instance.turnArea.gameObject.SetActive(false);
        }



    }


}
