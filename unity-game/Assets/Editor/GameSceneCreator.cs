using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;

public class GameSceneCreator
{
    [MenuItem("SocialDemo/Create Game Scenes")]
    public static void CreateGameScenes()
    {
        CreateLudoScenes();
        CreateChessScenes();
        CreateWordScene();
        EditorUtility.DisplayDialog("Game Scenes", "Ludo, Chess, and Word Sprint scenes created.", "OK");
    }

    static void CreateLudoScenes()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        var canvas = new GameObject("Canvas", typeof(Canvas));
        var scaler = canvas.AddComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        canvas.AddComponent<GraphicRaycaster>();
        var apiGO = new GameObject("GameAPI"); apiGO.AddComponent<GameAPI>();
        var mgrGO = new GameObject("LudoManager"); var mgr = mgrGO.AddComponent<LudoManager>(); mgr.api = apiGO.GetComponent<GameAPI>();
        var txtGO = new GameObject("BoardText"); var text = txtGO.AddComponent<Text>(); text.text = "Ludo State"; text.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); text.color = Color.white; txtGO.transform.SetParent(canvas.transform);
        var rendGO = new GameObject("LudoBoardRenderer"); var rend = rendGO.AddComponent<LudoBoardRenderer>(); rend.boardText = text;
        mgr.renderer = rend;
        var senderGO = new GameObject("LudoMoveSender"); var sender = senderGO.AddComponent<LudoMoveSender>(); sender.manager = mgr;
        PlaceUI(text.gameObject, new Vector2(0.5f, 0.5f), new Vector2(600, 300));
        SaveScene("Assets/Scenes/LudoBoard.unity");
    }

    static void CreateChessScenes()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        var canvas = new GameObject("Canvas", typeof(Canvas));
        var scaler = canvas.AddComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        canvas.AddComponent<GraphicRaycaster>();
        var apiGO = new GameObject("GameAPI"); apiGO.AddComponent<GameAPI>();
        var mgrGO = new GameObject("ChessManager"); var mgr = mgrGO.AddComponent<ChessManager>(); mgr.api = apiGO.GetComponent<GameAPI>();
        var txtGO = new GameObject("ChessState"); var text = txtGO.AddComponent<Text>(); text.text = "Chess State"; text.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); text.color = Color.white; txtGO.transform.SetParent(canvas.transform);
        var rendGO = new GameObject("ChessBoardRenderer"); var rend = rendGO.AddComponent<ChessBoardRenderer>(); rend.stateText = text; mgr.renderer = rend;
        PlaceUI(text.gameObject, new Vector2(0.5f, 0.5f), new Vector2(600, 300));
        SaveScene("Assets/Scenes/ChessBoard.unity");
    }

    static void CreateWordScene()
    {
        var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
        var canvas = new GameObject("Canvas", typeof(Canvas));
        var scaler = canvas.AddComponent<CanvasScaler>(); scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        canvas.AddComponent<GraphicRaycaster>();
        var apiGO = new GameObject("GameAPI"); apiGO.AddComponent<GameAPI>();
        var mgrGO = new GameObject("WordGameManager"); var mgr = mgrGO.AddComponent<WordGameManager>(); mgr.api = apiGO.GetComponent<GameAPI>();
        var lettersGO = new GameObject("LettersText"); var letters = lettersGO.AddComponent<Text>(); letters.text = "Letters"; letters.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); letters.color = Color.white; lettersGO.transform.SetParent(canvas.transform);
        PlaceUI(letters.gameObject, new Vector2(0.5f, 0.8f), new Vector2(600, 60));
        var inputGO = new GameObject("WordInput"); var input = inputGO.AddComponent<InputField>(); input.textComponent = inputGO.AddComponent<Text>(); input.textComponent.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); input.textComponent.color = Color.black; inputGO.transform.SetParent(canvas.transform);
        PlaceUI(input.gameObject, new Vector2(0.5f, 0.5f), new Vector2(300, 50));
        var addBtnGO = new GameObject("AddButton"); var addBtn = addBtnGO.AddComponent<Button>(); var addText = addBtnGO.AddComponent<Text>(); addText.text = "Add"; addText.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); addText.color = Color.black; addBtnGO.transform.SetParent(canvas.transform);
        PlaceUI(addBtn.gameObject, new Vector2(0.4f, 0.4f), new Vector2(120, 40));
        var submitBtnGO = new GameObject("SubmitButton"); var submitBtn = submitBtnGO.AddComponent<Button>(); var subText = submitBtnGO.AddComponent<Text>(); subText.text = "Submit"; subText.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); subText.color = Color.black; submitBtnGO.transform.SetParent(canvas.transform);
        PlaceUI(submitBtn.gameObject, new Vector2(0.6f, 0.4f), new Vector2(120, 40));
        var wordsListGO = new GameObject("WordsList"); var wordsText = wordsListGO.AddComponent<Text>(); wordsText.text = ""; wordsText.font = Resources.GetBuiltinResource<Font>("Arial.ttf"); wordsText.color = Color.white; wordsListGO.transform.SetParent(canvas.transform);
        PlaceUI(wordsText.gameObject, new Vector2(0.5f, 0.2f), new Vector2(600, 120));

        mgr.lettersText = letters; mgr.statusText = letters; mgr.wordInput = input; mgr.wordsListText = wordsText;
        var submitterGO = new GameObject("WordSubmitter"); var submitter = submitterGO.AddComponent<WordSubmitter>(); submitter.manager = mgr; submitter.addBtn = addBtn; submitter.submitBtn = submitBtn;
        SaveScene("Assets/Scenes/WordSprint.unity");
    }

    static void PlaceUI(GameObject go, Vector2 anchor, Vector2 size)
    {
        var rect = go.GetComponent<RectTransform>(); if (!rect) rect = go.AddComponent<RectTransform>();
        rect.anchorMin = rect.anchorMax = anchor; rect.sizeDelta = size; rect.anchoredPosition = Vector2.zero;
    }

    static void SaveScene(string path)
    {
        var dir = System.IO.Path.GetDirectoryName(path);
        if (!System.IO.Directory.Exists(dir)) System.IO.Directory.CreateDirectory(dir);
        EditorSceneManager.SaveScene(SceneManager.GetActiveScene(), path);
    }
}