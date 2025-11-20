using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

public class ProfileManager : MonoBehaviour
{
    public SocialAPI Api;
    public InputField UsernameInput;
    public InputField DisplayNameInput;
    public InputField BioInput;
    public Text StatusText;

    public void LoginAndSetup()
    {
        StartCoroutine(Api.Login(UsernameInput.text,
            (token) => { StatusText.text = "Logged in"; },
            (err) => { StatusText.text = "Login error: " + err; }));
    }

    public void UpdateProfile()
    {
        StartCoroutine(Api.UpdateProfile(DisplayNameInput.text, BioInput.text, null,
            (ok) => { StatusText.text = "Profile updated"; },
            (err) => { StatusText.text = "Update error: " + err; }));
    }
}