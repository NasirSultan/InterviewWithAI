import { useEffect } from "react";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.14.0/lib", "/av");
ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

const ZoomMeeting = () => {
  const meetingNumber = "YOUR_MEETING_ID";
  const password = "YOUR_PASSWORD";
  const userName = "Guest";
  const sdkKey = "YOUR_CLIENT_ID";

  useEffect(() => {
    const startMeeting = async () => {
      const res = await fetch("http://localhost:5000/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingNumber, role: 0 }),
      });
      const { signature } = await res.json();

      ZoomMtg.i18n.load("en-US");
      ZoomMtg.i18n.reload("en-US");

      ZoomMtg.init({
        leaveUrl: "https://zoom.us",
        success: () => {
          ZoomMtg.join({
            sdkKey,
            signature,
            meetingNumber,
            passWord: password,
            userName,
            success: () => console.log("Join success"),
            error: (err) => console.error("Join error", err),
          });
        },
        error: (err) => console.error("Init error", err),
      });
    };

    startMeeting();
  }, []);

  return (
    <>
      <div id="zmmtg-root"></div>
      <div id="aria-notify-area"></div>
    </>
  );
};

export default ZoomMeeting;
