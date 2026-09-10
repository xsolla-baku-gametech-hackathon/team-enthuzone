using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SnakeSizeManager : MonoBehaviour
{
    public static SnakeSizeManager Instance;
    public bool bigSize;
    [SerializeField] private GameObject SnakeHead;
    private void Awake()
    {
        Instance = this;
    }
    private void Update()
    {
        //Speed Control
        if (bigSize)
        {
            SnakeController.Instance.speed = 40;
            SnakeController.Instance.driftSmoothness = 8;
        }

       
    }

    public void SetBigSize(float duration)
    {
        ParticleManager.Instance.PlayBuffParticle();
        UIManager.Instance.ShowBuffPopUp("buff !", 2);
        UIManager.Instance.BigSizeSlider.gameObject.SetActive(true);
        BigSizeSlider.Instance.InitializeSlider(duration);
        
            foreach (GameObject part in SnakeController.Instance.bodyParts)
        {
            if (part != null)
            {
               
                
                part.transform.localScale = new Vector3(2f, 2f, 2f); // Istenilen Scale
                SnakeHead.transform.localScale = new Vector3(3f, 3f, 3f);
                SnakeController.Instance.gap = 2;
                SnakeHead.transform.position += new Vector3(0f, 0.1f, 0f);
            }
        }
        bigSize = true;
        Rigidbody rb = SnakeHead.GetComponent<Rigidbody>();
        rb.mass = 10000;
    }

    public void SetNormalSize()
    {
        ParticleManager.Instance.PlayBuffParticle();
        UIManager.Instance.BigSizeSlider.gameObject.SetActive(false);

        SnakeController.Instance.normalSpeed = 30;
        foreach (GameObject part in SnakeController.Instance.bodyParts)
        {
            
            if (part != null)
            {
                part.transform.localScale = new Vector3(0.5f, 0.5f, 0.7f); // Normal Scale
                SnakeHead.transform.localScale = new Vector3(1, 1, 1);
                SnakeController.Instance.gap = 1;



                SnakeController.Instance.speed = SnakeController.Instance.normalSpeed;

            }
        }
        bigSize = false;
        Rigidbody rb = SnakeHead.GetComponent<Rigidbody>();
        rb.mass = 0.5f;
    }
}
