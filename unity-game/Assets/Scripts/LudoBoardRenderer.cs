using UnityEngine;
using UnityEngine.UI;

public class LudoBoardRenderer : MonoBehaviour
{
    public Text boardText;

    public void RenderFromJson(string json)
    {
        boardText.text = json;
    }
}