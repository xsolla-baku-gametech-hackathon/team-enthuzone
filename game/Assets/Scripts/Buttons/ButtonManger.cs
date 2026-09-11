using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class ButtonManger : MonoBehaviour
{
    public static ButtonManger Instance;

    public bool reSpawn = false;
    private Coroutine runningCoroutine;
    public bool speedBuffButton;



    


    public GameObject backGroundSound;


    private void Awake()
    {
        Instance = this;


       
        


        if (PlayerPrefs.HasKey("SoundOn"))
        {
            backGroundSound.SetActive(true);
            if (PlayerPrefs.GetInt("SoundOn") == 1) MaxSound();
            else
            {
                MinSound();
                backGroundSound.SetActive(false);
            }
               
        }
        else
        {
            MaxSound(); // default açık
        }
    }
    public void RestartGame()
    {
        PlayerPrefs.SetInt("firstTime", 0);
        PlayerPrefs.Save();
        Debug.Log("FirstTimeFalse");
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);

    }


    public void HomeButton()
    {
        PlayerPrefs.SetInt("firstTime", 1);
        PlayerPrefs.Save();
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }




    public void StartGame()
    {
        //if (TutorialManager.Instance.isTutorial)
        //{
        //    TimeManager.Instance.StartTime();           
        //    UIManager.Instance.menuUI.SetActive(false);
            
        //}
        
        
            TimeManager.Instance.StartTime();
            ScoreManager.Instance.ResumeScore();
            TelemetrySender.Instance.StartRequest();
            UIManager.Instance.menuUI.SetActive(false);
            UIManager.Instance.gameUI.SetActive(true);
            //UIManager.Instance.TutUIMobile.SetActive(false);
            UIManager.Instance.TutUIPC.SetActive(false);
        
        
       
    }

    public void MenuButton()
    {
        
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
        
    }

    public void NextLevel()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }


    public void SoundButton()
    {
        
        if (SoundManager.Instance.sound)
        {
            MinSound();
            SoundManager.Instance.sound = false;
            backGroundSound.SetActive(false);
           
        }
        else
        {
            MaxSound();
            SoundManager.Instance.sound = true;
            backGroundSound.SetActive(true);
        }
        PlayerPrefs.SetInt("SoundOn", SoundManager.Instance.sound ? 1 : 0);
        PlayerPrefs.Save();

    }

    public void ReSpawn()    
    {
        
       // SnakeController.Instance.turn = false;
        SnakeTeleporter.Instance.TeleportSnake();
        GameOverManager.Instance.gameOver = false;
        UIManager.Instance.gameOverUI.SetActive(false);
        UIManager.Instance.gameUI.SetActive(true);
        CameraManager.Instance.follow = true;
        SnakeController.Instance.normalSpeed = 30;
        ReSpawnManager.Instance.SpawnerTimer();

        UIManager.Instance.ReSpawnButton.SetActive(false);
        UIManager.Instance.buttonGroup.anchoredPosition = new Vector2(-26.3f,-89.6f);



    }


    public void SpeedUp()
    {
        if (!SpeedBoostButton.Instance.isCoolingDown && 
            !GameOverManager.Instance.gameOver && 
            !SnakeSizeManager.Instance.bigSize && 
            !JumpManager.Instance.isJumping)
        {


            if (runningCoroutine != null)
            {
                StopCoroutine(runningCoroutine);
            }

            if (!GameOverManager.Instance.gameOver && !SnakeSizeManager.Instance.bigSize)
            {
                speedBuffButton = true;
                SpeedManager.Instance.speedTrigger = true;
                Debug.Log("SPeedUpButton");
                SnakeController.Instance.speed += 15;
                UIManager.Instance.ShowBuffPopUp("speed up !", 0);
                SoundManager.Instance.PlaySound(SoundType.SpeedUp);
                runningCoroutine = StartCoroutine(TwoSecondCoroutine());

            }
            SpeedBoostButton.Instance.CoolDown();
        }
    }


    private IEnumerator TwoSecondCoroutine()
    {
        yield return new WaitForSeconds(2f);
        SpeedManager.Instance.speedTrigger = false;
        speedBuffButton = false;
        runningCoroutine = null;
    }
    public void PauseGame()
    {
        TelemetrySender.Instance.EndRequest();
        TimeManager.Instance.StopTime();
        UIManager.Instance.gameUI.SetActive(false);
        UIManager.Instance.pauseUI.SetActive(true);
    }




    public void PauseStart()
    {
        TelemetrySender.Instance.StartRequest();
        TimeManager.Instance.StartTime();
        UIManager.Instance.pauseUI.SetActive(false);
        UIManager.Instance.gameUI.SetActive(true);
    }

    public void MaxSound()
    {
        
        UIManager.Instance.onSound.SetActive(true);
        SoundManager.Instance.sound = true;
        UIManager.Instance.offSound.SetActive(false);
    }
    public void MinSound()
    {
        UIManager.Instance.onSound.SetActive(false);
        SoundManager.Instance.sound = false;   
        UIManager.Instance.offSound.SetActive(true);
    }

   

   
    
}
