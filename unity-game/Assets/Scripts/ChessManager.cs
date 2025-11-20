using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.UI;

public class ChessManager : MonoBehaviour
{
    public GameAPI api;
    public Text statusText;
    public ChessBoardRenderer renderer;
    private long matchId;

    public async void Start()
    {
        statusText.text = "Starting Chess match...";
        var (mId, state) = await api.StartMatch("chess");
        matchId = long.Parse(mId);
        renderer.Render(state);
        statusText.text = $"Match {matchId} started.";
    }

    public async void ApplyMove(string from, string to)
    {
        var moveObj = new MoveObj { from = from, to = to };
        var resp = await api.SendMove("chess", matchId, moveObj, 1);
        renderer.Render(resp);
    }

    public async void EndMatch(string result)
    {
        var resp = await api.EndMatch("chess", matchId, new { result = result });
        statusText.text = resp;
    }

    [System.Serializable]
    private struct MoveObj { public string from; public string to; }
}