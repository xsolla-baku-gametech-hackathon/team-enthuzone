using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoadTriggerLevel0 : MonoBehaviour
{
    private bool trigger = true;

    private void Start()
    {
        int score = ScoreManager.Instance.GetScore();

        // LevelManager.Instance.LoadLevel(RandomIndex());
        //LevelManager.Instance.LoadLevel(1);

        //if (TutorialManager.Instance.isTutorial)
        //{
        //    LevelManager.Instance.LoadLevel(0);
        //}
        //else
        //{
        if (LevelManager.Instance.diff == "Easy" && trigger == true)
        {
            trigger = false;
            LevelManager.Instance.LoadLevel(Easy());
            LevelManager.Instance.level = false;

            EnvColor.Instance.ChangeColor();
            Destroy(gameObject);
        }
        else if (LevelManager.Instance.diff == "Normal" && LevelManager.Instance.levelCounter == 4 && trigger == true)
        {
            trigger = false;
            LevelManager.Instance.LoadLevel(Easy());
            LevelManager.Instance.level = false;

            EnvColor.Instance.ChangeColor();
            Destroy(gameObject);
        }







        //else
        //{
        //    LevelManager.Instance.LoadLevel(RandomIndex());
        //}
        //if (score > 300 && score < 500)
        //{
        //    LevelManager.Instance.LoadLevel(HardRandomIndex());
        //}
        //if (score > 500)
        //{
        //    LevelManager.Instance.LoadLevel(RandomIndex());
        //}

        //}






    }





    int RandomIndex()
    {
        int index = Random.Range(2, 9);
        return index;
    }
    int Easy()
    {
        int index = LevelManager.Instance.levelCounter;

        if (index == 0)
        {
            LevelManager.Instance.levelCounter = 1;

        }
        if (index == 1)
        {
            LevelManager.Instance.levelCounter = 2;

        }
        else if (index == 2)
        {
            LevelManager.Instance.levelCounter = 3;
        }
        else if (index == 3)
        {
            LevelManager.Instance.levelCounter = 4;
            LevelManager.Instance.diff = "Normal";
        }
        else if (index == 4)
        {
            LevelManager.Instance.levelCounter = 5;
        }
        else if (index == 5)
        {
            LevelManager.Instance.levelCounter = 6;
        }
        else if (index == 6)
        {
            LevelManager.Instance.levelCounter = 7;
        }
        else if (index == 7)
        {
            LevelManager.Instance.levelCounter = 8;
        }
        else if (index == 8)
        {
            LevelManager.Instance.levelCounter = 9;
        }
        else if (index == 9)
        {
            LevelManager.Instance.levelCounter = 10;
        }
        else if (index == 10)
        {
            LevelManager.Instance.levelCounter = 11;
        }
        else if (index == 11)
        {
            LevelManager.Instance.levelCounter = 12;
        }
        return index;

    }
    int HardRandomIndex()
    {
        int index = Random.Range(4, 10);
        return index;
    }

}
