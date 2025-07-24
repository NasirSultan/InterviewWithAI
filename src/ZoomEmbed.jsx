// src/ZoomEmbed.jsx
import React, { useEffect } from "react";
import { ZoomMtgEmbedded } from "@zoom/meetingsdk";
import { KJUR } from "jsrsasign";

const ZoomEmbed = () => {
  useEffect(() => {
    const zoomSDK = ZoomMtgEmbedded.createClient();

    const meetingSDKElement = document.getElementById("zoom-meeting");
    zoomSDK.init({
      debug: true,
      zoomAppRoot: meetingSDKElement,
      language: "en-US",
      customize: {
        meetingInfo: ["topic", "host"],
        toolbar: {
          buttons: [],
        },
      },
    });

    // Replace with your Zoom credentials
    const SDK_KEY = "YOUR_ZOOM_SDK_KEY";
    const SDK_SECRET = "YOUR_ZOOM_SDK_SECRET";
    const MEETING_NUMBER = "MEETING_ID"; // Example: 123456789
    const PASSWORD = "MEETING_PASSWORD";
    const USERNAME = "Guest User";

    // JWT Signature (expires in 2 mins)
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 120;
    const oHeader = { alg: "HS256", typ: "JWT" };
    const oPayload = {
      sdkKey: SDK_KEY,
      mn: MEETING_NUMBER,
      role: 0,
      iat,
      exp,
      appKey: SDK_KEY,
      tokenExp: exp,
    };
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, SDK_SECRET);

    zoomSDK.join({
      sdkKey: SDK_KEY,
      signature,
      meetingNumber: MEETING_NUMBER,
      password: PASSWORD,
      userName: USERNAME,
    });
  }, []);

  return <div id="zoom-meeting" style={{ width: "100%", height: "100vh" }}></div>;
};

export default ZoomEmbed;
