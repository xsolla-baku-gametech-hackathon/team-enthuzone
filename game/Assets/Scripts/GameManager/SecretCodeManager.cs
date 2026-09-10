using UnityEngine;

public class SecretCodeManager : MonoBehaviour
{
    private string secretCode = "RAHMAN";
    private string input = "";

    void Update()
    {
        foreach (char c in Input.inputString)
        {
            input += c.ToString().ToUpper(); // Karakteri ekle ve büyük harfe çevir

            // Eğer input secretCode uzunluğundan büyük olursa baştan kes
            if (input.Length > secretCode.Length)
            {
                input = input.Substring(input.Length - secretCode.Length);
            }

            // Şifre doğruysa fonksiyonu tetikle
            if (input == secretCode)
            {
                TriggerSecretFunction();
                input = ""; // Tekrar tetiklememesi için sıfırla
            }
        }
    }

    void TriggerSecretFunction()
    {
        SnakeSizeManager.Instance.SetBigSize(100000f);
    }
}
