import React, { useState } from "react";
import axios from "axios";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.17.0/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

function ZoomMeeting() {
  const [meetingNumber, setMeetingNumber] = useState("");
  const [passWord, setPassWord] = useState("");
  const [userName, setUserName] = useState("Guest User");

  const joinMeeting = async () => {
    const signatureResponse = await axios.post(
      `${meta.env.REACT_APP_BACKEND_URL}/api/zoom/signature`,
      {
        meetingNumber,
        role: 0,
      }
    );

    const signature = signatureResponse.data.signature;

   
ZoomMtg.init({
  leaveUrl: window.location.origin,
  debug: true,
  isSupportAV: true,
  success: (initSuccess) => {
    console.log("Zoom INIT Success", initSuccess);

    ZoomMtg.join({
      sdkKey: SDKKEY,
      signature: signature,
      meetingNumber: zoomConfig.meetingNumber,
      passWord: zoomConfig.password,
      userName: zoomConfig.userName,
      success: (joinSuccess) => {
        console.log("Zoom JOIN Success", joinSuccess);
      },
      error: (joinError) => {
        console.error("Zoom JOIN Error", joinError);
      },
    });
  },
  error: (initError) => {
    console.error("Zoom INIT Error", initError);
  },
});
  };

  return (
    <div>
      <h2>Join Zoom Meeting</h2>
      <input
        type="text"
        placeholder="Meeting ID"
        value={meetingNumber}
        onChange={(e) => setMeetingNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Meeting Password"
        value={passWord}
        onChange={(e) => setPassWord(e.target.value)}
      />
      <button onClick={joinMeeting}>Join Meeting</button>
    </div>
  );
}

export default ZoomMeeting;
