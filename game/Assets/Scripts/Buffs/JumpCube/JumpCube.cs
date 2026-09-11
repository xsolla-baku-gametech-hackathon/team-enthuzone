using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class JumpCube : MonoBehaviour
{
    public static JumpCube Instance;
   
    private float jumpForce = 100;
    public float oldSpeed;


    private void Awake()
    {
        Instance = this;
    }

    public Vector2 offsetChange;

    private Renderer objRenderer;

    void Start()
    {
        objRenderer = GetComponent<Renderer>();
    }

    void Update()
    {
        // Offset'i sürekli kaydırmak
        objRenderer.material.mainTextureOffset += offsetChange * Time.deltaTime;
    }


    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead"))
        {
            //oldSpeed = SnakeController.Instance.speed;
           

        }
    }

    private void OnCollisionEnter(Collision collision)
    {
        if(collision.collider.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver && !SnakeSizeManager.Instance.bigSize)       
        {
            
          


            //Debug.Log("active jumblock");




            // Artık tekrar tetiklenmez\



           


            SnakeController.Instance.JumpBlock(jumpForce);

            UIManager.Instance.ShowBuffPopUp("Jump !", 0);
            SoundManager.Instance.PlaySound(SoundType.Jump);



            StartCoroutine(CheckFlagAfterDelay());
           
        }
    }
   
            
        
    
    IEnumerator CheckFlagAfterDelay()
    {
        yield return new WaitForSeconds(0.2f); // 1 saniye bekle

        JumpManager.Instance.jumpBlock = true;

    }
}
