using UnityEngine;
using UnityEngine.UI;

public class UploadUI : MonoBehaviour
{
    public SocialAPI Api;
    public Text StatusText;
    public Text UrlText;

    public void UploadSample()
    {
        // Generate a sample texture and upload as PNG
        var tex = new Texture2D(64, 64, TextureFormat.RGBA32, false);
        for (int y = 0; y < 64; y++)
        {
            for (int x = 0; x < 64; x++)
            {
                var c = new Color(x / 63f, y / 63f, 0.5f, 1f);
                tex.SetPixel(x, y, c);
            }
        }
        tex.Apply();
        var png = tex.EncodeToPNG();
        Destroy(tex);

        StartCoroutine(Api.UploadBytes("sample.png", png,
            (ok) => { StatusText.text = "Uploaded"; UrlText.text = ok; },
            (err) => { StatusText.text = "Error: " + err; }));
    }
}