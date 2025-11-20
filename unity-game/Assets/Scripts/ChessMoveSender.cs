using UnityEngine;
using UnityEngine.UI;

public class ChessMoveSender : MonoBehaviour
{
    public ChessManager manager;
    public InputField fromInput;
    public InputField toInput;
    public Button moveBtn;

    void Start()
    {
        moveBtn.onClick.AddListener(() => manager.ApplyMove(fromInput.text, toInput.text));
    }
}