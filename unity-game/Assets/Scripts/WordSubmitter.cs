using UnityEngine;
using UnityEngine.UI;

public class WordSubmitter : MonoBehaviour
{
    public WordGameManager manager;
    public Button addBtn;
    public Button submitBtn;

    void Start()
    {
        addBtn.onClick.AddListener(manager.AddWord);
        submitBtn.onClick.AddListener(manager.SubmitWords);
    }
}