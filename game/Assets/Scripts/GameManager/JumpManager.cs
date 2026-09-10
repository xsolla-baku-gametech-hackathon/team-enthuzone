using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class JumpManager : MonoBehaviour
{
    public static JumpManager Instance;
    public bool jumpBlock = false;

    public bool isJumping;

    public float oldSpeed;

    bool jumpReturn = false;
    private void Awake()
    {
        Instance = this;
    }


    private void FixedUpdate()
    {
        

        if (isJumping && jumpBlock)
        {
            SnakeController.Instance.speed = 25;
            jumpReturn = true;

        }

        if (isJumping  )
        {
            SnakeController.Instance.speed = 25;
      

        }
        if (!isJumping && !SpeedManager.Instance.speedTrigger)
        {
            SnakeController.Instance.speed = SnakeController.Instance.normalSpeed;


        }

        if (!isJumping && jumpBlock)
        {
            SnakeController.Instance.speed = 30;
            jumpBlock = false;
            jumpReturn = true;

        }

        if (!isJumping && !jumpBlock && jumpReturn)
        {
            SnakeController.Instance.speed = SnakeController.Instance.normalSpeed;
            jumpReturn = false;
        }
    }
}
