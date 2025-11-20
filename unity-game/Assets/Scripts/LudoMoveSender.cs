using UnityEngine;
using UnityEngine.UI;

public class LudoMoveSender : MonoBehaviour
{
    public LudoManager manager;
    public Button enterBtn;
    public Button advanceBtn;

    void Start()
    {
        enterBtn.onClick.AddListener(() => manager.ApplyMove(0, "enter"));
        advanceBtn.onClick.AddListener(() => manager.ApplyMove(0, "advance"));
    }
}