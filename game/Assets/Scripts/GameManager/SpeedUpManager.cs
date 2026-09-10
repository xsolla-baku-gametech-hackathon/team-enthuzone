using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SpeedUpManager : MonoBehaviour
{
    public static SpeedUpManager Instance;

    //public bool trigger =false;
    private void Awake()
    {
        Instance = this;
    }
    public void ResetTrigger()
    {
        StartCoroutine(WaitTwoSeconds());
    }

   


    IEnumerator WaitTwoSeconds()
    {
        
        yield return new WaitForSeconds(2f);
      //  trigger = false;
        
    }
}
