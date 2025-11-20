using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UI;

public class LudoManager : MonoBehaviour
{
    public GameAPI api;
    public Text statusText;
    public LudoBoardRenderer renderer;
    private long matchId;
    private int lastRoll = 6; // demo default

    public async void Start()
    {
        statusText.text = "Starting Ludo match...";
        var (mId, state) = await api.StartMatch("ludo");
        matchId = long.Parse(mId);
        renderer.RenderFromJson(state);
        statusText.text = $"Match {matchId} started.";
    }

    public async void ApplyMove(int token, string type)
    {
        var moveObj = new MoveObj { token = token, type = type, roll = lastRoll };
        var resp = await api.SendMove("ludo", matchId, moveObj, 1); // CPU easy
        renderer.RenderFromJson(resp);
    }

    public async void EndMatch()
    {
        var resp = await api.EndMatch("ludo", matchId, new { });
        statusText.text = resp;
    }

    [System.Serializable]
    private struct MoveObj { public int token; public string type; public int roll; }
}