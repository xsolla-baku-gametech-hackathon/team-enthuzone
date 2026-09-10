using UnityEngine;

public class Apple : MonoBehaviour
{
    
    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("SnakeHead") && !GameOverManager.Instance.gameOver)
        {
            
            
            AppleManager appleManager = FindObjectOfType<AppleManager>();
            SnakeAnimator snakeAnimator = FindObjectOfType<SnakeAnimator>();
            SnakeController.Instance.GrowSnake(); // ilan boyusun
            snakeAnimator.AnimEat(); // animasya
            SoundManager.Instance.PlaySound(SoundType.EatApple);          
            AppleManager.Instance.AddApple(1);// alma elave et
            ScoreManager.Instance.AddScore(1); // score elave et
            UIManager.Instance.AddScoreUIPopUpFunc(1);

            
            
                
            

            
            

            Destroy(transform.parent.gameObject); // Yox olsun
        }
    }
}