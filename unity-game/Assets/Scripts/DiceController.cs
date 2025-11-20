using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class DiceController : MonoBehaviour
{
    public Text diceText;

    public IEnumerator RollAnimated(System.Action<int> onDone)
    {
        int final = Random.Range(1, 7);
        // Simple flicker animation
        for (int i = 0; i < 12; i++)
        {
            int v = Random.Range(1, 7);
            if (diceText != null) diceText.text = v.ToString();
            yield return new WaitForSeconds(0.05f);
        }
        if (diceText != null) diceText.text = final.ToString();
        onDone?.Invoke(final);
    }
}