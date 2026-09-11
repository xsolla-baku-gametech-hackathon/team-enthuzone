using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LoadTrigger : MonoBehaviour
{
    private bool trigger = true;
    


    private void OnTriggerEnter(Collider other)
    {
       
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver)
        {
            Debug.Log("LoadTrigger");
            int score = ScoreManager.Instance.GetScore();

            // LevelManager.Instance.LoadLevel(RandomIndex());
            //LevelManager.Instance.LoadLevel(1);

            //if (TutorialManager.Instance.isTutorial)
            //{
            //    LevelManager.Instance.LoadLevel(0);
            //}
            //else
            //{

          //  LevelManager.Instance.LoadLevel(2);



            if (LevelTextManager.Instance.level <= 5)
            {
                Debug.Log("LoadTrigger Level <= 5");

                if (LevelManager.Instance.diff == "Easy" && trigger == true)
                {
                    Debug.Log("LoadTrigger Easy");
                    trigger = false;
                    LevelManager.Instance.LoadLevel(Easy());

                }

                else if (LevelManager.Instance.diff == "Normal" && LevelManager.Instance.levelCounter == 4 && trigger == true)
                {
                    trigger = false;
                    LevelManager.Instance.LoadLevel(RandomIndex());

                }
            }
            else
            {
                trigger = false;
                LevelManager.Instance.LoadLevel(RandomIndex());
            }




            LevelManager.Instance.level = false;

            EnvColor.Instance.ChangeColor();
            Destroy(gameObject);


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

    }

    int RandomIndex()
    {
       int index = Random.Range(2, 13);
        return index;
    }
    int Easy()
    {
        int index = LevelManager.Instance.levelCounter;

        if (index == 0)
        {
            LevelManager.Instance.levelCounter = 1;

        }
        if (index== 1)
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
        return index;

    }
    int HardRandomIndex()
    {
        int index = Random.Range(4, 10);
        return index;
    }

}
