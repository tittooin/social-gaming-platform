using UnityEngine;
using UnityEngine.UI;

public class ChessBoardRenderer : MonoBehaviour
{
    public Text stateText;
    public void Render(string json)
    {
        stateText.text = json;
    }
}