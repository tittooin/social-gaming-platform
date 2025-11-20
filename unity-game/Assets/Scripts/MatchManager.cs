using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class MatchManager : MonoBehaviour
{
    [Header("References")]
    public APIClient apiClient;
    public DiceController diceController;
    public Text statusText;
    public Text resultText;
    public Text walletText;
    public Button startButton;
    public Button rollButton;
    public Button endButton;

    private string currentMatchId = null;
    private int lastClientRoll = 0;

    void Start()
    {
        statusText.text = "Ready";
        resultText.text = "";
        walletText.text = "Wallet: -";
        rollButton.interactable = false;
        endButton.interactable = false;

        startButton.onClick.AddListener(() => StartCoroutine(OnStartMatch()));
        rollButton.onClick.AddListener(() => StartCoroutine(OnRoll()));
        endButton.onClick.AddListener(() => StartCoroutine(OnEndMatch()));
    }

    IEnumerator OnStartMatch()
    {
        statusText.text = "Starting match...";
        yield return apiClient.StartMatch((code, body) => {
            if (code == 200)
            {
                var resp = JsonUtility.FromJson<StartMatchResp>(body);
                currentMatchId = resp.matchId;
                statusText.text = "Match started";
                rollButton.interactable = true;
            }
            else
            {
                statusText.text = "Start failed: " + code;
            }
        });
    }

    IEnumerator OnRoll()
    {
        statusText.text = "Rolling...";
        yield return diceController.RollAnimated((roll) => {
            lastClientRoll = roll;
            resultText.text = "You rolled: " + roll;
            endButton.interactable = true;
        });
    }

    IEnumerator OnEndMatch()
    {
        if (string.IsNullOrEmpty(currentMatchId)) yield break;
        statusText.text = "Ending match...";
        yield return apiClient.EndMatch(currentMatchId, lastClientRoll, (code, body) => {
            if (code == 200)
            {
                var resp = JsonUtility.FromJson<EndMatchResp>(body);
                resultText.text = "Server roll: " + resp.serverRoll + " | +" + resp.reward + " chips";
                walletText.text = "Wallet: earned=" + resp.wallet.earned_chips + ", purchased=" + resp.wallet.purchased_chips + ", diamonds=" + resp.wallet.diamonds;
                statusText.text = "Match ended";
                rollButton.interactable = false;
                endButton.interactable = false;
            }
            else
            {
                statusText.text = "End failed: " + code;
            }
        });
    }

    [System.Serializable]
    private class StartMatchResp
    {
        public string matchId;
        public string serverSeed;
    }

    [System.Serializable]
    private class EndMatchResp
    {
        public int serverRoll;
        public int reward;
        public Wallet wallet;
    }

    [System.Serializable]
    private class Wallet
    {
        public long earned_chips;
        public long purchased_chips;
        public long diamonds;
    }
}