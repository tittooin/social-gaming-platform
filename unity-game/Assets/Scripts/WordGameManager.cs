using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UI;

public class WordGameManager : MonoBehaviour
{
    public GameAPI api;
    public Text lettersText;
    public Text statusText;
    public InputField wordInput;
    public Text wordsListText;
    private long matchId;
    private System.Collections.Generic.List<string> words = new System.Collections.Generic.List<string>();

    public async void Start()
    {
        var (mId, state) = await api.StartMatch("word");
        matchId = long.Parse(mId);
        lettersText.text = state;
        statusText.text = $"Word Sprint match {matchId} started";
    }

    public void AddWord()
    {
        var w = wordInput.text.Trim();
        if (w.Length == 0) return;
        words.Add(w);
        wordsListText.text = string.Join(", ", words);
        wordInput.text = "";
    }

    public async void SubmitWords()
    {
        var payload = new { words = words.ToArray() };
        var resp = await api.EndMatch("word", matchId, payload);
        statusText.text = resp;
    }
}