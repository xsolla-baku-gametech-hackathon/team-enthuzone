using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SnakeAnimator : MonoBehaviour
{
    Animator animator;

    void Start()
    {

        animator = GetComponent<Animator>();
    }


    public void AnimEat()
    {
        animator.SetTrigger("EatTrigger");
    }
}
